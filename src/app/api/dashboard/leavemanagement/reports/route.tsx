import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "excel"; // excel | pdf
    const employee = searchParams.get("employee") || "all";
    const status = searchParams.get("status") || "all";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    // Filter setup
    const where: any = {};
    if (employee !== "all") {
      where.user = { name: { contains: employee, mode: "insensitive" } };
    }
    if (status !== "all") {
      where.status = status;
    }
    if (from && to) {
      where.startDate = { gte: new Date(from) };
      where.endDate = { lte: new Date(to) };
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        user: { select: { name: true } },
      },
      orderBy: { id: "asc" },
    });

    if (!leaves || leaves.length === 0) {
      return NextResponse.json({ message: "No leave records found" }, { status: 404 });
    }

    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // ================================
    // EXCEL EXPORT
    // ================================
    if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Leave Report");

      // Title
      sheet.mergeCells("A1:G1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = "Velocity Automation - Leave Report";
      titleCell.font = { bold: true, size: 18 };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // Generated on
      sheet.mergeCells("A2:G2");
      const dateCell = sheet.getCell("A2");
      dateCell.value = `Generated on: ${today}`;
      dateCell.font = { italic: true, size: 12 };
      dateCell.alignment = { horizontal: "center" };

      sheet.addRow([]);

      // Table Header
      const headerRow = sheet.addRow([
        "Employee Name",
        "Leave Type",
        "Start Date",
        "End Date",
        "No. of Days",
        "Status",
        "Reason",
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Leave Data
      leaves.forEach((item) => {
        const row = sheet.addRow([
          item.user?.name || "-",
          item.leaveType || "-",
          new Date(item.startDate).toLocaleDateString(),
          new Date(item.endDate).toLocaleDateString(),
          item.numberOfDays || "-",
          item.status || "-",
          item.reason || "-",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Auto-fit columns
      sheet.columns.forEach((col) => {
        if (!col) return;
        let maxLength = 0;
        (col as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
          const value = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, value.length);
        });
        col.width = maxLength < 12 ? 12 : maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="leave_report.xlsx"',
        },
      });
    }

    // ================================
    // PDF EXPORT
    // ================================
    if (type === "pdf") {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text("Velocity Automation", 14, 15);
      doc.setFontSize(12);
      doc.text("Leave Report", 14, 23);
      doc.setFontSize(10);
      doc.text(`Generated on: ${today}`, 14, 30);

      const tableData = leaves.map((item, index) => [
        index + 1,
        item.user?.name || "-",
        item.leaveType || "-",
        new Date(item.startDate).toLocaleDateString(),
        new Date(item.endDate).toLocaleDateString(),
        item.numberOfDays || "-",
        item.status || "-",
        item.reason || "-",
      ]);

      autoTable(doc, {
        head: [
          [
            "ID",
            "Employee",
            "Leave Type",
            "Start Date",
            "End Date",
            "Days",
            "Status",
            "Reason",
          ],
        ],
        body: tableData,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="leave_report.pdf"',
        },
      });
    }

    return NextResponse.json({ message: "Invalid export type" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting leave report:", error);
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}
