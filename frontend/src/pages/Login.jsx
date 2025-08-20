import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: val });

    if (name === "email" || name === "password") validateField(name, val);
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value))
        error = "Invalid email address";
    }
    if (name === "password" && !value) error = "Password is required";
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;

      // Store token & user based on "remember me"
      if (formData.remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      toast.success("Login successful");

      const userRole = user?.role;
      if (userRole === "admin") navigate("/admin/dashboard");
      else navigate("/patient/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5faff] to-[#eaf3ff]">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white text-4xl font-bold leading-none pb-[9px]">
              +
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MediTrack</h1>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-8 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="mr-2"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer link */}
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
