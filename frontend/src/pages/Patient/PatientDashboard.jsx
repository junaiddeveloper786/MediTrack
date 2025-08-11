import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaSignOutAlt,
  FaUserMd,
} from "react-icons/fa";
import PatientSidebar from "../../components/PatientSidebar"; // Adjust path as needed
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function PatientDashboard() {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      try {
        const statsRes = await axios.get(
          "http://localhost:5000/api/patient/stats",
          { headers }
        );
        const recentRes = await axios.get(
          "http://localhost:5000/api/patient/appointments/recent",
          { headers }
        );
        setStats(statsRes.data);
        setRecentAppointments(recentRes.data);
      } catch (err) {
        console.error("Error loading patient dashboard data:", err);
      }
    };

    loadData();
  }, []);

  function KPI({ icon, label, value, color }) {
    return (
      <div
        className={`p-5 rounded-xl text-white shadow-sm flex items-center justify-between ${color}`}
      >
        <div className="text-3xl">{icon}</div>
        <div className="text-right">
          <div className="text-sm opacity-90">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Patient Dashboard
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPI
            color="bg-blue-500"
            icon={<FaCalendarCheck />}
            label="Upcoming"
            value={stats.upcoming || 0}
          />
          <KPI
            color="bg-green-500"
            icon={<FaClipboardList />}
            label="Completed"
            value={stats.completed || 0}
          />
          <KPI
            color="bg-red-500"
            icon={<FaSignOutAlt />}
            label="Cancelled"
            value={stats.cancelled || 0}
          />
          <KPI
            color="bg-purple-500"
            icon={<FaUserMd />}
            label="Doctors Visited"
            value={stats.doctors || 0}
          />
        </div>

        {/* Calendar & Recent Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Your Calendar
            </h3>
            <Calendar
              className="w-full border-none rounded-lg shadow-sm p-3 bg-gray-50"
              onChange={setSelectedDate}
              value={selectedDate}
            />
          </div>

          {/* Recent Appointments */}
          <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Recent Appointments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="py-2 text-left">Doctor</th>
                    <th className="text-left">Date</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appt, i) => (
                      <tr
                        key={i}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-2">{appt.doctorName}</td>
                        <td>{new Date(appt.date).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-white text-xs ${
                              appt.status === "Completed"
                                ? "bg-green-500"
                                : appt.status === "Upcoming"
                                ? "bg-blue-500"
                                : "bg-red-500"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-4 text-center text-gray-500"
                      >
                        No recent appointments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
