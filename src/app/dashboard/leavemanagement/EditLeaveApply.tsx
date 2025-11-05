'use client';

import { useState, useEffect } from "react";

export default function EditLeaveModal({
  leavemanagement,
  onClose,
  onUpdate,
}: {
  leavemanagement: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [form, setForm] = useState({
    userName: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    status: "",
    reason: "",
  });

  // Prefill modal with existing data
  useEffect(() => {
    if (leavemanagement) {
      setForm({
        userName:
          leavemanagement.user?.name || leavemanagement.userName || "",
        leaveType: leavemanagement.leaveType || "",
        startDate: leavemanagement.startDate
          ? leavemanagement.startDate.split("T")[0]
          : "",
        endDate: leavemanagement.endDate
          ? leavemanagement.endDate.split("T")[0]
          : "",
        numberOfDays: leavemanagement.numberOfDays?.toString() || "",
        status: leavemanagement.status || "",
        reason: leavemanagement.reason || "",
      });
    }
  }, [leavemanagement]);

  // Auto-calculate number of days whenever dates change
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end >= start) {
        const diffTime = end.getTime() - start.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setForm((prev) => ({ ...prev, numberOfDays: days.toString() }));
      } else {
        setForm((prev) => ({ ...prev, numberOfDays: "" }));
      }
    }
  }, [form.startDate, form.endDate]);

  // Handle input change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //  Handle update 
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `/api/dashboard/leavemanagement/${leavemanagement.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Failed to update leave");

      onUpdate();
      onClose();
      alert("Leave updated successfully!");
    } catch (err) {
      console.error("Error updating leave:", err);
      alert("Failed to update leave!");
    }
  };

  if (!leavemanagement) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 text-gray-800">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl shadow-lg animate-fadeIn">
        <h2 className="text-xl font-semibold text-center mb-4">
          Edit Leave
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* User Name (Read-Only) */}
          <input
            name="userName"
            type="text"
            value={form.userName}
            className="input input-bordered cursor-not-allowed"
            disabled
          />

          {/* Leave Type */}
          <select
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
            className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white border-gray-300"
          >
            <option value="">Leave Type</option>
            <option value="SICK">Sick Leave</option>
            <option value="CASUAL">Casual Leave</option>
          </select>

          {/* Dates */}
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-gray-300"
          />

          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-gray-300"
          />

          {/*uto-calculated Number of Days */}
          <input
            name="numberOfDays"
            type="number"
            value={form.numberOfDays}
            readOnly
            className="input input-bordered bg-gray-100 cursor-not-allowed w-full shadow-md p-3 rounded-2xl"
          />

          {/* Status */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white border-gray-300"
          >
            <option value="">Select Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Reason */}
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Reason (required)"
            required
            className="textarea textarea-bordered w-full md:col-span-2 shadow-md p-3 rounded-2xl bg-white border-gray-300"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-sky-200 hover:bg-gray-300 text-black border-gray-400 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-green-600 text-white hover:bg-green-700 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
