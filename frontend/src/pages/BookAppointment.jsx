import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [slots, setSlots] = useState([]);
  const [patientId, setPatientId] = useState(""); // from auth in real app

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/doctors")
      .then((res) => setDoctors(res.data));
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    axios
      .get(`http://localhost:5000/api/slots?doctorId=${selectedDoctor}`)
      .then((res) => setSlots(res.data.slots || []));
  }, [selectedDoctor]);

  const book = async (slot) => {
    try {
      const body = {
        patientId, // replace with logged in user id
        doctorId: slot.doctorId,
        slotId: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
      await axios.post("http://localhost:5000/api/appointments", body);
      toast.success("Booked");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="">Select doctor</option>
        {doctors.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </select>

      <div className="grid gap-3">
        {slots.map((s) => (
          <div
            key={s._id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <div>
                {new Date(s.date).toLocaleDateString()} ({s.day})
              </div>
              <div>
                {s.startTime} - {s.endTime}
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => book(s)}
            >
              Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
