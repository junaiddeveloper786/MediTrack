import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PatientSidebar from "../../components/PatientSidebar";

export default function PatientProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must login first");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5000/api/patients/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data?.user || res.data || {};
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
        });
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
        });
      })
      .catch((err) => {
        console.error("Failed to load profile", err.response || err.message);
        toast.error(
          err.response?.data?.message || "Failed to load profile data"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "http://localhost:5000/api/patients/profile",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile updated successfully!");
      setProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: profile.role,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error("Update failed", err.response || err.message);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PatientSidebar />
      <main className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        <div className="bg-white p-6 rounded shadow space-y-4 max-w-md">
          <div>
            <strong>Name:</strong> {profile.name}
          </div>
          <div>
            <strong>Email:</strong> {profile.email}
          </div>
          <div>
            <strong>Phone:</strong> {profile.phone || "N/A"}
          </div>
          <div>
            <strong>Role:</strong> {profile.role}
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>

        {/* Edit Modal */}
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
                Edit Profile
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
                  disabled={updating}
                  className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
