'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PencilLine, Trash2 } from "lucide-react";
import AddEmployee from "../employee/AddEmployee";
import EditEmployeeModal from "./Editemployee";

export default function DashboardPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    await fetchEmployees();
  };

  // DELETE employee
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const res = await fetch(`/api/dashboard/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete employee");
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      alert("🗑️ Employee deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee!");
    }
  };

  const handleDownload = async (type: string) => {
  if (type === "all") return;

  try {
    const res = await fetch(`/api/dashboard/employees/reports?type=${type}`);
    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "pdf" ? "employees.pdf" : "employees.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
};


  return (
    <>
      <div className="flex flex-col justify-center items-start px-3 sm:px-6 md:px-10 lg:px-12 py-5 w-full max-w-8xl mx-auto">
        <div className="mb-10 rounded-lg shadow-lg bg-white border border-red-400 p-2 mt-5">
          <h2 className="text-lg sm:text-xl md:text-xl font-semibold">
            Employee Directory
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <AddEmployee onAdd={handleAddEmployee} />
          </div>

          {/* Download */}
          <motion.div whileHover={{ scale: 1.05 }}>
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
          </motion.div>
        </div>

        <div className="overflow-x-auto rounded-box border border-base-content/15 bg-base-100 p-5 mt-5 w-full shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
            </div>
          ) : employees.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No employees found.</p>
          ) : (
            <table className="table shadow-lg">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-gray-50 text-center">
                    <th>{emp.id}</th>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone || "-"}</td>
                    <td>{emp.department || "-"}</td>
                    <td>{emp.position || "-"}</td>
                    <td>
                      {emp.dateOfJoining
                        ? new Date(emp.dateOfJoining).toLocaleDateString()
                        : "-"}
                    </td>
                    <td
                      className={
                        emp.status === "ACTIVE"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {emp.status}
                    </td>
                    <td className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="btn btn-ghost btn-sm text-green-600"
                      >
                        <PencilLine />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="btn btn-ghost btn-sm text-red-700"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={fetchEmployees}
        />
      )}
    </>
  );
}
