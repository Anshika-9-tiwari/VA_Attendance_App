"use client";
import { useState, useEffect } from "react";

export default function AttendanceReportPage() {
  const [month, setMonth] = useState("2025-10");
  const [employee, setEmployee] = useState("all");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Attendance Report
  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/attendancereports?month=${month}&employee=${employee}`
      );
      const data = await res.json();

      if (data.success) {
        setAttendanceData(data.data);
      } else {
        alert("Error fetching attendance report");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // download reports
  const handleDownload = async (type: string) => {
  const res = await fetch(
    `/api/dashboard/attendancereports/downloadreports?type=${type}&month=${month}&employee=${employee}`
  );
  const blob = await res.blob();
  const fileName =
    type === "pdf"
      ? `AttendanceReport_${month}.pdf`
      : `AttendanceReport_${month}.xlsx`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
};


  return (
    <div className="px-5 md:px-10 py-16 max-w-8xl mx-auto bg-white text-gray-800">
      {/* Header */}
      <div className="mb-8 p-4 rounded-lg shadow-lg bg-sky-50 border border-gray-200">
        <h1 className="text-2xl font-bold">Attendance Report</h1>
        <p className="text-sm text-gray-600">
          View monthly attendance summary and download reports.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 shadow-lg rounded-lg border border-gray-300">
        <div>
          <label className="text-sm font-semibold">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Employee</label>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="all">All Employees</option>
            {Array.from(new Set(attendanceData.map((l) => l.employee))).map(
              (employeeName) =>
                employeeName && (
                  <option key={employeeName} value={employeeName}>
                    {employeeName}
                  </option>
                )
            )}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchReport}
            className="bg-sky-500 text-white px-4 py-2 rounded-md w-full hover:bg-sky-600"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </div>

        <div className="flex items-end">
          <select
            onChange={(e) => handleDownload(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="all">Download</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6 rounded-lg shadow-lg border border-gray-300 bg-white p-5">
        <table className="table w-full">
          <thead className="text-gray-500">
            <tr className="border-b-gray-300">
              <th>ID</th>
              <th>Employee</th>
              <th>Present Days</th>
              <th>Absent Days</th>
              <th>Leave Days</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  {loading ? "Loading..." : "No Data Found"}
                </td>
              </tr>
            ) : (
              attendanceData.map((a) => {
                const total = a.present + a.absent + a.leave;
                const percentage = total > 0 ? ((a.present / total) * 100).toFixed(1) : "0";
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td>{a.id}</td>
                    <td>{a.employee}</td>
                    <td className="text-green-600 font-semibold">{a.present}</td>
                    <td className="text-red-600 font-semibold">{a.absent}</td>
                    <td className="text-yellow-600 font-semibold">{a.leave}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
