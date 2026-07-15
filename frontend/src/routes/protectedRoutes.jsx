import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/guards";
import Bookings from "../pages/Bookings";
import Payment from "../pages/Payment";
import PaymentSuccess from "../pages/PaymentSuccess";
import BecomeVendor from "../pages/BecomeVendor";
import Chat from "../pages/chat/Chat";

export const protectedRoutes = (
  <>
    {/* Bookings */}
    <Route
      path="/bookings"
      element={
        <PrivateRoute>
          <Bookings />
        </PrivateRoute>
      }
    />

    {/* Payments */}
    <Route
      path="/payment/:bookingId"
      element={
        <PrivateRoute>
          <Payment />
        </PrivateRoute>
      }
    />
    <Route
      path="/payment-success/:bookingId"
      element={
        <PrivateRoute>
          <PaymentSuccess />
        </PrivateRoute>
      }
    />

    {/* Become a Vendor */}
    <Route
      path="/become-vendor"
      element={
        <PrivateRoute>
          <BecomeVendor />
        </PrivateRoute>
      }
    />

    {/* Chat - unified split view */}
    <Route
      path="/chat"
      element={
        <PrivateRoute>
          <Chat />
        </PrivateRoute>
      }
    />
    <Route
      path="/chat/:conversationId"
      element={
        <PrivateRoute>
          <Chat />
        </PrivateRoute>
      }
    />
  </>
);
