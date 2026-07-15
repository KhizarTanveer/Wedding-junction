import { Route } from "react-router-dom";
import { VendorRoute } from "../components/guards";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import VendorBookings from "../pages/vendor/VendorBookings";
import VendorProfile from "../pages/vendor/VendorProfile";

export const vendorRoutes = (
  <>
    <Route
      path="/vendor"
      element={
        <VendorRoute>
          <VendorDashboard />
        </VendorRoute>
      }
    />
    <Route
      path="/vendor/bookings"
      element={
        <VendorRoute>
          <VendorBookings />
        </VendorRoute>
      }
    />
    <Route
      path="/vendor/profile"
      element={
        <VendorRoute>
          <VendorProfile />
        </VendorRoute>
      }
    />
  </>
);
