'use client';
import { useEffect, useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import ApplyLeave from "./ApplyLeave";
import EditLeaveApply from "./EditLeaveApply";

export default function ReportPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [employee, setEmployee] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
  setLoading(true);
  try {
  const res = await fetch(
    `/api/dashboard/leavemanagement?from=${fromDate}&to=${toDate}&employee=${employee}&status=${status}`
  );
  const data = await res.json();
  setLeaves(data);
  } catch (err) {
  console.error("Error fetching leaves:", err);
  } finally {
  setLoading(false);
  }
  };

  const handleFilter = async () => {
  await fetchLeaves();
  };

  // Fetch  leaves
  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDownload = async (type: string) => {
    if (type === "all") return;

    const query = new URLSearchParams({
      type,
      from: fromDate,
      to: toDate,
      employee,
      status,
    });

    const res = await fetch(`/api/dashboard/leavemanagement/reports?${query.toString()}`);

    if (!res.ok) {
      alert("Failed to download file");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = type === "pdf" ? "leave-report.pdf" : "leave-report.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure to delete?")) return;
    await fetch("/api/dashboard/leavemanagement", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchLeaves();
  };

  return (
    <>
    <div className="flex flex-col justify-center items-start px-3 sm:px-6 md:px-10 lg:px-12 py-5 w-full max-w-8xl mx-auto overflow-hidden h-screen bg-white text-gray-800">
      {/* Header */}
      <div className="mb-10 rounded-lg shadow-lg bg-white border border-red-400 p-3 md:p-3.5 mt-5 hover:bg-blue-50">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Leave Management</h2>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
        <ApplyLeave />
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-10 p-5 mt-4 bg-white shadow-lg rounded-lg border border-gray-300 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border border-red-200 rounded-md shadow-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border border-red-200 rounded-md shadow-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Employee</label>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="p-2 border border-red-200 rounded-md shadow-md"
          >
            <option value="all">All Employees</option>
            {Array.from(new Set(leaves.map((l) => l.user?.name))).map(
              (name) => name && <option key={name} value={name}>{name}</option>
            )}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border border-red-200 rounded-md shadow-md"
          >
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleFilter}
            className="bg-sky-500 text-white px-4 py-2 rounded-md shadow-md w-full hover:bg-sky-600"
          >
            Apply Filters
          </button>
        </div>

        <div className="flex items-end">
          <select
            defaultValue="all"
            onChange={(e) => handleDownload(e.target.value)}
            className="p-2 border border-blue-300 rounded-md shadow-lg"
          >
            <option value="all">Download</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-box border border-base-content/20 bg-base-50 p-5 mt-5 w-full shadow-lg border-t-2 border-t-gray-200">
        <table className="table w-full">
          <thead className="text-gray-600">
            <tr className="border-b-gray-300">
              <th>ID</th>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
             {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">Loading...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">No Data Found</td>
                </tr>
              ) : (
              leaves.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td>{r.id}</td>
                  <td>{r.user?.name}</td>
                  <td>{r.leaveType}</td>
                  <td>{new Date(r.startDate).toLocaleDateString()}</td>
                  <td>{new Date(r.endDate).toLocaleDateString()}</td>
                  <td>{r.numberOfDays}</td>
                  <td>{r.reason}</td>
                  <td className={
                    r.status === "APPROVED" ? "text-green-600 font-semibold"
                    : r.status === "PENDING" ? "text-yellow-600 font-semibold"
                    : "text-red-600 font-semibold"
                  }>
                    {r.status}
                  </td>
                  <td className="flex gap-3 justify-center">
                    <button
                        onClick={() => setSelectedLeave(r)}
                        className="btn btn-ghost btn-sm text-green-600"
                      >
                        <PencilLine />
                      </button>
                    <button className="btn-sm text-red-700" onClick={() => handleDelete(r.id)}><Trash2 /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
      {selectedLeave && (
        <EditLeaveApply
          leavemanagement={selectedLeave} 
          onClose={() => setSelectedLeave(null)}
          onUpdate={() => {
            fetchLeaves();
          }}
        />
      )
      }
    </>
  );
}
