// src/services/slotService.js
import API from "./api";

export const fetchAvailableSlots = (doctorId, date) =>
  API.get("/slots/available", { params: { doctorId, date } });

export const fetchSlots = (filters = {}) =>
  API.get("/slots", { params: filters });

export const createSlots = (data) => API.post("/slots", data);

export const updateSlot = (id, data) => API.put(`/slots/${id}`, data);

export const deleteSlot = (id) => API.delete(`/slots/${id}`);

export const fetchDoctors = () => API.get("/doctors");
