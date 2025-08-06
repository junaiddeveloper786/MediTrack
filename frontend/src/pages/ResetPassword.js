import React, { useState } from "react";
import axios from "../services/axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password updated! Please login.");
    } catch (err) {
      toast.error("Invalid or expired link");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="input w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
