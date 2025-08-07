import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/doctors/available"
      );
      setDoctors(res.data);
    };
    load();
  }, []);

  const bookSlot = async (doctorId, slot) => {
    try {
      await axios.post(
        "http://localhost:5000/api/appointments/book",
        { doctorId, slot },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Appointment booked!");
      setSelectedSlot(null);
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Book Appointment</h2>

      <div className="grid gap-4">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            className="border p-4 rounded shadow-sm bg-white space-y-2"
          >
            <div className="text-lg font-semibold">{doc.name}</div>
            <div className="text-sm text-gray-600">{doc.specialty}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {doc.availableSlots?.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => bookSlot(doc._id, slot)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {new Date(slot).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookAppointment;
