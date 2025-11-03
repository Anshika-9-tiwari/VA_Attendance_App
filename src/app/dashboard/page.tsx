"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#4CAF50", "#FFC107", "#FF5252"];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPresent: 0,
    totalLeave: 0,
    totalAbsent: 0,
    date: "",
  });

  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Chart Data
  const chartData = [
    { name: "Present", value: stats.totalPresent },
    { name: "On Leave", value: stats.totalLeave },
    { name: "Absent", value: stats.totalAbsent },
  ];

  return (
    <div className="flex flex-col justify-center items-center p-5 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col justify-center items-center p-5 mb-15 mt-10 rounded-lg shadow-lg bg-white"
      >
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Daily Attendance Summary ({stats.date || "Today"})
        </p>
      </motion.div>

      {/* Stats Section */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-lg shadow-lg bg-gray-50">
        {/* Total Employees */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-blue-400 text-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center"
        >
          <h2 className="text-lg font-semibold">Total Employees</h2>
          <p className="text-2xl font-bold">{stats.totalEmployees}</p>
        </motion.div>

        {/* Present */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-green-400 text-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center"
        >
          <h2 className="text-lg font-semibold">Present</h2>
          <p className="text-2xl font-bold">{stats.totalPresent}</p>
        </motion.div>

        {/* On Leave */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-yellow-500 text-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center"
        >
          <h2 className="text-lg font-semibold">On Leave</h2>
          <p className="text-2xl font-bold">{stats.totalLeave}</p>
        </motion.div>

        {/* Absent */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-orange-700 text-white p-4 rounded-lg shadow-md flex flex-col justify-center items-center"
        >
          <h2 className="text-lg font-semibold">Absent</h2>
          <p className="text-2xl font-bold">{stats.totalAbsent}</p>
        </motion.div>
      </div>

      {/* Reports Toggle */}
      <motion.button
        onClick={() => setShowChart(!showChart)}
        whileHover={{ scale: 1.05 }}
        className="mt-8 btn bg-orange-600 text-white rounded-lg shadow-md"
      >
        {showChart ? "Hide Report" : "View Report"}
      </motion.button>

      {/* Chart Section */}
      {showChart && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-96 bg-white p-5 mt-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={120}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
