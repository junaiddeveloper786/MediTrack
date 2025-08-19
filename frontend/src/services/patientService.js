import API from "./api";

export const fetchPatients = () => API.get("/patients");

export const addPatient = (data) => API.post("/patients", data);

export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);

export const deletePatient = (id) => API.delete(`/patients/${id}`);
