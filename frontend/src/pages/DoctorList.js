import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import { useNavigate } from "react-router-dom";

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.log("Error fetching doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
      <div className="grid grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div key={doc._id} className="border rounded p-4 shadow">
            <h3 className="text-xl font-semibold">{doc.name}</h3>
            <p className="text-sm text-gray-600">{doc.specialty}</p>
            <p className="text-sm">Phone: {doc.phone}</p>
            <button
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => navigate(`/book/${doc._id}`)}
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorList;
