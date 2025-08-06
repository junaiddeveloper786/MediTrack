import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import alertsReducer from "./alertsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alerts: alertsReducer,
  },
});
