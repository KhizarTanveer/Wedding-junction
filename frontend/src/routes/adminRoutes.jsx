import { Route } from "react-router-dom";
import { AdminRoute } from "../components/guards";
import Dashboard from "../pages/admin/Dashboard";
import ManageVendors from "../pages/admin/ManageVendors";
import ManageCategories from "../pages/admin/ManageCategories";
import ManageServices from "../pages/admin/ManageServices";
import ManageReviews from "../pages/admin/ManageReviews";

export const adminRoutes = (
  <>
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/vendors"
      element={
        <AdminRoute>
          <ManageVendors />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/categories"
      element={
        <AdminRoute>
          <ManageCategories />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/services"
      element={
        <AdminRoute>
          <ManageServices />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/reviews"
      element={
        <AdminRoute>
          <ManageReviews />
        </AdminRoute>
      }
    />
  </>
);
