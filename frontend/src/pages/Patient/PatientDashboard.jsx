// src/pages/Patient/PatientDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import PatientSidebar from "../../components/PatientSidebar";

function PatientDashboard() {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const statsRes = await axios.get(
          "http://localhost:5000/api/patient/stats",
          { headers }
        );
        const recentRes = await axios.get(
          "http://localhost:5000/api/appointments/my-recent",
          { headers }
        );
        setStats(statsRes.data);
        setRecentAppointments(recentRes.data);
      } catch (err) {
        console.error("Failed to load patient dashboard data", err);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen font-sans bg-[#f3f6fc]">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <KPI
            color="bg-blue-500"
            icon={<FaCalendarCheck />}
            label="Total Appointments"
            value={stats.totalAppointments}
          />
          <KPI
            color="bg-yellow-500"
            icon={<FaClock />}
            label="Upcoming"
            value={stats.upcoming}
          />
          <KPI
            color="bg-green-500"
            icon={<FaCheckCircle />}
            label="Completed"
            value={stats.completed}
          />
          <KPI
            color="bg-red-500"
            icon={<FaTimesCircle />}
            label="Cancelled"
            value={stats.cancelled}
          />
        </div>

        {/* Calendar + Recent Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              My Appointments Calendar
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
                  <th className="py-2 px-3 text-left">Doctor</th>
                  <th className="px-3 text-left">Date</th>
                  <th className="px-3 text-left">Time</th>
                  <th className="px-3 text-left">Status</th>
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
                      <td className="py-2 px-3">{a.doctor?.name}</td>
                      <td className="px-3">
                        {new Date(a.slotDate).toLocaleDateString()}
                      </td>
                      <td className="px-3">
                        {a.startTime} - {a.endTime}
                      </td>
                      <td className="px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            a.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : a.status === "upcoming"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
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

export default PatientDashboard;
