import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminSlots() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editSlotDate, setEditSlotDate] = useState("");

  const [doctorId, setDoctorId] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(15);

  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDoctors();
    fetchSlots();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      setDoctors(res.data?.doctors || []);
    } catch (err) {
      console.error(err);
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
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url);
      setSlots(res.data?.slots || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch slots");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !doctorId ||
      !fromDate ||
      !toDate ||
      !startTime ||
      !endTime ||
      !slotDuration
    )
      return toast.error("All fields are required");

    try {
      const body = {
        doctorId,
        startDate: fromDate.toISOString(),
        endDate: toDate.toISOString(),
        startTime,
        endTime,
        slotDuration,
      };
      const res = await axios.post("http://localhost:5000/api/slots", body);
      if (res.data.success) {
        toast.success("Slots created");
        fetchSlots({
          doctorId: filterDoctor || undefined,
          fromDate: filterFrom,
          toDate: filterTo,
        });
        setDoctorId("");
        setFromDate(null);
        setToDate(null);
        setStartTime("");
        setEndTime("");
        setSlotDuration(15);
      } else {
        toast.info(res.data.message || "No slots created");
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const handleUpdate = async (id, slotDate) => {
    if (!editStartTime || !editEndTime)
      return toast.error("Start and End times required");

    try {
      const [year, month, day] = slotDate.split("-").map(Number);
      const [sh, sm] = editStartTime.split(":").map(Number);
      const [eh, em] = editEndTime.split(":").map(Number);

      const startDateTime = new Date(year, month - 1, day, sh, sm);
      const endDateTime = new Date(year, month - 1, day, eh, em);

      if (isNaN(startDateTime) || isNaN(endDateTime))
        return toast.error("Invalid date/time");

      const res = await axios.put(`http://localhost:5000/api/slots/${id}`, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      if (res.data.success) {
        toast.success("Slot updated");
        setEditingSlotId(null);
        fetchSlots({
          doctorId: filterDoctor || undefined,
          fromDate: filterFrom,
          toDate: filterTo,
        });
      } else {
        toast.error(res.data.message || "Failed to update slot");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update slot");
    }
  };

  const applyFilter = () => {
    fetchSlots({
      doctorId: filterDoctor || undefined,
      fromDate: filterFrom,
      toDate: filterTo,
    });
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSlots = slots.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(slots.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Doctor Slot Management</h2>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end mb-6 bg-white p-4 sm:p-6 rounded shadow"
      >
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">Doctor</label>
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
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            selectsStart
            startDate={fromDate}
            endDate={toDate}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            selectsEnd
            startDate={fromDate}
            endDate={toDate}
            minDate={fromDate}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">
            Slot Duration
          </label>
          <input
            type="number"
            min={5}
            max={180}
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-6 flex flex-col sm:flex-row gap-2 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
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
              setSlotDuration(30);
            }}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4 flex-wrap">
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
            onChange={setFilterFrom}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">To</label>
          <DatePicker
            selected={filterTo}
            onChange={setFilterTo}
            minDate={filterFrom}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={applyFilter}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Slots Table */}
      <div className="overflow-x-auto bg-white rounded shadow p-4">
        <table className="w-full table-auto text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Doctor</th>
              <th className="p-2 text-left">Specialty</th> {/* New Column */}
              <th className="p-2 text-left">Day</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentSlots.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No slots found
                </td>
              </tr>
            ) : (
              currentSlots.map((slot) => (
                <tr key={slot._id} className="border-t">
                  {/* Doctor */}
                  <td className="p-2 align-middle">
                    {slot.doctorId?.name || "N/A"}
                  </td>

                  {/* Specialty */}
                  <td className="p-2 align-middle">
                    {slot.doctorId?.specialty || "N/A"}
                  </td>

                  {/* Day */}
                  <td className="p-2 align-middle">{slot.day}</td>

                  {/* Date */}
                  <td className="p-2 align-middle">
                    {new Date(slot.date).toLocaleDateString("en-GB")}
                  </td>

                  {/* Time */}
                  <td className="p-2 align-middle">
                    {editingSlotId === slot._id ? (
                      <div className="flex gap-1">
                        <input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          className="border p-1 rounded"
                        />
                        <input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="border p-1 rounded"
                        />
                      </div>
                    ) : (
                      (() => {
                        try {
                          const start = new Date(slot.startTime);
                          const end = new Date(slot.endTime);
                          if (isNaN(start) || isNaN(end)) return "Invalid Time";
                          return `${start.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })} - ${end.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}`;
                        } catch {
                          return "Invalid Time";
                        }
                      })()
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-2 align-middle flex gap-2">
                    {editingSlotId === slot._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(slot._id, editSlotDate)}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSlotId(null)}
                          className="bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingSlotId(slot._id);
                            setEditStartTime(
                              new Date(slot.startTime)
                                .toISOString()
                                .slice(11, 16)
                            );
                            setEditEndTime(
                              new Date(slot.endTime).toISOString().slice(11, 16)
                            );
                            setEditSlotDate(
                              new Date(slot.date).toISOString().slice(0, 10)
                            );
                          }}
                          className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slot._id)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
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
