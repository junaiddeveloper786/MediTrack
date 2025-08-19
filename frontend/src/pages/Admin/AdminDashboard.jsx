// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { FaUserMd, FaUsers, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  fetchDashboardStats,
  fetchRecentAppointments,
} from "../../services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadDashboardData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentAppointments(),
      ]);
      setStats(statsRes.data);
      setRecentAppointments(recentRes.data);
    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-8 bg-[#f3f6fc] min-h-full">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <KPI
            color="bg-blue-500"
            icon={<FaUserMd />}
            label="Total Doctors"
            value={stats.totalDoctors}
          />
          <KPI
            color="bg-green-500"
            icon={<FaUsers />}
            label="Total Patients"
            value={stats.totalPatients}
          />
          <KPI
            color="bg-yellow-400"
            icon={<FaCalendarAlt />}
            label="Total Appointments"
            value={stats.totalAppointments}
          />
          <KPI
            color="bg-purple-500"
            icon={<FaChartLine />}
            label="Upcoming Slots"
            value={stats.upcomingSlots}
          />
        </div>

        {/* Calendar + Recent Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar Card */}
          <div className="bg-white shadow-lg rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Appointments Overview
            </h3>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              className="w-full border-none rounded-lg shadow-lg overflow-hidden"
              tileClassName={({ date }) =>
                date.toDateString() === selectedDate.toDateString()
                  ? "bg-blue-500 text-white rounded-lg"
                  : "hover:bg-blue-100 transition-colors duration-150 rounded-lg"
              }
            />
          </div>

          {/* Recent Appointments Card */}
          <div className="bg-white shadow-lg rounded-xl p-5 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Recent Appointments
            </h3>
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="py-2 px-3 text-left">Patient</th>
                  <th className="px-3 text-left">Doctor</th>
                  <th className="px-3 text-left">Date</th>
                  <th className="px-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((a, i) => (
                    <tr
                      key={i}
                      className={`border-t hover:bg-gray-50 transition-colors duration-150 ${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-4">{a.patientName}</td>
                      <td className="px-4">{a.doctorName}</td>
                      <td className="px-4">
                        {new Date(a.date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            a.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : a.status === "Confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : a.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : a.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : a.status === "Rescheduled"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No recent appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPI({ icon, label, value, color }) {
  return (
    <div
      className={`p-5 rounded-xl text-white shadow-md flex items-center gap-4 ${color}`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm opacity-80">{label}</div>
        <div className="text-2xl font-bold">{value || 0}</div>
      </div>
    </div>
  );
}
