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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Appointments Overview
            </h3>
            <Calendar className="w-full border-none" />
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-600 border-b">
                <tr>
                  <th className="py-2">Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{a.patient?.name}</td>
                    <td>{a.doctor?.name}</td>
                    <td>{new Date(a.slot).toLocaleDateString()}</td>
                    <td>
                      {new Date(a.slot).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {recentAppointments.length === 0 && (
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
      className={`p-4 rounded-lg text-white shadow flex items-center justify-between ${color}`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="text-right">
        <div className="text-sm">{label}</div>
        <div className="text-xl font-bold">{value || 0}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
