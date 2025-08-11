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
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must login first");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5000/api/patient/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.user || res.data;
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
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

  // For form field changes
  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update profile to backend
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/patient/profile",
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Profile updated successfully!");
      setEditing(false);
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

        {!editing ? (
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
              onClick={() => setEditing(true)}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded shadow space-y-6 max-w-md"
          >
            <div>
              <label className="block font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1" htmlFor="role">
                Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                value={profile.role}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={updating}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
