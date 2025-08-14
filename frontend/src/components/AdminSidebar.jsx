import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaHospitalSymbol,
  FaSignOutAlt,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { MdEventAvailable } from "react-icons/md";

function AdminSidebar() {
  const location = useLocation();

  const SidebarItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="block">
        <div
          className={`flex items-center gap-3 py-3 px-5 rounded-lg cursor-pointer transition-all ${
            isActive ? "bg-blue-700" : "hover:bg-blue-800"
          }`}
        >
          <span className="text-blue-200">{icon}</span>
          <span className="text-sm">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col min-h-screen">
      <div className="flex items-center px-6 py-5 text-xl font-bold border-b border-blue-800">
        <FaHospitalSymbol className="mr-2 text-blue-300" size={24} />
        MediTrack
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        <SidebarItem
          to="/admin/dashboard"
          icon={<MdDashboard size={18} />}
          label="Dashboard"
        />
        <SidebarItem
          to="/admin/doctors"
          icon={<FaUserMd size={18} />}
          label="Doctors"
        />
        <SidebarItem
          to="/admin/patients"
          icon={<FaUsers size={18} />}
          label="Patients"
        />
        <SidebarItem
          to="/admin/doctor-slots"
          icon={<FaCalendarCheck size={18} />}
          label="Doctor Slots"
        />
        <SidebarItem
          to="/admin/appointments"
          icon={<MdEventAvailable size={18} />}
          label="Appointments"
        />
        <SidebarItem
          to="/admin/reports"
          icon={<FaFileAlt size={18} />}
          label="Reports"
        />
        <SidebarItem
          to="/admin/profile"
          icon={<FaUser size={18} />}
          label="Profile"
        />
      </nav>

      <div className="mt-auto px-4 pb-4">
        <div
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="flex items-center gap-3 py-3 px-5 rounded-lg cursor-pointer hover:bg-blue-800"
        >
          <FaSignOutAlt size={20} />
          <span className="text-sm">Logout</span>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
