// src/services/dashboardService.js
import API from "./api";

// Fetch patient dashboard stats
export const fetchPatientStats = () => API.get("/patient/dashboard/stats");

// Fetch recent appointments for patient
export const fetchRecentAppointments = () =>
  API.get("/patient/dashboard/recent");
