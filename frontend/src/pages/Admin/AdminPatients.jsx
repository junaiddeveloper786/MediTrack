import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form data
  const initialFormState = { name: "", email: "", phone: "", password: "" };
  const [formData, setFormData] = useState(initialFormState);
  const [editPatientId, setEditPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data.patients || []);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to fetch patients");
      console.error("Fetch patients error:", err.response || err.message);
    }
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must login first");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Patient deleted");
      fetchPatients();
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message || "Failed to delete patient");
        console.error("Delete patient API error:", err.response.data);
      } else {
        toast.error("Failed to delete patient");
        console.error("Delete patient error:", err.message);
      }
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (patient) => {
    setEditPatientId(patient._id);
    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      password: "", // blank here, user can enter new password if needed
    });
    setShowEditModal(true);
  };

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add patient submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must login first");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/patients", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Patient added");
      setShowAddModal(false);
      fetchPatients();
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message || "Failed to add patient");
        console.error("Add patient API error:", err.response.data);
      } else {
        toast.error("Failed to add patient");
        console.error("Add patient error:", err.message);
      }
    }
  };

  // Edit patient submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must login first");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await axios.put(
        `http://localhost:5000/api/patients/${editPatientId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Patient updated");
      setShowEditModal(false);
      fetchPatients();
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message || "Failed to update patient");
        console.error("Update patient API error:", err.response.data);
      } else {
        toast.error("Failed to update patient");
        console.error("Update patient error:", err.message);
      }
    }
  };

  // Filter patients by search (name, email, phone)
  const filteredPatients = patients.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f3f6fc]">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Patient Management</h2>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full max-w-md"
          />
          <button
            onClick={openAddModal}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Patient
          </button>
        </div>

        <div className="bg-white rounded shadow p-4 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                currentPatients.map((patient) => (
                  <tr key={patient._id} className="border-t">
                    <td className="p-2">{patient.name}</td>
                    <td className="p-2">{patient.email}</td>
                    <td className="p-2">{patient.phone || "-"}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => openEditModal(patient)}
                        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
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

        {/* Add Patient Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4 text-center">
                Add Patient
              </h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                >
                  Add Patient
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Patient Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4 text-center">
                Edit Patient
              </h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="New Password (leave blank to keep current)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
