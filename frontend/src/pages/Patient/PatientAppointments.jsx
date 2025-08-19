import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchPatientAppointments,
  cancelPatientAppointment,
} from "../../services/appointmentService";

// Helper function to format time in "hh:mm AM/PM"
function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;
}

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

    const loadAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetchPatientAppointments(token, userId);
        setAppointments(res.data.appointments || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [userId, token]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    setCancellingId(appointmentId);
    try {
      await cancelPatientAppointment(token, appointmentId);
      toast.success("Appointment cancelled successfully");
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: "Cancelled" } : appt
        )
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel appointment"
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading)
    return <div className="p-4 text-gray-700">Loading appointments...</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        My Appointments
      </h1>

      {appointments.length === 0 ? (
        <p>You have no appointments booked.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] bg-white rounded shadow text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Doctor</th>
                <th className="p-3">Day</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => {
                const apptStart = new Date(appt.startTime);
                const apptEnd = new Date(appt.endTime);
                const dayName = apptStart.toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const dateStr = apptStart.toLocaleDateString("en-GB");

                return (
                  <tr key={appt._id} className="border-b">
                    <td className="p-3">{appt.doctorId?.name || "N/A"}</td>
                    <td className="p-3">{dayName}</td>
                    <td className="p-3">{dateStr}</td>
                    <td className="p-3">
                      {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          appt.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : appt.status === "Confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : appt.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : appt.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : appt.status === "Rescheduled"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {appt.status || "Scheduled"}
                      </span>
                    </td>
                    <td className="p-3">
                      {appt.status !== "Cancelled" ? (
                        <button
                          onClick={() => handleCancel(appt._id)}
                          disabled={cancellingId === appt._id}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 w-full md:w-auto"
                        >
                          {cancellingId === appt._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      ) : (
                        <span className="text-gray-500 italic">Cancelled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
