import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "../../components/PatientSidebar";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState(null);

  const navigate = useNavigate();
  const API = "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || res.data?.doctors || []);
    } catch (err) {
      console.error("fetchDoctors:", err);
      toast.error("Failed to load doctors");
    }
  };

  const fetchSlots = async () => {
    if (!selectedDoctor) {
      toast.info("Please select a doctor");
      return;
    }
    if (!selectedDate) {
      toast.info("Please select a date");
      return;
    }
    setLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await axios.get(`${API}/slots/available`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          doctorId: selectedDoctor,
          date: dateStr,
        },
      });
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error("fetchSlots:", err);
      toast.error(err.response?.data?.message || "Failed to fetch slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (slot) => {
    if (!user || !user.id) {
      toast.error("User info missing. Please login again.");
      return;
    }

    setBookingSlotId(slot._id); // set loading state for this slot

    try {
      const payload = {
        patientId: user.id,
        doctorId: slot.doctorId?._id || selectedDoctor,
        slotId: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };

      await axios.post(`${API}/appointments`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Appointment booked!");
      navigate("/patient/appointments");
    } catch (err) {
      console.error("booking failed:", err);
      const msg = err.response?.data?.message || "Booking failed";
      toast.error(msg);
    } finally {
      setBookingSlotId(null); // reset loading state
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PatientSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Book Appointment</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Side */}
            <div className="md:col-span-1 bg-white p-4 rounded shadow">
              <label className="block text-sm text-gray-600 mb-2">
                Choose Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name} {d.specialty ? `— ${d.specialty}` : ""}
                  </option>
                ))}
              </select>

              <label className="block text-sm text-gray-600 mb-2">
                Select Date
              </label>
              <Calendar
                value={selectedDate}
                onChange={(d) => setSelectedDate(d)}
                minDate={new Date()}
              />

              <button
                onClick={fetchSlots}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loadingSlots ? "Loading..." : "Check Slots"}
              </button>
            </div>

            {/* Right Side */}
            <div className="md:col-span-2 bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Available Slots</h2>

              {!selectedDoctor || !selectedDate ? (
                <p className="text-gray-500">
                  Please select doctor and date to view slots.
                </p>
              ) : loadingSlots ? (
                <p>Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-gray-500">
                  No slots available for this date.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => {
                    const slotDate = new Date(slot.date);
                    const start = new Date(slot.startTime);
                    const end = new Date(slot.endTime);

                    const dayName = slotDate.toLocaleDateString("en-US", {
                      weekday: "long",
                    });
                    const dateStr = slotDate.toLocaleDateString("en-GB");
                    const startTimeStr = start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });
                    const endTimeStr = end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <div
                        key={slot._id}
                        className="flex justify-between items-center border-b py-2 px-3 bg-white rounded-md shadow-sm hover:shadow-md transition"
                      >
                        <span className="font-medium text-gray-800">
                          {dayName} &nbsp;&nbsp; {dateStr} &nbsp;&nbsp;{" "}
                          {startTimeStr} - {endTimeStr}
                        </span>

                        <button
                          onClick={() => handleBook(slot)}
                          disabled={bookingSlotId === slot._id} // disable when loading
                          className={`px-4 py-1 rounded-md transition ${
                            bookingSlotId === slot._id
                              ? "bg-blue-400 text-white cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {bookingSlotId === slot._id ? "Booking..." : "Book"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
