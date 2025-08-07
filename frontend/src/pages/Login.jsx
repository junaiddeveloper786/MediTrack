import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      // Save token
      localStorage.setItem("token", res.data.token);

      // Get user role
      const userRole = res.data.user?.role;

      toast.success("Login successful");

      // Navigate based on role
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/appointments/my");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6FAFF]">
      <div className="bg-white shadow-md rounded-lg p-10 w-[400px]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            +
          </div>
          <h1 className="ml-2 text-2xl font-semibold text-gray-800">
            MediTrack
          </h1>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-gray-600 text-sm">Email address</label>
            <input
              type="email"
              name="email"
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-600 text-sm">Password</label>
            <input
              type="password"
              name="password"
              className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
