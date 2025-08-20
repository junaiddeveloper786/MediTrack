// src/services/appointmentService.js
import API from "./api";

/* ----------------- Admin Functions ----------------- */

// Fetch all appointments with optional filters
export const fetchAppointments = (filters) =>
  API.get("/appointments", { params: filters });

// Cancel an appointment
export const cancelAppointment = (id) => API.put(`/appointments/cancel/${id}`);

// Confirm an appointment
export const confirmAppointment = (id) =>
  API.put(`/appointments/confirm/${id}`);

// Complete an appointment
export const completeAppointment = (id) =>
  API.put(`/appointments/complete/${id}`);

// Reschedule an appointment
export const rescheduleAppointment = (id, data) =>
  API.put(`/appointments/reschedule/${id}`, data);

// Delete an appointment
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

/* ----------------- Patient Functions ----------------- */

// Fetch all doctors
export const fetchDoctors = () => API.get("/doctors");

// Fetch available slots for a doctor on a specific date
export const fetchAvailableSlots = (doctorId, date) =>
  API.get("/slots/available", { params: { doctorId, date } });

// Book a new appointment
export const bookAppointment = (payload) => API.post("/appointments", payload);

// Fetch appointments for the logged-in patient
// Pass patientId as query parameter
export const fetchPatientAppointments = (patientId) =>
  API.get("/appointments", { params: { patientId } });

// Cancel a patient appointment
export const cancelPatientAppointment = (appointmentId) =>
  API.put(`/appointments/cancel/${appointmentId}`);
