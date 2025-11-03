import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Export to Excel
export async function exportWorkReportsToExcel(reports: any[]) {
  if (reports.length === 0) {
    alert("No reports to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Work Reports");

  // Headline
  sheet.mergeCells("A1:T1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Work Report Summary";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  sheet.addRow([]);

  // Dynamic columns
  const columns = Object.keys(reports[0]).map((key) => ({
    header: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
    key: key,
    width: 18,
  }));

  sheet.columns = columns;

  // Header styling
  const headerRow = sheet.addRow(columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E88E5" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // Add data rows
  reports.forEach((r, i) => {
    const row = sheet.addRow(Object.values(r));
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        };
      });
    }
  });

  // Borders
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFBDBDBD" } },
        left: { style: "thin", color: { argb: "FFBDBDBD" } },
        bottom: { style: "thin", color: { argb: "FFBDBDBD" } },
        right: { style: "thin", color: { argb: "FFBDBDBD" } },
      };
    });
  });

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "WorkReports.xlsx";
  link.click();
}

// Export to PDF
export function exportWorkReportsToPDF(reports: any[]) {
  if (!reports || reports.length === 0) {
    alert("No reports to export");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape",format: "a3" });

  // Title / Headline
  doc.setFontSize(18);
  doc.text("Work Report Summary", 140, 15, { align: "center" });

  // Get column headers dynamically from the first report
  const headers = Object.keys(reports[0]).filter(
    (key) => key !== "id" && key !== "createdAt" && key !== "updatedAt"
  );

  // Prepare table rows properly (matching headers)
  const body = reports.map((report) =>
    headers.map((header) => {
      const value = report[header];
      if (value instanceof Date) return value.toLocaleString();
      if (typeof value === "boolean") return value ? "Yes" : "No";
      return value ?? "";
    })
  );

  // Use jspdf-autotable
  autoTable(doc, {
    head: [headers.map((h) =>
      h.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    )],
    body,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 136, 229],
      textColor: [255, 255, 255],
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Download the file
  doc.save("WorkReports.pdf");
}

