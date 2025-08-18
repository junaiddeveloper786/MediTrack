import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import PatientSidebar from "../components/PatientSidebar";

function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <PatientSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative w-64 bg-blue-900 h-full">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes size={22} />
          </button>
          <PatientSidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar for mobile */}
        <div className="md:hidden bg-blue-900 text-white flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">MediTrack</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <FaBars size={22} />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default PatientLayout;
