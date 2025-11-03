'use client';

import { useState, useEffect } from "react";

interface EditAttendanceProps {
  attendance: any;
  onUpdated: () => void;
}

export default function EditAttendance({ attendance, onUpdated }: EditAttendanceProps) {
  const [userName, setUserName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [siteName, setSiteName] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  useEffect(() => {
    if (attendance) {
      setUserName(attendance?.user?.name || "");
      setDate(attendance?.date ? new Date(attendance.date).toISOString().split("T")[0] : "");
      setLocation(attendance?.location || "");
      setSiteName(attendance?.siteName || "");
      setCheckInTime(attendance?.checkInTime || "");
      setCheckOutTime(attendance?.checkOutTime || "");
    }
  }, [attendance]);

  const handleSubmit = async () => {
    if (!userName || !date) {
      alert("Please fill required fields");
      return;
    }

    try {
      const res = await fetch(`/api/dashboard/markattendance/${attendance.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          date,
          checkin: checkInTime,
          checkout: checkOutTime,
          location,
          siteName: location === "site" ? siteName : "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Attendance updated successfully");
        (document.getElementById("edit_modal") as HTMLDialogElement)?.close();
        onUpdated();
      } else {
        alert("Error updating record ");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <dialog id="edit_modal" className="modal">
      <div className="modal-box bg-white text-black max-w-md w-full">
        <h3 className="font-bold text-lg mb-4 text-center">Edit Attendance</h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Employee Name</label>
            <input
              type="text"
              value={userName}
              disabled
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Location</label>
            <select
              value={location}
              onChange={(e) => {
                const value = e.target.value;
                setLocation(value);
                if (value !== "site") {
                  setSiteName(""); 
                }
              }}
              className="select select-bordered w-full"
            >
              <option value="">Select Location</option>
              <option value="office">Office</option>
              <option value="site">Site</option>
              <option value="diac">DIAC</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {location === "site" && (
            <div>
              <label className="text-sm font-semibold">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold">Check-in Time</label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Check-out Time</label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="modal-action">
          <button onClick={handleSubmit} className="btn btn-success text-white">
            Save Changes
          </button>
          <form method="dialog">
            <button className="btn btn-error text-white">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
