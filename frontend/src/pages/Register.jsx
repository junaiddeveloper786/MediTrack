import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register } from "../services/authService";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // loading state for submit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") checkPasswordStrength(value);
    validateField(name, value);
  };

  const checkPasswordStrength = (password) => {
    let strength = "Weak";
    const regexMedium = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    const regexStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (regexStrong.test(password)) strength = "Strong";
    else if (regexMedium.test(password)) strength = "Medium";
    else if (password.length >= 8) strength = "Weak";
    else strength = "";

    setPasswordStrength(strength);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (!/^[A-Za-z\s]+$/.test(value))
          error = "Name can only contain letters and spaces";
        else if (value.trim().length < 3)
          error = "Name must be at least 3 characters";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (
          !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
        )
          error = "Invalid email address";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value)
        )
          error =
            "Password must be 8+ chars, include upper & lower case, number & special char";
        break;

      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^\d{10}$/.test(value))
          error = "Phone number must be 10 digits";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    Object.keys(formData).forEach((key) => validateField(key, formData[key]));
    return Object.values(errors).every((e) => !e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      toast.success("Registered successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5faff] to-[#eaf3ff]">
      <div className="bg-white shadow-md rounded-lg p-10 w-[400px]">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white text-4xl font-bold leading-none pb-[9px]">
              +
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MediTrack</h1>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">
          Register
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full mb-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mb-2">{errors.name}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full mb-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email}</p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full mb-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mb-1">{errors.password}</p>
          )}
          {passwordStrength && (
            <p
              className={`text-sm mb-2 ${
                passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
          )}

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="w-full mb-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mb-2">{errors.phone}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-3 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
