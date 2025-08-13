import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminProfile() {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    createdAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const API = process.env.REACT_APP_API_URL; // Your backend API URL
  const token = localStorage.getItem("token");

  // Fetch admin details from backend
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminData(data);
      } catch (error) {
        toast.error("Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [API, token]);

  // Handle input change
  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  // Save updated data
  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(`${API}/admin/profile`, adminData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Right Side */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Heading */}
          <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <img
                  src="https://via.placeholder.com/120"
                  alt="Admin"
                  className="w-28 h-28 rounded-full border-4 border-blue-100 mb-4"
                />
                {!editing ? (
                  <>
                    <h2 className="text-xl font-semibold">{adminData.name}</h2>
                    <p className="text-gray-500">{adminData.role}</p>
                  </>
                ) : (
                  <input
                    type="text"
                    name="name"
                    value={adminData.name}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 text-center w-60"
                  />
                )}
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {!editing ? (
                    <p className="font-medium">{adminData.email}</p>
                  ) : (
                    <input
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleChange}
                      className="border rounded px-3 py-2 w-full"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {!editing ? (
                    <p className="font-medium">{adminData.phone}</p>
                  ) : (
                    <input
                      type="text"
                      name="phone"
                      value={adminData.phone}
                      onChange={handleChange}
                      className="border rounded px-3 py-2 w-full"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{adminData.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined On</p>
                  <p className="font-medium">{adminData.createdAt}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
