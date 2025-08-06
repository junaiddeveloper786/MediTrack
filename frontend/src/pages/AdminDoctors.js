import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import DoctorForm from "../components/DoctorForm";
import toast from "react-hot-toast";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchDoctors = async () => {
    const res = await axios.get("/doctors");
    setDoctors(res.data);
  };

  const handleAdd = async (data) => {
    try {
      await axios.post("/doctors", data);
      toast.success("Doctor added");
      fetchDoctors();
      setShowForm(false);
    } catch (err) {
      toast.error("Error adding doctor");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await axios.put(`/doctors/${editing._id}`, data);
      toast.success("Doctor updated");
      fetchDoctors();
      setEditing(null);
      setShowForm(false);
    } catch (err) {
      toast.error("Error updating doctor");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this doctor?")) {
      await axios.delete(`/doctors/${id}`);
      toast.success("Doctor deleted");
      fetchDoctors();
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Doctors</h2>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => {
          setEditing(null);
          setShowForm(!showForm);
        }}
      >
        {showForm ? "Close Form" : "Add Doctor"}
      </button>

      {showForm && (
        <DoctorForm
          onSubmit={editing ? handleUpdate : handleAdd}
          initialData={editing}
          isEditing={!!editing}
        />
      )}

      <table className="w-full border mt-6">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Specialty</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc._id}>
              <td className="border p-2">{doc.name}</td>
              <td className="border p-2">{doc.specialty}</td>
              <td className="border p-2">{doc.email}</td>
              <td className="border p-2">{doc.phone}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => {
                    setEditing(doc);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(doc._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDoctors;
