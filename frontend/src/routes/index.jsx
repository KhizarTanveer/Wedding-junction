import { Routes, Route } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { authRoutes } from "./authRoutes";
import { protectedRoutes } from "./protectedRoutes";
import { adminRoutes } from "./adminRoutes";
import { vendorRoutes } from "./vendorRoutes";
import { legalRoutes } from "./legalRoutes";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes}
      {authRoutes}
      {protectedRoutes}
      {adminRoutes}
      {vendorRoutes}
      {legalRoutes}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
