import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function DoctorSlots() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    doctorId: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchDoctors();
    fetchSlots();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      setDoctors(res.data);
    } catch (err) {
      toast.error("Failed to fetch doctors");
    }
  };

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/slots/${doctorId}`
        );
        setSlots(res.data.slots); // 👈 make sure this is correct
      } catch (err) {
        console.error("Failed to fetch slots", err);
        toast.error("Failed to fetch slots");
      }
    };

    fetchSlots();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/slots", form);
      toast.success("Slot added successfully");
      fetchSlots();
      setForm({ doctorId: "", day: "", startTime: "", endTime: "" });
    } catch (err) {
      toast.error("Error adding slot");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/slots/${id}`);
      toast.success("Slot deleted");
      fetchSlots();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Doctor Slot Management</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow mb-6"
      >
        <select
          name="doctorId"
          value={form.doctorId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name}
            </option>
          ))}
        </select>

        <select
          name="day"
          value={form.day}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Day</option>
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <input
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Slot
        </button>
      </form>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-xl font-semibold mb-3">Available Slots</h3>
        {slots.length === 0 ? (
          <p>No slots added yet.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Doctor</th>
                <th className="p-2 text-left">Day</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot._id} className="border-b">
                  <td className="p-2">
                    {slot.doctorName || slot.doctor?.name}
                  </td>
                  <td className="p-2">{slot.day}</td>
                  <td className="p-2">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DoctorSlots;
