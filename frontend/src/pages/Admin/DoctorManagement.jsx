import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/AdminSidebar"; // adjust path if needed

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    specialty: "",
    phone: "",
  });
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 5;

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      setDoctors(res.data);
      setCurrentPage(1); // reset page to 1 after fetch
    } catch (err) {
      toast.error("Failed to fetch doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/doctors", newDoctor);
      toast.success("Doctor added successfully");
      setShowModal(false);
      setNewDoctor({ name: "", email: "", specialty: "", phone: "" });
      fetchDoctors();
    } catch (err) {
      toast.error("Failed to add doctor");
    }
  };

  const handleEditClick = (doctor) => {
    setCurrentDoctor(doctor);
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/doctors/${currentDoctor._id}`,
        currentDoctor
      );
      toast.success("Doctor updated successfully");
      setEditModal(false);
      fetchDoctors();
    } catch (err) {
      toast.error("Failed to update doctor");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`);
      toast.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (err) {
      toast.error("Failed to delete doctor");
    }
  };

  // Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen font-sans bg-[#f3f6fc]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Doctor Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaPlus className="mr-2" /> Add Doctor
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-4 border-b">Name</th>
                <th className="text-left py-2 px-4 border-b">Email</th>
                <th className="text-left py-2 px-4 border-b">Specialty</th>
                <th className="text-left py-2 px-4 border-b">Phone</th>
                <th className="text-left py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.map((doc) => (
                <tr key={doc._id}>
                  <td className="py-2 px-4 border-b">{doc.name}</td>
                  <td className="py-2 px-4 border-b">{doc.email}</td>
                  <td className="py-2 px-4 border-b">{doc.specialty}</td>
                  <td className="py-2 px-4 border-b">{doc.phone}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => handleEditClick(doc)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(doc._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {doctors.length > doctorsPerPage && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-800 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
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

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <FaTimes />
              </button>
              <h3 className="text-xl font-bold mb-4 text-center">Add Doctor</h3>
              <form onSubmit={handleAddDoctor} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={newDoctor.name}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, name: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={newDoctor.email}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, email: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="specialty"
                  placeholder="Specialty"
                  value={newDoctor.specialty}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, specialty: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={newDoctor.phone}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, phone: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                >
                  Add Doctor
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
              <button
                onClick={() => setEditModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <FaTimes />
              </button>
              <h3 className="text-xl font-bold mb-4 text-center">
                Edit Doctor
              </h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={currentDoctor?.name || ""}
                  onChange={(e) =>
                    setCurrentDoctor({ ...currentDoctor, name: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={currentDoctor?.email || ""}
                  onChange={(e) =>
                    setCurrentDoctor({
                      ...currentDoctor,
                      email: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="specialty"
                  placeholder="Specialty"
                  value={currentDoctor?.specialty || ""}
                  onChange={(e) =>
                    setCurrentDoctor({
                      ...currentDoctor,
                      specialty: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={currentDoctor?.phone || ""}
                  onChange={(e) =>
                    setCurrentDoctor({
                      ...currentDoctor,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded"
                  required
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
};

export default DoctorManagement;
