import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex bg-[#F6FAFF]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B2251] text-white p-6">
        <div className="text-2xl font-bold mb-10">🩺 MediTrack</div>
        <nav className="space-y-4">
          <SidebarLink text="Admin Dashboard" />
          <SidebarLink text="Departments" />
          <SidebarLink text="Reports" />
          <SidebarLink text="Appointments" />
          <SidebarLink text="Layout" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <button className="bg-white border px-4 py-2 rounded shadow text-gray-600">
            ⚙️ Settings
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPIBox title="Total Elements" value="10" bg="bg-blue-500" />
          <KPIBox title="Total Doctors" value="75" bg="bg-green-500" />
          <KPIBox title="Total Inquiries" value="150" bg="bg-yellow-500" />
          <KPIBox title="Total Booked" value="50" bg="bg-purple-500" />
        </div>

        {/* Appointments Overview Calendar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Appointments Overview
          </h2>
          {/* Placeholder calendar */}
          <div className="border rounded p-4 text-center text-gray-500">
            📅 Calendar Coming Soon
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Recent Appointments
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-2 px-2">Patient</th>
                <th className="py-2 px-2">Doctor</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              <tr className="border-b">
                <td className="py-2 px-2">Apon Time</td>
                <td className="py-2 px-2">Dr. Pulones</td>
                <td className="py-2 px-2">4/13/25</td>
                <td className="py-2 px-2">10:00 AM</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2">Minorial Tmite</td>
                <td className="py-2 px-2">Dr. Iabeo Lest</td>
                <td className="py-2 px-2">4/13/25</td>
                <td className="py-2 px-2">9:00 AM</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2">Eifron Cnosios</td>
                <td className="py-2 px-2">Dr. Pileo Usied</td>
                <td className="py-2 px-2">4/13/25</td>
                <td className="py-2 px-2">9:30 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

const SidebarLink = ({ text }) => (
  <button className="w-full text-left px-4 py-2 rounded hover:bg-[#1A3B8B] bg-opacity-90">
    {text}
  </button>
);

const KPIBox = ({ title, value, bg }) => (
  <div
    className={`${bg} text-white rounded-lg p-4 shadow flex justify-between items-center`}
  >
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <div className="text-3xl">✔️</div>
  </div>
);
