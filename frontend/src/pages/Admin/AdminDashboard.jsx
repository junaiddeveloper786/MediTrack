import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaHospitalSymbol,
  FaBuilding,
  FaCalendarCheck,
  FaUserCircle,
} from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { MdDashboard, MdOutlineDashboardCustomize } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { Menu } from "@headlessui/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
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
    };
    load();
  }, []);

  function SidebarItem({ icon, label }) {
    return (
      <div className="flex items-center gap-3 py-3 px-5 text-white hover:bg-[#1a2d58] rounded-lg cursor-pointer transition-all">
        <span className="text-blue-400">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans bg-[#f3f6fc]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e1e40] text-white flex flex-col">
        <div className="flex items-center px-6 py-5 text-xl font-bold">
          <FaHospitalSymbol className="mr-2 text-blue-400" size={20} />
          MediTrack
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <SidebarItem
            icon={<MdDashboard size={18} />}
            label="Admin Dashboard"
          />
          <SidebarItem icon={<FaBuilding size={18} />} label="Departments" />
          <SidebarItem
            icon={<HiOutlineDocumentReport size={18} />}
            label="Reports"
          />
          <SidebarItem
            icon={<FaCalendarCheck size={18} />}
            label="Appointments"
          />
          <SidebarItem
            icon={<MdOutlineDashboardCustomize size={18} />}
            label="Layout"
          />
        </nav>

        <div className="mt-auto px-4 pb-4">
          <div
            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#1b2d5a] cursor-pointer"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            <IoLogOutOutline size={20} className="text-blue-400" />
            <span className="text-sm">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 focus:outline-none">
              <FaUserCircle size={28} className="text-gray-700" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100" : ""
                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Profile
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-gray-100" : ""
                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Settings
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } w-full text-left px-4 py-2 text-sm text-red-600`}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
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
