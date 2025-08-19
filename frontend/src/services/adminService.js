// src/services/adminService.js
import API from "./api";

export const fetchDashboardStats = () => API.get("/admin/dashboard/stats");
export const fetchRecentAppointments = () =>
  API.get("/admin/dashboard/appointments/recent");

// Fetch admin profile
export const fetchAdminProfile = () => API.get("/admin/profile");

// Update admin profile
export const updateAdminProfile = (data) => API.put("/admin/profile", data);
