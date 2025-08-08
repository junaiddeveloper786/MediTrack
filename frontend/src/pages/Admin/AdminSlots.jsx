import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminSlots() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  // form
  const [doctorId, setDoctorId] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [startTime, setStartTime] = useState(""); // "09:00"
  const [endTime, setEndTime] = useState("");

  // filter
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSlots(); // initial load
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      // backend should return array of doctors (res.data or res.data.doctors)
      // adapt to your API shape:
      setDoctors(res.data || res.data.doctors || []);
    } catch (err) {
      console.error("fetchDoctors error:", err);
      toast.error("Failed to fetch doctors");
    }
  };

  const fetchSlots = async (opts = {}) => {
    try {
      let url = "http://localhost:5000/api/slots";
      const params = new URLSearchParams();
      if (opts.doctorId) params.append("doctorId", opts.doctorId);
      if (opts.fromDate && opts.toDate) {
        params.append("fromDate", opts.fromDate.toISOString());
        params.append("toDate", opts.toDate.toISOString());
      }
      const query = params.toString();
      if (query) url += `?${query}`;

      const res = await axios.get(url);
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error("fetchSlots error:", err);
      toast.error("Failed to fetch slots");
    }
  };

  // create slots in range
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!doctorId || !fromDate || !toDate || !startTime || !endTime) {
      return toast.error("All fields are required");
    }
    try {
      const body = {
        doctorId,
        startDate: fromDate.toISOString(),
        endDate: toDate.toISOString(),
        startTime,
        endTime,
      };
      const res = await axios.post("http://localhost:5000/api/slots", body);
      if (res.data.success) {
        toast.success("Slots created");
        // refresh slots for current filter
        fetchSlots({
          doctorId: filterDoctor || undefined,
          fromDate: filterFrom,
          toDate: filterTo,
        });
      } else {
        toast.info(res.data.message || "No slots created");
      }
    } catch (err) {
      console.error("create error:", err);
      toast.error(err.response?.data?.message || "Failed to create slots");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/slots/${id}`);
      toast.success("Deleted");
      fetchSlots({
        doctorId: filterDoctor || undefined,
        fromDate: filterFrom,
        toDate: filterTo,
      });
    } catch (err) {
      console.error("delete error:", err);
      toast.error("Failed to delete");
    }
  };

  // apply filter
  const applyFilter = () => {
    setFilterDoctor(filterDoctor);
    setFilterFrom(filterFrom);
    setFilterTo(filterTo);
    fetchSlots({
      doctorId: filterDoctor || undefined,
      fromDate: filterFrom,
      toDate: filterTo,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Admin — Doctor Slot Management
      </h2>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-6 bg-white p-4 rounded shadow"
      >
        <div className="md:col-span-2">
          <label className="text-sm block mb-1">Doctor</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(d) => setFromDate(d)}
            selectsStart
            startDate={fromDate}
            endDate={toDate}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(d) => setToDate(d)}
            selectsEnd
            startDate={fromDate}
            endDate={toDate}
            minDate={fromDate}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="md:col-span-6 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Slots
          </button>
          <button
            type="button"
            onClick={() => {
              setDoctorId("");
              setFromDate(null);
              setToDate(null);
              setStartTime("");
              setEndTime("");
            }}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-3 items-end mb-4">
        <div>
          <label className="text-sm block mb-1">Filter Doctor</label>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All doctors</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">From</label>
          <DatePicker
            selected={filterFrom}
            onChange={(d) => setFilterFrom(d)}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">To</label>
          <DatePicker
            selected={filterTo}
            onChange={(d) => setFilterTo(d)}
            className="border p-2 rounded"
            minDate={filterFrom}
          />
        </div>

        <div>
          <button
            onClick={applyFilter}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setFilterDoctor("");
              setFilterFrom(null);
              setFilterTo(null);
              fetchSlots();
            }}
            className="ml-2 bg-gray-200 px-3 py-2 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Available Slots</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Doctor</th>
              <th className="p-2 text-left">Day</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No slots found
                </td>
              </tr>
            ) : (
              slots.map((slot) => (
                <tr key={slot._id} className="border-t">
                  <td className="p-2">{slot.doctorId?.name || "N/A"}</td>
                  <td className="p-2">{slot.day}</td>
                  <td className="p-2">
                    {new Date(slot.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
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
    </div>
  );
}
