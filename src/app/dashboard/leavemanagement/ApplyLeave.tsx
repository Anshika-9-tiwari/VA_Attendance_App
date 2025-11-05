'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyLeave() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [leavetype, setLeaveType] = useState('');
  const [fromdate, setFromDate] = useState('');
  const [todate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !leavetype || !fromdate || !todate || !reason || !status) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/leavemanagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          leaveType: leavetype,
          startDate: fromdate,
          endDate: todate,
          status,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Leave applied successfully!");
        router.refresh();
      } else {
        alert(data.message || "Error applying leave");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }

    setUserName('');
    setLeaveType('');
    setFromDate('');
    setToDate('');
    setStatus('');
    setReason('');

    const modalCheckbox = document.getElementById("attendance_modal") as HTMLInputElement;
    if (modalCheckbox) modalCheckbox.checked = false;
  };

  return (
    <>
      {/* Open modal Button */}
      <label
        htmlFor="attendance_modal"
        className="btn bg-sky-50 hover:bg-blue-100 border-red-300 text-gray-600 shadow-md font-semibold rounded-lg"
      >
        Apply For Leave
      </label>

      {/* Modal */}
      <input type="checkbox" id="attendance_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl bg-white">
          <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">Apply for Leave</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
              />
            </div>

            {/* Leave Type */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Leave Type</label>
              <select
                required
                value={leavetype}
                onChange={(e) => setLeaveType(e.target.value)}
                className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
              >
                <option value="">Select Leave Type</option>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">From Date</label>
              <input
                type="date"
                required
                value={fromdate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">To Date</label>
              <input
                type="date"
                required
                value={todate}
                onChange={(e) => setToDate(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Status</label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
              >
                <option value="">Select Status</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Reason */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-semibold mb-1">Reason</label>
              <textarea
                placeholder="Enter reason for leave"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="textarea textarea-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="btn bg-green-600 text-white w-full shadow-md p-3 rounded-md hover:bg-green-700"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>

          <div className="modal-action">
            <label
              htmlFor="attendance_modal"
              className="btn rounded-md bg-blue-200 hover:bg-green-100 shadow-md font-semibold text-black border-orange-300"
            >
              Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
