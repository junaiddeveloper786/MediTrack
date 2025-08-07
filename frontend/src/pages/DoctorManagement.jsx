import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import DoctorForm from "../components/DoctorForm";

function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadDoctors = async () => {
    const res = await axios.get("http://localhost:5000/api/doctors");
    setDoctors(res.data);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/doctors/${id}`);
    loadDoctors();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Doctor Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => {
            setEditingDoctor(null);
            setShowForm(true);
          }}
        >
          <FaPlus /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold text-lg">{doc.name}</h3>
            <p>{doc.specialization}</p>
            <p className="text-sm text-gray-500">{doc.email}</p>
            <div className="flex gap-3 mt-4">
              <button
                className="bg-yellow-400 text-white px-2 py-1 rounded"
                onClick={() => {
                  setEditingDoctor(doc);
                  setShowForm(true);
                }}
              >
                <FaEdit />
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(doc._id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Form Modal */}
      {showForm && (
        <DoctorForm
          doctor={editingDoctor}
          onClose={() => {
            setShowForm(false);
            loadDoctors();
          }}
        />
      )}
    </div>
  );
}

export default DoctorManagement;
