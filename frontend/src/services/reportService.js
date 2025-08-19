// src/services/reportService.js
import API from "./api";

// Fetch appointments report
export const fetchAppointmentsReport = ({ startDate, endDate, status }) =>
  API.get("/reports/appointments", { params: { startDate, endDate, status } });

// Fetch patients report
export const fetchPatientsReport = ({ startDate, endDate, search }) =>
  API.get("/reports/patients", { params: { startDate, endDate, search } });

// Fetch doctors report
export const fetchDoctorsReport = ({ startDate, endDate, search }) =>
  API.get("/reports/doctors", { params: { startDate, endDate, search } });

// Fetch slots report
export const fetchSlotsReport = ({ startDate, endDate, doctorId }) =>
  API.get("/reports/slots", { params: { startDate, endDate, doctorId } });
