'use client';

import { motion } from "framer-motion";
import { PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import MarkAttendance from "../attendancetracker/markattendance";
import EditAttendance from "./editattendance";

interface Attendance {
  siteName: string;
  user: any;
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workHr: string;
  location: string;
  status: string;
}

export default function DashboardPage() {
  const [date, setDate] = useState("");
  const [employee, setEmployee] = useState("all");
  const [status, setStatus] = useState("all");
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/markattendance?date=${date}&employee=${employee}&status=${status}`
      );
      const data = await res.json();
      if (data.success) {
        setAttendanceList(data.data);
      } else {
        alert("Error fetching attendance");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);
  
  const handleFilter = async () => {
    await fetchAttendance();
  };

  const handleDownload = async (type: string) => {
    if (type === "all") return;

    const query = new URLSearchParams({
      type,
      date,
      employee,
      status,
    });

    const res = await fetch(`/api/dashboard/markattendance/reports?${query.toString()}`);

    if (!res.ok) {
      alert("Failed to download file");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = type === "pdf" ? "attendance-report.pdf" : "attendance-report.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Delete record
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(`/api/dashboard/markattendance/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        alert("Attendance deleted successfully");
        fetchAttendance(); 
      } else {
        alert("Error deleting record");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-start px-3 sm:px-6 md:px-10 lg:px-12 py-5 w-full max-w-8xl mx-auto bg-white text-gray-700">
        
        {/* Header */}
        <div className="mb-10 rounded-lg shadow-lg bg-white border border-red-400 p-2 md:p-2.5 mt-5">
          <h2 className="text-lg sm:text-xl md:text-xl font-semibold">
            Attendance Tracker
          </h2>
        </div>

        {/* Buttons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          <div>
            <MarkAttendance/>
          </div>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5 lg:gap-6 p-5 mt-8 bg-white shadow-lg rounded-lg border border-gray-300 w-full">
          
          {/* Date Picker */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border border-red-200 rounded-md shadow-md"
            />
          </div>

          {/* Employee Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Employee</label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="p-2 border border-red-200 rounded-md shadow-md"
            >
              <option value="all">All Employees</option>

              {/* Dynamically map unique employee names from attendanceList */}
              {Array.from(new Set(attendanceList.map((a) => a.user?.name))).map(
                (name) =>
                  name && (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  )
              )}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border border-red-200 rounded-md shadow-md"
            >
              <option value="all">All</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>

          {/* Apply Filter Button */}
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="bg-sky-300 text-white px-4 py-2 rounded-md shadow-md w-full"
            >
              Apply Filters
            </button>
          </div>

          {/* Download Dropdown */}
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
        
        {/* Table Section */}
        <div className="overflow-x-auto rounded-box border border-base-content/30 border-t border-t-gray-300 bg-base-50 p-5 mt-5 w-full shadow-lg text-gray-700">
          <table className="table">
            <thead className="bg-white text-gray-600">
              <tr className="border-b border-b-gray-300">
                <th>Id</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Checkin</th>
                <th>Checkout</th>
                <th>Work Hr</th>
                <th>Office/Site</th>
                <th>Site Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">Loading...</td>
                </tr>
              ) : attendanceList.length > 0 ? (
                attendanceList.map((att, index) => {
                  let locationColor = "bg-red-100 text-red-700";
                  if (att.location?.toLowerCase() === "office") {
                    locationColor = "bg-green-100 text-green-700";
                  } else if (att.location?.toLowerCase() === "site") {
                    locationColor = "bg-orange-100 text-orange-700";
                  }

                  return (
                    <tr key={att.id} className="hover:bg-gray-50">
                      <td>{index + 1}</td>
                      <td>{att.user?.name}</td>
                      <td>{new Date(att.date).toLocaleDateString()}</td>
                      <td>{att.checkInTime}</td>
                      <td>{att.checkOutTime}</td>
                      <td>{att.workHr}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${locationColor}`}>
                          {att.location || "None"}
                        </span>
                      </td>
                      <td>{att.siteName || "-"}</td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            att.status === "PRESENT"
                              ? "bg-green-100 text-green-700"
                              : att.status === "ABSENT"
                              ? "bg-red-100 text-red-700"
                              : att.status === "HALF_DAY"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-200 text-orange-600"
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>

                      <td className="flex space-x-3">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAttendance(att);
                            (document.getElementById("edit_modal") as HTMLDialogElement)?.showModal();
                          }}
                          className="btn-sm text-green-600 hover:text-blue-800"
                        >
                          <PencilLine />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(att.id)}
                          className="btn-sm text-red-600 hover:text-red-800"
                        >
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    No attendance data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedAttendance && (
        <EditAttendance
          attendance={selectedAttendance}
          onUpdated={fetchAttendance}
        />
      )}
    </>
  );
}
