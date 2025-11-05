'use client';
import { useState } from "react";

export default function AddEmployee({ onAdd }: { onAdd: (employee: any) => void }) {
  const [userName, setUserName] = useState('');
  const [date, setDate] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !date || !department || !position || !email || !phone || !address || !status) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      // Send to backend
      const res = await fetch("/api/dashboard/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email,
          phone,
          address,
          department,
          position,
          status: status === "active" ? "ACTIVE" : "INACTIVE",
          dateOfJoining: date,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add employee");
        return;
      }

      alert("Employee added successfully!");

      // Update parent table instantly
      onAdd({
        name: userName,
        phone,
        department,
        position,
        joining: new Date(date).toLocaleDateString(),
        status: status === "active" ? "Active" : "Inactive",
      });

      // Reset form
      setUserName('');
      setDate('');
      setDepartment('');
      setEmail('');
      setPhone('');
      setPosition('');
      setAddress('');
      setStatus('');

      // Close modal
      const modalCheckbox = document.getElementById("attendance_modal") as HTMLInputElement;
      if (modalCheckbox) modalCheckbox.checked = false;

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <>
      {/* Open Modal Button */}
      <label htmlFor="attendance_modal" className="btn bg-green-50 hover:bg-blue-100 text-gray-800  shadow-md font-semibold rounded-lg">
        Add New Employee
      </label>

      {/* Modal */}
      <input type="checkbox" id="attendance_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl bg-white shadow-lg rounded-lg">
          <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">
            Add New Employee
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input input-bordered w-full shadow-md border-t-gray-200 p-3 rounded-2xl bg-white"
            />
            <label className="text-sm font-semibold mb-0 pb-0">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            />

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            />

            <input
              type="text"
              placeholder="Phone no"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            />

            <select
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>

            <input
              type="text"
              placeholder="Position"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            />

            <input
              type="text"
              placeholder="Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input input-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            />

            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full shadow-md p-3 rounded-2xl bg-white border-t-gray-200"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="btn bg-green-600 text-white w-full shadow-md p-3 rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </form>

          <div className="modal-action">
            <label htmlFor="attendance_modal" className="btn rounded-md bg-sky-200 hover:bg-green-100 text-gray-800 shadow-md font-semibold">
              Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
