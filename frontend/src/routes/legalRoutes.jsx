import { Route } from "react-router-dom";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import Cookies from "../pages/Cookies";

export const legalRoutes = (
  <>
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/cookies" element={<Cookies />} />
  </>
);
