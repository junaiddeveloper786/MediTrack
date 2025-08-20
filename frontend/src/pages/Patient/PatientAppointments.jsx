import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchPatientAppointments,
  cancelPatientAppointment,
} from "../../services/appointmentService";

// Helper function to format time in "hh:mm AM/PM" using local timezone
function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper function to format date as DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to get weekday name
function getWeekdayName(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: "long" });
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

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
        const res = await fetchPatientAppointments(userId);
        const apptsArray = Array.isArray(res.data)
          ? res.data
          : res.data.appointments || [];
        setAppointments(apptsArray);
      } catch (err) {
        console.error("Load appointments error:", err.response || err.message);
        toast.error(
          err.response?.data?.message || "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [userId]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    setCancellingId(appointmentId);
    try {
      await cancelPatientAppointment(appointmentId);
      toast.success("Appointment cancelled successfully");
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: "Cancelled" } : appt
        )
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

  if (loading)
    return <div className="p-4 text-gray-700">Loading appointments...</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        My Appointments
      </h1>

      {!Array.isArray(appointments) || appointments.length === 0 ? (
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
                return (
                  <tr key={appt._id} className="border-b">
                    <td className="p-3">{appt.doctorId?.name || "N/A"}</td>
                    <td className="p-3">{getWeekdayName(appt.startTime)}</td>
                    <td className="p-3">{formatDate(appt.startTime)}</td>
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
