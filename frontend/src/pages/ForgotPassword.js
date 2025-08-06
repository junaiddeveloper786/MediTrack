import React, { useState } from "react";
import axios from "../services/axios";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("Reset link sent to your email");
    } catch (err) {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="input w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
