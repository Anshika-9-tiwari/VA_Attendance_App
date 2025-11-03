import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "excel";
    const date = searchParams.get("date") || "";
    const employee = searchParams.get("employee") || "all";
    const status = searchParams.get("status") || "all";

    //  filters
    const where: any = {};
    if (date) where.date = new Date(date);
    if (status !== "all") where.status = status;
    if (employee !== "all") {
      where.user = { name: { contains: employee, mode: "insensitive" } };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: { select: { name: true } },
      },
      orderBy: { id: "asc" },
    });

    if (!attendance || attendance.length === 0) {
      return NextResponse.json(
        { message: "No records found" },
        { status: 404 }
      );
    }

    // Date for header
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });


  //  EXCEL EXPORT
  // ================================
  if (type === "excel") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance Report");

  // Title
  sheet.mergeCells("A1:G1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Velocity Automation - Attendance Report";
  titleCell.font = { bold: true, size: 18 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // Generated on
  sheet.mergeCells("A2:G2");
  const dateCell = sheet.getCell("A2");
  dateCell.value = `Generated on: ${new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
  dateCell.font = { italic: true, size: 12 };
  dateCell.alignment = { horizontal: "center" };

  sheet.addRow([]);

  // Table Header
  const headerRow = sheet.addRow([
    "Employee Name",
    "Date",
    "Check-In",
    "Check-Out",
    "Work Hours",
    "Status",
    "Location",
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

  // Employee Data
  attendance.forEach((item) => {
    const row = sheet.addRow([
      item.user?.name || "-",
      new Date(item.date).toLocaleDateString(),
      item.checkInTime
        ? new Date(item.checkInTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      item.checkOutTime
        ? new Date(item.checkOutTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      item.workHr || "-",
      item.status || "-",
      item.location || "-",
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

  // Auto fit column widths
  sheet.columns.forEach((col) => {
    if (!col?.eachCell) return;
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });
    col.width = maxLength < 12 ? 12 : maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="attendance_report.xlsx"',
    },
  });
  }

  // PDF EXPORT
  // ================================
  if (type === "pdf") {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Velocity Automation", 14, 15);
    doc.setFontSize(12);
    doc.text("Attendance Report", 14, 23);
    doc.setFontSize(10);
    doc.text(`Generated on: ${today}`, 14, 30);

    const tableData = attendance.map((item, index) => [
      index + 1,
      item.user?.name || "-",
      new Date(item.date).toLocaleDateString(),
      item.checkInTime
        ? new Date(item.checkInTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      item.checkOutTime
        ? new Date(item.checkOutTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      item.workHr || "-",
      item.status || "-",
      item.location || "-",
    ]);

    autoTable(doc, {
      head: [
        [
          "ID",
          "Employee",
          "Date",
          "Check In",
          "Check Out",
          "Work Hours",
          "Status",
          "Location",
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
        "Content-Disposition": 'attachment; filename="attendance_report.pdf"',
      },
    });
  }

  // Default response
  return NextResponse.json({ message: "Invalid export type" }, { status: 400 });
} catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}
