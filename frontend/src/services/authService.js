import API from "./api";

// Login API call
export const login = (formData) => API.post("/auth/login", formData);

// Register API call
export const register = (formData) => API.post("/auth/register", formData);
