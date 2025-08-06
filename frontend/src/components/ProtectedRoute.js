import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { Navigate } from "react-router-dom";
import axios from "../services/axios";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const getUser = async () => {
    try {
      const res = await axios.get("/users/me");
      dispatch(setUser(res.data));
    } catch (err) {
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    if (!user && localStorage.getItem("token")) {
      getUser();
    }
  }, [user]);

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
