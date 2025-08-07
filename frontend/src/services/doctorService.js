import axios from "axios";

const API = "http://localhost:5000/api/doctors";

export const fetchDoctors = () => axios.get(API);
export const addDoctor = (data) => axios.post(API, data);
export const updateDoctor = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteDoctor = (id) => axios.delete(`${API}/${id}`);
