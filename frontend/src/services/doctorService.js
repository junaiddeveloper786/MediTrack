// src/services/doctorService.js
import API from "./api";

export const fetchDoctors = () => API.get("/doctors");
export const addDoctor = (data) => API.post("/doctors", data);
export const updateDoctor = (id, data) => API.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => API.delete(`/doctors/${id}`);
