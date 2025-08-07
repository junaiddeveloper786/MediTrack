import { useEffect, useState } from "react";
import axios from "axios";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("http://localhost:5000/api/appointments/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAppointments(res.data);
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My Appointments</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Doctor</th>
            <th>Specialty</th>
            <th>Slot</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{a.doctor?.name}</td>
              <td>{a.doctor?.specialty}</td>
              <td>{new Date(a.slot).toLocaleString()}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyAppointments;
