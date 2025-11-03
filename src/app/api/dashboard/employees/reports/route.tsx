import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const prisma = new PrismaClient();

// GET /api/employees/download?type=pdf OR excel
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "excel";

    const employees = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { message: "No employees found" },
        { status: 404 }
      );
    }

    if (type === "excel") {
      // Create Excel file
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Employees");

      sheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 25 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Department", key: "department", width: 20 },
        { header: "Position", key: "position", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Joining Date", key: "dateOfJoining", width: 20 },
      ];

      employees.forEach((emp) => {
        sheet.addRow({
          ...emp,
          dateOfJoining: emp.dateOfJoining
            ? new Date(emp.dateOfJoining).toLocaleDateString()
            : "-",
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=employees.xlsx",
        },
      });
    }

    if (type === "pdf") {
      //Create PDF
      const doc = new jsPDF();

      doc.text("Employee Directory", 14, 15);
      const tableData = employees.map((e) => [
        e.id,
        e.name,
        e.email,
        e.phone || "-",
        e.department || "-",
        e.position || "-",
        e.status || "-",
        e.dateOfJoining
          ? new Date(e.dateOfJoining).toLocaleDateString()
          : "-",
      ]);

      autoTable(doc, {
        head: [
          [
            "ID",
            "Name",
            "Email",
            "Phone",
            "Department",
            "Position",
            "Status",
            "Joining Date",
          ],
        ],
        body: tableData,
        startY: 20,
      });

      const pdfBuffer = doc.output("arraybuffer");
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=employees.pdf",
        },
      });
    }

    return NextResponse.json({ message: "Invalid download type" }, { status: 400 });
  } catch (err: any) {
    console.error("Download error:", err);
    return NextResponse.json(
      { message: "Failed to generate file", error: err.message },
      { status: 500 }
    );
  }
}
