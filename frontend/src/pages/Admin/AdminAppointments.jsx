import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // filters
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  // reschedule modal
  const [editingAppt, setEditingAppt] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      setDoctors(res.data || res.data.doctors || []);
    } catch (err) {
      toast.error("Failed to fetch doctors");
    }
  };

  const fetchAppointments = async (opts = {}) => {
    try {
      const params = new URLSearchParams();
      if (opts.doctorId) params.append("doctorId", opts.doctorId);
      if (opts.fromDate && opts.toDate) {
        params.append("fromDate", opts.fromDate.toISOString());
        params.append("toDate", opts.toDate.toISOString());
      }
      if (opts.status) params.append("status", opts.status);

      const query = params.toString();
      const url = query
        ? `http://localhost:5000/api/appointments?${query}`
        : "http://localhost:5000/api/appointments";
      const res = await axios.get(url);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error("Failed to fetch appointments");
    }
  };

  const applyFilter = () => {
    fetchAppointments({
      doctorId: filterDoctor || undefined,
      fromDate: filterFrom,
      toDate: filterTo,
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
    // action: 'Confirmed' or 'Cancelled'
    try {
      const body = { status: action };
      await axios.put(`http://localhost:5000/api/appointments/${id}`, body);
      toast.success(`Appointment ${action}`);
      fetchAppointments();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const openReschedule = (appt) => {
    setEditingAppt(appt);
    setNewDate(new Date(appt.date));
    setNewStart(appt.startTime);
    setNewEnd(appt.endTime);
  };

  const submitReschedule = async () => {
    if (!editingAppt) return;
    try {
      const body = {
        status: "Rescheduled",
        date: newDate.toISOString(),
        startTime: newStart,
        endTime: newEnd,
      };
      await axios.put(
        `http://localhost:5000/api/appointments/${editingAppt._id}`,
        body
      );
      toast.success("Rescheduled");
      setEditingAppt(null);
      fetchAppointments();
    } catch (err) {
      toast.error("Reschedule failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete appointment?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`);
      toast.success("Deleted");
      fetchAppointments();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin — Appointments</h2>

      {/* Filters */}
      <div className="flex gap-3 items-end mb-4">
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
          </select>
        </div>

        <div>
          <button
            onClick={applyFilter}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            Apply
          </button>
          <button
            onClick={clearFilter}
            className="ml-2 bg-gray-200 px-3 py-2 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow p-4">
        <table className="w-full table-auto">
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
                <tr key={appt._id} className="border-t">
                  <td className="p-2">{appt.patientId?.name || "—"}</td>
                  <td className="p-2">{appt.doctorId?.name || "—"}</td>
                  <td className="p-2">
                    {new Date(appt.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {appt.startTime} - {appt.endTime}
                  </td>
                  <td className="p-2">{appt.status}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleAction(appt._id, "Confirmed")}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(appt._id, "Cancelled")}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => openReschedule(appt)}
                      className="bg-yellow-400 px-2 py-1 rounded"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleDelete(appt._id)}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Reschedule</h3>
            <div className="mb-2">
              <label className="block text-sm">New Date</label>
              <DatePicker
                selected={newDate}
                onChange={(d) => setNewDate(d)}
                className="border p-2 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Start Time</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">End Time</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="border p-2 rounded w-full"
              />
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
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
