"use client";

import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { exportWorkReportsToExcel, exportWorkReportsToPDF } from "@/lib/exportreport";

export default function WorkReportPage() {
  const [form, setForm] = useState({
    date: "",
    customerName: "",
    location: "",
    purpose: "",
    inTime: "",
    outTime: "",
    issue: "",
    machineSystem: "",
    reportedBy: "",
    actionTaken: "",
    status: "",
    task: "",
    actionRequired: "",
    remark: "",
    partNumber: "",
    serialNumber: "",
    qty: "",
    additionalNote: "",
    preparedBy: "",
    submittedTo: "",
  });

  const [preparedByList, setPreparedByList] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    preparedBy: "",
  });
  const [reports, setReports] = useState<any[]>([]);

  const purposes = ["Installation", "Maintenance", "Repair", "Inspection", "Other"];
  const statusOptions = ["Pending", "In Progress", "Completed", "On Hold"];

  // Fetch preparedBy dropdown list
  useEffect(() => {
    fetch("/api/dashboard/workreport?type=preparedBy")
      .then((res) => res.json())
      .then((data) => setPreparedByList(data))
      .catch((err) => console.error("Error fetching preparedBy list:", err));
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dashboard/workreport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: new Date(form.date),
          inTime: form.inTime ? new Date(`${form.date}T${form.inTime}`) : null,
          outTime: form.outTime ? new Date(`${form.date}T${form.outTime}`) : null,
          qty: form.qty ? Number(form.qty) : null,
        }),
      });
      if (res.ok) {
        alert("Work report submitted successfully!");
        setForm({
          date: "",
          customerName: "",
          location: "",
          purpose: "",
          inTime: "",
          outTime: "",
          issue: "",
          machineSystem: "",
          reportedBy: "",
          actionTaken: "",
          status: "",
          task: "",
          actionRequired: "",
          remark: "",
          partNumber: "",
          serialNumber: "",
          qty: "",
          additionalNote: "",
          preparedBy: "",
          submittedTo: "",
        });
      } else {
        alert(" Failed to submit work report.");
      }
    } catch (error) {
      console.error(error);
      alert("Server error.");
    }
  };

  // Fetch filtered reports
  const handleFetchReports = async () => {
    try {
      const params = new URLSearchParams(filters as any).toString();
      const res = await fetch(`/api/dashboard/workreport?${params}`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-5 m-8 bg-sky-50 text-gray-800 rounded-xl shadow-xl border border-gray-300">
      <h2 className="text-3xl font-bold text-center mb-6">Daily Work Reports</h2>

{/* ----------- FILTER + EXPORT SECTION ------------- */}
      <div className="mt-10 mb-10 bg-white border-gray-300 p-4 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Filter & Download Reports</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">From Date</label>
            <input type="date" name="from" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="input input-bordered w-full bg-white border-red-200" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">To Date</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="input input-bordered w-full bg-white border-red-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Employee</label>
            <select
              name="preparedBy"
              value={filters.preparedBy}
              onChange={(e) => setFilters({ ...filters, preparedBy: e.target.value })}
              className="select select-bordered w-full bg-white border-red-200"
            >
              <option value="">Prepared By</option>
              {preparedByList.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <label className="text-sm font-semibold mb-1">Download</label>
            <button onClick={handleFetchReports} className="btn border-red-300 bg-white text-black">
              Reports
            </button>
          </div>
        </div>

        {reports.length > 0 && (
          <div className="flex gap-4">
            <button onClick={() => exportWorkReportsToExcel(reports)} className="btn bg-green-200 text-gray-600 w-40 rounded-box">
              Export Excel
            </button>
            <button onClick={() => exportWorkReportsToPDF(reports)} className="btn bg-red-200 text-gray-600 w-40 rounded-box">
              Export PDF
            </button>
          </div>
        )}
      </div>
      {/* ----------- FORM ------------- */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Customer Name</label>
          <input name="customerName" value={form.customerName} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Customer Name" required />
        </div>
        <input name="location" value={form.location} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Location" />
        <select name="purpose" value={form.purpose} onChange={handleChange} className="select select-bordered w-full bg-white border-red-200">
          <option value="">Select Purpose</option>
          {purposes.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">CheckIn</label>
          <input name="inTime" type="time" value={form.inTime} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">CheckOut</label>
          <input name="outTime" type="time" value={form.outTime} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" />
        </div>
        <input name="issue" value={form.issue} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Issue" />
        <input name="machineSystem" value={form.machineSystem} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Machine/System" />
        <input name="reportedBy" value={form.reportedBy} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Reported By" />
        <input name="actionTaken" value={form.actionTaken} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Action Taken" />
        <select name="status" value={form.status} onChange={handleChange} className="select select-bordered w-full bg-white border-red-200">
          <option value="">Select Status</option>
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input name="task" value={form.task} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Task" />
        <input name="actionRequired" value={form.actionRequired} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Action Required" />
        <input name="remark" value={form.remark} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Remark" />
        <input name="partNumber" value={form.partNumber} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Part Number" />
        <input name="serialNumber" value={form.serialNumber} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Serial Number" />
        <input name="qty" type="number" value={form.qty} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Quantity" />
        <input name="additionalNote" value={form.additionalNote} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Additional Note" />
        <input name="preparedBy" value={form.preparedBy} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Prepared By" required />
        <input name="submittedTo" value={form.submittedTo} onChange={handleChange} className="input input-bordered w-full bg-white border-red-200" placeholder="Submitted To" />

        <div className="col-span-2 mt-4">
          <button type="submit" className="btn bg-sky-200 w-full rounded-xl border-red-300 shadow-xl text-gray-600">Submit Report</button>
        </div>
      </form>
    </div>
  );
}
