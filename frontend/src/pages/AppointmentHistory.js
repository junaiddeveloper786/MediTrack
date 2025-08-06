import React, { useEffect, useState } from "react";
import axios from "../services/axios";

function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/appointments/my");
      setAppointments(res.data);
    } catch (err) {
      console.log("Error loading appointments");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Doctor</th>
            <th className="border px-3 py-2">Specialty</th>
            <th className="border px-3 py-2">Date</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((app) => (
            <tr key={app._id}>
              <td className="border px-3 py-2">{app.doctorId?.name}</td>
              <td className="border px-3 py-2">{app.doctorId?.specialty}</td>
              <td className="border px-3 py-2">
                {new Date(app.appointmentDate).toLocaleString()}
              </td>
              <td className="border px-3 py-2">{app.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentHistory;
