import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import toast from "react-hot-toast";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);

  const handleExport = async () => {
    try {
      const res = await axios.get("/admin/appointments/export", {
        responseType: "blob", // Important for file download
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "appointments.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("/admin/dashboard");
      setStats(res.data.stats);
      setAppointments(res.data.appointments);
    } catch (err) {
      toast.error("Failed to load dashboard");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchData(); // refresh
    } catch (err) {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-green-100 p-4 rounded shadow">
          Total Doctors: {stats.doctors}
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          Total Patients: {stats.patients}
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          Appointments: {stats.appointments}
        </div>
      </div>

      {/* Appointments Table */}
      <div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={handleExport}
        >
          Export Appointments (CSV)
        </button>

        <h2 className="text-xl font-semibold my-4">All Appointments</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Patient</th>
              <th className="border p-2">Doctor</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app) => (
              <tr key={app._id}>
                <td className="border p-2">{app.patientName}</td>
                <td className="border p-2">{app.doctorName}</td>
                <td className="border p-2">
                  {new Date(app.appointmentDate).toLocaleString()}
                </td>
                <td className="border p-2">{app.status}</td>
                <td className="border p-2 space-x-2">
                  {app.status === "Pending" && (
                    <>
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded"
                        onClick={() => updateStatus(app._id, "Confirmed")}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        onClick={() => updateStatus(app._id, "Cancelled")}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
