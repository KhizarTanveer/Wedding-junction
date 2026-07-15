import { Route } from "react-router-dom";
import Home from "../pages/Home";
import Services from "../pages/Services";
import Vendors from "../pages/Vendors";
import VendorDetail from "../pages/VendorDetail";
import ExploreVendor from "../pages/ExploreVendor";
import CategoryDetails from "../pages/CategoryDetails";
import ExploreCategory from "../pages/ExploreCategory";
import ExploreVendorDetails from "../pages/ExploreVendorDetails";

export const publicRoutes = (
  <>
    {/* Main Pages */}
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/vendors" element={<Vendors />} />
    <Route path="/vendors/:id" element={<VendorDetail />} />
    <Route path="/explorevendor/:id" element={<ExploreVendor />} />

    {/* Categories */}
    <Route path="/category/:categoryName" element={<CategoryDetails />} />
    <Route path="/explore/:categoryName" element={<ExploreCategory />} />

    {/* Vendor Details */}
    <Route path="/explore/vendor-details" element={<ExploreVendorDetails />} />
  </>
);
