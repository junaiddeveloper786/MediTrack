import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchPatients as fetchPatientsService,
  addPatient,
  updatePatient,
  deletePatient,
} from "../../services/patientService";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const initialFormState = { name: "", email: "", phone: "", password: "" };
  const [formData, setFormData] = useState(initialFormState);
  const [editPatientId, setEditPatientId] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetchPatientsService();
      setPatients(res.data.patients || []);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to fetch patients");
      console.error(err.response || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;
    try {
      await deletePatient(id);
      toast.success("Patient deleted");
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete patient");
      console.error(err.response || err.message);
    }
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const openEditModal = (patient) => {
    setEditPatientId(patient._id);
    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPatient(formData);
      toast.success("Patient added");
      setShowAddModal(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add patient");
      console.error(err.response || err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password?.trim()) delete payload.password;
      await updatePatient(editPatientId, payload);
      toast.success("Patient updated");
      setShowEditModal(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update patient");
      console.error(err.response || err.message);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
          Patient Management
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full md:max-w-md"
          />
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full md:w-auto"
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
                    <td className="p-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(patient)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
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
            <div className="flex flex-wrap justify-center mt-4 gap-2">
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

        {/* Add / Edit Modals */}
        {[
          { show: showAddModal, submit: handleAddSubmit, title: "Add Patient" },
          {
            show: showEditModal,
            submit: handleEditSubmit,
            title: "Edit Patient",
          },
        ].map(
          ({ show, submit, title }, idx) =>
            show && (
              <div
                key={idx}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
                  <button
                    onClick={() =>
                      idx === 0
                        ? setShowAddModal(false)
                        : setShowEditModal(false)
                    }
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-center">
                    {title}
                  </h3>
                  <form onSubmit={submit} className="space-y-4">
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
                      placeholder={
                        idx === 0
                          ? "Password"
                          : "New Password (leave blank to keep current)"
                      }
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      {...(idx === 0 && { required: true })}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                    >
                      {title}
                    </button>
                  </form>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
