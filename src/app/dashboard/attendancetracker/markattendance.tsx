'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkAttendance() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [siteName, setSiteName] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [workhr, setWorkhr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !date || !checkin) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/dashboard/markattendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          date,
          checkin,
          checkout,
          location,
          siteName: location === "site" ? siteName : "",
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Attendance marked successfully!");
        setUserName("");
        setDate("");
        setLocation("");
        setSiteName("");
        setCheckin("");
        setCheckout("");
        setWorkhr("");

        const modalCheckbox = document.getElementById("attendance_modal") as HTMLInputElement;
        if (modalCheckbox) modalCheckbox.checked = false;

        router.refresh();
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert(" Something went wrong while submitting attendance!");
    }
  };

  return (
    <>
      {/* Open modal Button */}
      <label
        htmlFor="attendance_modal"
        className="btn bg-green-50 hover:bg-blue-100 text-gray-800 shadow-md font-semibold rounded-lg border border-orange-500"
      >
        Mark Attendance
      </label>

      {/* Modal */}
      <input type="checkbox" id="attendance_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl bg-white shadow-lg rounded-lg">
          <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">
            Mark Your Attendance
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">
            
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 border-gray-200 rounded-2xl bg-white"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl border-gray-200 bg-white text-gray-500"
              />
            </div>

            {/* Check-in */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Check-in Time</label>
              <input
                type="time"
                required
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white text-gray-500"
              />
            </div>

            {/* Check-out */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Check-out Time</label>
              <input
                type="time"
                placeholder="Enter checkout time"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white text-gray-500"
              />
            </div>

            {/* Work Hours */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Work Hours (auto)</label>
              <input
                type="text"
                placeholder="Auto-calculated work hours"
                readOnly
                value={workhr}
                className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white text-gray-500"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocation(value);
                  if (value !== "site") {
                    setSiteName("");
                  }
                }}
                className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white text-gray-500"
                required
              >
                <option value="">Select Location</option>
                <option value="office">Office</option>
                <option value="site">Site</option>
                <option value="diac">DIAC</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* Site Name (only visible if location is site) */}
            {location === "site" && (
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Site Name</label>
                <input
                  type="text"
                  placeholder="Enter Site Name"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white text-gray-500"
                />
              </div>
            )}

            {/* Submit */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                className="btn bg-green-600 text-white w-full shadow-md p-3 rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </form>

          <div className="modal-action">
            <label
              htmlFor="attendance_modal"
              className="btn rounded-md bg-sky-100 text-gray-800 hover:bg-green-100 shadow-md font-semibold"
            >
              Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
