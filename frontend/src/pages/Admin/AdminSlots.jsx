import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminSlots() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // form fields
  const [doctorId, setDoctorId] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(15);

  // edit slot
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  // filter fields
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDoctors();
    fetchSlots();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
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
      setCurrentPage(1); // Reset to first page when data changes
    } catch (err) {
      console.error("fetchSlots error:", err);
      toast.error("Failed to fetch slots");
    }
  };

  // create slots in range
  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !doctorId ||
      !fromDate ||
      !toDate ||
      !startTime ||
      !endTime ||
      !slotDuration
    ) {
      return toast.error("All fields are required");
    }
    try {
      const body = {
        doctorId,
        startDate: fromDate.toISOString(),
        endDate: toDate.toISOString(),
        startTime,
        endTime,
        slotDuration,
      };
      console.log("Sending body:", body); // Debug log

      const res = await axios.post("http://localhost:5000/api/slots", body);
      if (res.data.success) {
        toast.success("Slots created");
        fetchSlots({
          doctorId: filterDoctor || undefined,
          fromDate: filterFrom,
          toDate: filterTo,
        });
        // reset form
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
      console.error("create error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create slots");
    }
  };

  // delete slot
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

  // update slot
  const handleUpdate = async (id) => {
    if (!editStartTime || !editEndTime) {
      toast.error("Start time and End time are required");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/slots/${id}`, {
        startTime: editStartTime,
        endTime: editEndTime,
      });
      if (res.data.success) {
        toast.success("Slot updated successfully");
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
      console.error("update error:", err);
      toast.error(err.response?.data?.message || "Failed to update slot");
    }
  };

  // apply filter
  const applyFilter = () => {
    fetchSlots({
      doctorId: filterDoctor || undefined,
      fromDate: filterFrom,
      toDate: filterTo,
    });
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSlots = slots.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(slots.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f3f6fc]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Doctor Slot Management</h2>

        {/* Create Form */}
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-6 bg-white p-6 rounded shadow"
        >
          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">From Date</label>
            <DatePicker
              selected={fromDate}
              onChange={(d) => setFromDate(d)}
              selectsStart
              startDate={fromDate}
              endDate={toDate}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">To Date</label>
            <DatePicker
              selected={toDate}
              onChange={(d) => setToDate(d)}
              selectsEnd
              startDate={fromDate}
              endDate={toDate}
              minDate={fromDate}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">
              Slot Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="md:col-span-6 flex gap-3 mt-4">
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
              {currentSlots.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No slots found
                  </td>
                </tr>
              ) : (
                currentSlots.map((slot) => (
                  <tr key={slot._id} className="border-t">
                    <td className="p-2">{slot.doctorId?.name || "N/A"}</td>
                    <td className="p-2">{slot.day}</td>
                    <td className="p-2">
                      {new Date(slot.date).toLocaleDateString()}
                    </td>

                    <td className="p-2">
                      {editingSlotId === slot._id ? (
                        <>
                          <input
                            type="time"
                            value={editStartTime}
                            onChange={(e) => setEditStartTime(e.target.value)}
                            className="border p-1 rounded mr-2"
                          />
                          <input
                            type="time"
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(e.target.value)}
                            className="border p-1 rounded"
                          />
                        </>
                      ) : (
                        <>
                          {(() => {
                            try {
                              const startDateTime = new Date(slot.startTime);
                              const endDateTime = new Date(slot.endTime);

                              if (
                                isNaN(startDateTime.getTime()) ||
                                isNaN(endDateTime.getTime())
                              ) {
                                return "Invalid Time";
                              }

                              return (
                                <>
                                  {startDateTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}{" "}
                                  -{" "}
                                  {endDateTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </>
                              );
                            } catch {
                              return "Invalid Time";
                            }
                          })()}
                        </>
                      )}
                    </td>

                    <td className="p-2 flex gap-2">
                      {editingSlotId === slot._id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(slot._id)}
                            className="bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSlotId(null)}
                            className="bg-gray-400 text-white px-2 py-1 rounded"
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
                                new Date(slot.endTime)
                                  .toISOString()
                                  .slice(11, 16)
                              );
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(slot._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
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
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? "bg-blue-800 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
