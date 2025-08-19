// src/services/profileService.js
import API from "./api";

// Fetch patient profile
export const fetchPatientProfile = () => API.get("/patients/profile");

// Update patient profile
export const updatePatientProfile = (data) =>
  API.put("/patients/profile", data);
