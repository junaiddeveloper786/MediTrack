import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  const fetchDoctor = async () => {
    const res = await axios.get(`/doctors/${doctorId}`);
    setDoctor(res.data);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    const daySlots = doctor.availableSlots.find(
      (slot) => slot.date === e.target.value
    );
    setAvailableTimes(daySlots ? daySlots.times : []);
    setSelectedTime("");
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      return toast.error("Please select date and time");
    }

    try {
      await axios.post("/appointments", {
        doctorId,
        appointmentDate: `${selectedDate}T${selectedTime}`,
      });
      toast.success("Appointment booked");
      navigate("/appointments");
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  return (
    <div className="p-6">
      {doctor && (
        <>
          <h2 className="text-2xl font-bold mb-2">
            Book with Dr. {doctor.name}
          </h2>
          <p className="text-gray-600 mb-4">{doctor.specialty}</p>

          <label className="block mb-2">Select Date:</label>
          <input
            type="date"
            className="border p-2 mb-4 block"
            min={new Date().toISOString().split("T")[0]}
            onChange={handleDateChange}
          />

          {availableTimes.length > 0 ? (
            <>
              <label className="block mb-2">Select Time:</label>
              <select
                className="border p-2 mb-4 block"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">-- Select a Time --</option>
                {availableTimes.map((time, idx) => (
                  <option key={idx} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleBooking}
              >
                Confirm Booking
              </button>
            </>
          ) : (
            selectedDate && (
              <p className="text-red-500">
                No available time slots for this date
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}

export default BookAppointment;
