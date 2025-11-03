import { NextResponse } from "next/server";
import { PrismaClient, Prisma, AttendanceStatus } from "@prisma/client";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "excel"; // pdf | excel
    const month = searchParams.get("month") || "";
    const employee = searchParams.get("employee") || "all";

    // Convert month (YYYY-MM) to start/end dates
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // ===============================
    // FETCH ATTENDANCE DATA
    // ===============================
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lt: endDate },
        ...(employee !== "all" && {
          user: { name: { contains: employee, mode: "insensitive" } },
        }),
      },
      include: { user: { select: { name: true } } },
    });

    const leaves = await prisma.leave.findMany({
      where: {
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        status: "APPROVED",
        ...(employee !== "all" && {
          user: { name: { contains: employee, mode: "insensitive" } },
        }),
      },
      include: { user: { select: { name: true } } },
    });

    // ===============================
    // CALCULATE SUMMARY
    // ===============================
    const employeeMap: Record<string, any> = {};

    attendances.forEach((att) => {
      const emp = att.user?.name || "Unknown";
      if (!employeeMap[emp]) {
        employeeMap[emp] = { present: 0, absent: 0, leave: 0 };
      }
      if (att.status === AttendanceStatus.PRESENT) employeeMap[emp].present++;
      else if (att.status === AttendanceStatus.ABSENT) employeeMap[emp].absent++;
    });

    leaves.forEach((l) => {
      const emp = l.user?.name || "Unknown";
      if (!employeeMap[emp]) {
        employeeMap[emp] = { present: 0, absent: 0, leave: 0 };
      }
      employeeMap[emp].leave += l.numberOfDays || 0;
    });

    const reportData = Object.keys(employeeMap).map((emp) => {
      const { present, absent, leave } = employeeMap[emp];
      const total = present + absent + leave;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
      return { employee: emp, present, absent, leave, percentage };
    });

    if (reportData.length === 0) {
      return NextResponse.json(
        { message: "No attendance data found for selected filters" },
        { status: 404 }
      );
    }

    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // ===============================
    // EXCEL EXPORT
    // ===============================
    if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance Report");

      // Header
      sheet.mergeCells("A1:E1");
      const title = sheet.getCell("A1");
      title.value = "Velocity Automation - Monthly Attendance Report";
      title.font = { bold: true, size: 16 };
      title.alignment = { horizontal: "center" };

      sheet.mergeCells("A2:E2");
      const dateCell = sheet.getCell("A2");
      dateCell.value = `Month: ${month} | Generated on: ${today}`;
      dateCell.font = { italic: true, size: 11 };
      dateCell.alignment = { horizontal: "center" };

      sheet.addRow([]);

      // Table header
      const headerRow = sheet.addRow([
        "Employee",
        "Present Days",
        "Absent Days",
        "Leave Days",
        "Attendance %",
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      // Table data
      reportData.forEach((row) => {
        sheet.addRow([
          row.employee,
          row.present,
          row.absent,
          row.leave,
          `${row.percentage}%`,
        ]);
      });

      // Format columns
      sheet.columns.forEach((col) => {
        let maxLen = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          maxLen = Math.max(maxLen, val.length);
        });
        col.width = maxLen < 10 ? 10 : maxLen + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="attendance_report_${month}.xlsx"`,
        },
      });
    }

    // ===============================
    // PDF EXPORT
    // ===============================
    if (type === "pdf") {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Velocity Automation - Monthly Attendance Report", 14, 15);
      doc.setFontSize(11);
      doc.text(`Month: ${month}`, 14, 22);
      doc.text(`Generated on: ${today}`, 14, 28);

      const tableData = reportData.map((item, i) => [
        i + 1,
        item.employee,
        item.present,
        item.absent,
        item.leave,
        `${item.percentage}%`,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["ID", "Employee", "Present", "Absent", "Leave", "Attendance %"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9 },
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="attendance_report_${month}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    return NextResponse.json(
      { error: "Failed to generate attendance report" },
      { status: 500 }
    );
  }
}
