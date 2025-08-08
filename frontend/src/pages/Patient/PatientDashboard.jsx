// src/pages/Patient/PatientDashboard.jsx
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  LogOut,
  ClipboardList,
} from "lucide-react";

export default function PatientDashboard() {
  const [date, setDate] = useState(new Date());
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    doctors: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetch("/api/patient/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch((err) => console.error("Stats fetch error:", err));

    fetch("/api/patient/appointments/recent")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecentAppointments(data.appointments);
      })
      .catch((err) => console.error("Recent appointments fetch error:", err));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 text-xl font-bold text-blue-600">
          MediTrack - Patient
        </div>
        <nav className="mt-6 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink
            icon={<ClipboardList size={20} />}
            label="My Appointments"
          />
          <SidebarLink
            icon={<CalendarDays size={20} />}
            label="Book Appointment"
          />
          <SidebarLink icon={<User size={20} />} label="Profile" />
          <SidebarLink icon={<LogOut size={20} />} label="Logout" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Patient Dashboard
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Hello, John Doe</span>
            <img
              src="https://ui-avatars.com/api/?name=John+Doe"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Upcoming" value={stats.upcoming} color="blue" />
          <KpiCard title="Completed" value={stats.completed} color="green" />
          <KpiCard title="Cancelled" value={stats.cancelled} color="red" />
          <KpiCard title="Doctors" value={stats.doctors} color="purple" />
        </div>

        {/* Calendar + Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Doctor</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appt) => (
                      <tr key={appt._id} className="border-b">
                        <td className="py-2">{appt.doctorName}</td>
                        <td className="py-2">
                          {new Date(appt.date).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded text-white text-xs ${
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label }) {
  return (
    <a
      href="#"
      className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  );
}

function KpiCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
  };
  return (
    <Card>
      <CardContent className="flex flex-col items-start p-4">
        <span className="text-sm text-gray-500">{title}</span>
        <span className={`mt-2 text-2xl font-bold ${colors[color]}`}>
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
