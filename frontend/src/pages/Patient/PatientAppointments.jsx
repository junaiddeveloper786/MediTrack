import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PatientSidebar from "../../components/PatientSidebar";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id || null;

  useEffect(() => {
    if (!userId) {
      toast.error("User info missing. Please login again.");
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/appointments?patientId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("fetchAppointments error:", err.response || err.message);
        toast.error(
          err.response?.data?.message || "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId, token]);

  // Cancel appointment handler
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    setCancellingId(appointmentId);

    try {
      await axios.put(
        `http://localhost:5000/api/appointments/cancel/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Appointment cancelled successfully");

      // Remove cancelled appointment from the list (so it disappears immediately)
      setAppointments((prev) =>
        prev.filter((appt) => appt._id !== appointmentId)
      );
    } catch (err) {
      console.error("Cancel appointment error:", err.response || err.message);
      toast.error(
        err.response?.data?.message || "Failed to cancel appointment"
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PatientSidebar />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>

        {appointments.length === 0 ? (
          <p>You have no appointments booked.</p>
        ) : (
          <table className="w-full bg-white rounded shadow text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Doctor</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id} className="border-b">
                  <td className="p-3">{appt.doctorId?.name || "N/A"}</td>
                  <td className="p-3">
                    {new Date(appt.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3">
                    {appt.startTime} - {appt.endTime}
                  </td>
                  <td className="p-3">{appt.status || "Scheduled"}</td>
                  <td className="p-3">
                    {appt.status !== "Cancelled" ? (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={cancellingId === appt._id}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {cancellingId === appt._id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : (
                      <span className="text-gray-500 italic">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
