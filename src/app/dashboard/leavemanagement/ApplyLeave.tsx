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
        alert("Leave applied successfully!");
        router.refresh();
      } else {
        alert(data.message || "Error applying leave");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }

    // Reset form
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
      <label htmlFor="attendance_modal" className="btn bg-green-50 hover:bg-blue-50 shadow-md font-semibold rounded-lg">
        Apply For Leave
      </label>

      {/* Modal */}
      <input type="checkbox" id="attendance_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl">
          <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">Apply for Leave</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl"
            />

            <select
              required
              value={leavetype}
              onChange={(e) => setLeaveType(e.target.value)}
              className="select select-bordered w-full shadow-md p-3 rounded-2xl"
            >
              <option value="">Leave Type</option>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
            </select>

            <input
              type="date"
              placeholder="From Date"
              required
              value={fromdate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl"
            />

            <input
              type="date"
              placeholder="To Date"
              required
              value={todate}
              onChange={(e) => setToDate(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl"
            />

            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full shadow-md p-3 rounded-2xl"
            >
              <option value="">Select Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>

            <textarea
              placeholder="Reason for Leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="textarea textarea-bordered w-full md:col-span-2 shadow-md p-3 rounded-2xl"
            />

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
            <label htmlFor="attendance_modal" className="btn rounded-md bg-blue-200 hover:bg-green-100 shadow-md font-semibold">
              Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
