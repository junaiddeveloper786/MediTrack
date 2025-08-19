import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAdminProfile,
  updateAdminProfile,
} from "../../services/adminService";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [updating, setUpdating] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchAdminProfile();
        const data = res.data?.user || res.data || {};
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
        });
      } catch (err) {
        console.error("Failed to load profile", err.response || err.message);
        toast.error(
          err.response?.data?.message || "Failed to load profile data"
        );
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Open modal with current data
  const openEditModal = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      password: "",
    });
    setShowEditModal(true);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      if (formData.password?.trim()) payload.password = formData.password;

      await updateAdminProfile(payload);

      toast.success("Profile updated successfully!");
      setProfile((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }));
      setShowEditModal(false);
    } catch (err) {
      console.error("Update failed", err.response || err.message);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading profile...
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center md:text-left">
          Admin Profile
        </h1>

        <div className="bg-white p-6 rounded shadow space-y-4">
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
            onClick={openEditModal}
            className="mt-4 w-full md:w-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
      </div>
    </div>
  );
}
