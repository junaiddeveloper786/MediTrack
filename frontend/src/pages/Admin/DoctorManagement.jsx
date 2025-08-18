import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

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
  const doctorsPerPage = 10;

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      setDoctors(res.data);
      setCurrentPage(1);
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

  const filteredDoctors = doctors.filter(
    (doc) =>
      (doc.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#f3f6fc] min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
        Doctor Management
      </h2>

      {/* Search & Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full md:max-w-md"
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Doctor
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Email
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Specialty
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Phone
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-2">{doc.name}</td>
                  <td className="px-4 py-2">{doc.email}</td>
                  <td className="px-4 py-2">{doc.specialty}</td>
                  <td className="px-4 py-2">{doc.phone}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-2">
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                      onClick={() => handleEditClick(doc)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(doc._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredDoctors.length > doctorsPerPage && (
        <div className="flex justify-center mt-4 space-x-2 flex-wrap">
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

      {/* Add / Edit Modals */}
      {[
        {
          show: showModal,
          setShow: setShowModal,
          data: newDoctor,
          setData: setNewDoctor,
          onSubmit: handleAddDoctor,
          title: "Add Doctor",
        },
        {
          show: editModal,
          setShow: setEditModal,
          data: currentDoctor,
          setData: setCurrentDoctor,
          onSubmit: handleEditSubmit,
          title: "Edit Doctor",
        },
      ].map(
        ({ show, setShow, data, setData, onSubmit, title }, idx) =>
          show && (
            <div
              key={idx}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            >
              <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
                <button
                  onClick={() => setShow(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                  <FaTimes />
                </button>
                <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={data?.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full border px-4 py-2 rounded"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={data?.email || ""}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Specialty"
                    value={data?.specialty || ""}
                    onChange={(e) =>
                      setData({ ...data, specialty: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={data?.phone || ""}
                    onChange={(e) =>
                      setData({ ...data, phone: e.target.value })
                    }
                    className="w-full border px-4 py-2 rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                  >
                    {title.includes("Add") ? "Add Doctor" : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default DoctorManagement;
