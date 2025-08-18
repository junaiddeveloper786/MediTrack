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

function PatientDashboard() {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        axios.get("http://localhost:5000/api/patient/dashboard/stats", {
          headers,
        }),
        axios.get("http://localhost:5000/api/patient/dashboard/recent", {
          headers,
        }),
      ]);
      setStats(statsRes.data);
      setRecentAppointments(recentRes.data);
    } catch (err) {
      console.error("Failed to load patient dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-sans bg-[#f3f6fc]">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Dashboard</h1>

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
            value={selectedDate}
            onChange={setSelectedDate}
            className="w-full border-none rounded-lg shadow-lg overflow-hidden"
          />
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Recent Appointments
          </h3>
          <div className="overflow-x-auto">
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
                  recentAppointments.map((a, i) => {
                    const start = new Date(a.startTime);
                    const end = new Date(a.endTime);
                    const formatTime = (date) => {
                      let hours = date.getHours();
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        "0"
                      );
                      const ampm = hours >= 12 ? "PM" : "AM";
                      hours = hours % 12 || 12;
                      return `${hours}:${minutes} ${ampm}`;
                    };
                    const day = start.toLocaleDateString("en-US", {
                      weekday: "long",
                    });
                    const date = start.toLocaleDateString("en-GB");

                    return (
                      <tr
                        key={i}
                        className={`border-t hover:bg-gray-50 transition-colors duration-150 ${
                          i % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="py-3 px-4">{a.doctor}</td>
                        <td className="px-4">{`${day}, ${date}`}</td>
                        <td className="px-4">{`${formatTime(
                          start
                        )} - ${formatTime(end)}`}</td>
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
                    );
                  })
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
