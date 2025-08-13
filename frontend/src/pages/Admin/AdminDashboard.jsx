// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserMd, FaUsers, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AdminSidebar from "../../components/AdminSidebar";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const statsRes = await axios.get(
          "http://localhost:5000/api/admin/stats",
          { headers }
        );
        const recentRes = await axios.get(
          "http://localhost:5000/api/appointments/recent",
          { headers }
        );
        setStats(statsRes.data);
        setRecentAppointments(recentRes.data);
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen font-sans bg-[#f3f6fc]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
          <div className="bg-white shadow-lg rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Appointments Overview
            </h3>
            <Calendar
              className="w-full border-none rounded-lg shadow-sm"
              tileClassName="p-2"
            />
          </div>

          <div className="bg-white shadow-lg rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Recent Appointments
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="py-2 px-3 text-left">Patient</th>
                  <th className="px-3 text-left">Doctor</th>
                  <th className="px-3 text-left">Date</th>
                  <th className="px-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((a, i) => (
                    <tr
                      key={i}
                      className={`border-t ${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="py-2 px-3">{a.patient?.name}</td>
                      <td className="px-3">{a.doctor?.name}</td>
                      <td className="px-3">
                        {new Date(a.slot).toLocaleDateString()}
                      </td>
                      <td className="px-3">
                        {new Date(a.slot).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
      </main>
    </div>
  );
}

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

export default AdminDashboard;
