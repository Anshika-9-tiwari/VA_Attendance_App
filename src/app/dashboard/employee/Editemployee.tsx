'use client';

import { useState, useEffect } from "react";

export default function EditEmployeeModal({
  employee,
  onClose,
  onUpdate,
}: {
  employee: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [form, setForm] = useState(employee);

  useEffect(() => {
    setForm(employee);
  }, [employee]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/dashboard/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      onUpdate();
      onClose();
      alert("Employee updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update employee!");
    }
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Edit Employee</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Full Name"
            className="input input-bordered"
          />
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="input input-bordered"
          />
          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            className="input input-bordered"
          />
          <input
            name="department"
            value={form.department || ""}
            onChange={handleChange}
            placeholder="Department"
            className="input input-bordered"
          />
          <input
            name="position"
            value={form.position || ""}
            onChange={handleChange}
            placeholder="Position"
            className="input input-bordered"
          />
          <input
            type="date"
            name="dateOfJoining"
            value={
              form.dateOfJoining
                ? new Date(form.dateOfJoining).toISOString().split("T")[0]
                : ""
            }
            onChange={handleChange}
            className="input input-bordered"
          />
          <select
            name="status"
            value={form.status || ""}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <input
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            placeholder="Address"
            className="input input-bordered md:col-span-2"
          />

          <div className="flex justify-end gap-3 mt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button type="submit" className="btn bg-green-600 text-white hover:bg-green-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
