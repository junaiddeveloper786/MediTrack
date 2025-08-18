// src/pages/Admin/AdminAppointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

// Safe formatting functions
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date)) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";

  // Case 1: "HH:mm"
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "—";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  // Case 2: ISO datetime
  const date = new Date(timeStr);
  if (!isNaN(date)) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  return "—";
};
const formatTimeRange = (start, end) =>
  `${formatTime(start)} - ${formatTime(end)}`;

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [editingAppt, setEditingAppt] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loadingActionId, setLoadingActionId] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || []);
    } catch {
      toast.error("Failed to fetch doctors");
    }
  };

  const fetchAppointments = async (filters = {}) => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error("Failed to fetch appointments");
    }
  };

  const applyFilter = () => {
    fetchAppointments({
      doctorId: filterDoctor || undefined,
      fromDate: filterFrom ? filterFrom.toLocaleDateString("en-CA") : undefined,
      toDate: filterTo ? filterTo.toLocaleDateString("en-CA") : undefined,
      status: filterStatus || undefined,
    });
  };

  const clearFilter = () => {
    setFilterDoctor("");
    setFilterFrom(null);
    setFilterTo(null);
    setFilterStatus("");
    fetchAppointments();
  };

  const handleAction = async (id, action) => {
    setLoadingActionId(id + action);
    try {
      if (action === "Cancelled") {
        await axios.put(
          `http://localhost:5000/api/appointments/cancel/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (action === "Confirmed") {
        await axios.put(
          `http://localhost:5000/api/appointments/confirm/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (action === "Completed") {
        await axios.put(
          `http://localhost:5000/api/appointments/complete/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success(`Appointment ${action}`);
      fetchAppointments();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoadingActionId("");
    }
  };

  const openReschedule = (appt) => {
    setEditingAppt(appt);
    setNewDate(appt?.date ? new Date(appt.date) : new Date());
    setNewStart(appt?.startTime || "");
    setNewEnd(appt?.endTime || "");
    setSelectedSlotId(appt.slotId?._id || "");
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!editingAppt || !newDate) return;
      try {
        const dateStr = newDate.toLocaleDateString("en-CA");
        const res = await axios.get(
          "http://localhost:5000/api/slots/available",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { doctorId: editingAppt.doctorId?._id, date: dateStr },
          }
        );
        setAvailableSlots(res.data.slots.filter((s) => !s.isBooked));
        setSelectedSlotId("");
      } catch {
        toast.error("Failed to fetch slots");
      }
    };
    fetchSlots();
  }, [editingAppt, newDate]);

  const submitReschedule = async () => {
    if (!editingAppt || !selectedSlotId) {
      toast.error("Please select a slot");
      return;
    }
    setLoadingActionId(editingAppt._id + "Reschedule");
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/reschedule/${editingAppt._id}`,
        {
          newSlotId: selectedSlotId,
          newDate: newDate.toLocaleDateString("en-CA"),
          newStartTime: newStart,
          newEndTime: newEnd,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rescheduled successfully");
      setEditingAppt(null);
      setSelectedSlotId("");
      setAvailableSlots([]);
      fetchAppointments();
    } catch {
      toast.error("Reschedule failed");
    } finally {
      setLoadingActionId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete appointment?")) return;
    setLoadingActionId(id + "Delete");
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted");
      fetchAppointments();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoadingActionId("");
    }
  };

  // Helper: status badge color
  const getStatusClasses = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Rescheduled":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <h2 className="text-2xl font-bold mb-4">Admin Appointments</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="block text-sm">Doctor</label>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">From</label>
          <DatePicker
            selected={filterFrom}
            onChange={(d) => setFilterFrom(d)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <DatePicker
            selected={filterTo}
            onChange={(d) => setFilterTo(d)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilter}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            Apply
          </button>
          <button
            onClick={clearFilter}
            className="bg-gray-200 px-3 py-2 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full table-auto min-w-[600px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Patient</th>
              <th className="p-2 text-left">Doctor</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No appointments
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{appt.patientId?.name || "—"}</td>
                  <td className="p-2">{appt.doctorId?.name || "—"}</td>
                  <td className="p-2">{formatDate(appt.date)}</td>
                  <td className="p-2">
                    {formatTimeRange(appt.startTime, appt.endTime)}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                        appt.status
                      )}`}
                    >
                      {appt.status || "Scheduled"}
                    </span>
                  </td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleAction(appt._id, "Confirmed")}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                      disabled={loadingActionId === appt._id + "Confirmed"}
                    >
                      {loadingActionId === appt._id + "Confirmed"
                        ? "Approving..."
                        : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(appt._id, "Cancelled")}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      disabled={loadingActionId === appt._id + "Cancelled"}
                    >
                      {loadingActionId === appt._id + "Cancelled"
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                    <button
                      onClick={() => openReschedule(appt)}
                      className="bg-yellow-400 px-2 py-1 rounded"
                      disabled={loadingActionId === appt._id + "Reschedule"}
                    >
                      {loadingActionId === appt._id + "Reschedule"
                        ? "Rescheduling..."
                        : "Reschedule"}
                    </button>
                    <button
                      onClick={() => handleAction(appt._id, "Completed")}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      disabled={loadingActionId === appt._id + "Completed"}
                    >
                      {loadingActionId === appt._id + "Completed"
                        ? "Completing..."
                        : "Complete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      {editingAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Reschedule</h3>
            <div className="mb-2">
              <label className="block text-sm">New Date</label>
              <DatePicker
                selected={newDate}
                onChange={(d) => {
                  setNewDate(d);
                  setSelectedSlotId("");
                }}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Select Slot</label>
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 text-sm mt-1">
                  No available slots for this date
                </p>
              ) : (
                <select
                  className="border p-2 rounded w-full"
                  value={selectedSlotId}
                  onChange={(e) => {
                    setSelectedSlotId(e.target.value);
                    const slot = availableSlots.find(
                      (s) => s._id === e.target.value
                    );
                    if (slot) {
                      setNewStart(slot.startTime);
                      setNewEnd(slot.endTime);
                    }
                  }}
                >
                  <option value="">-- Select Slot --</option>
                  {availableSlots.map((slot) => (
                    <option key={slot._id} value={slot._id}>
                      {slot.day} ({formatDate(slot.date)}) |{" "}
                      {formatTimeRange(slot.startTime, slot.endTime)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingAppt(null)}
                className="bg-gray-200 px-3 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
                className="bg-blue-600 text-white px-3 py-2 rounded"
                disabled={
                  !selectedSlotId ||
                  loadingActionId === editingAppt._id + "Reschedule"
                }
              >
                {loadingActionId === editingAppt._id + "Reschedule"
                  ? "Rescheduling..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
