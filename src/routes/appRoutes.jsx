import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/layouts";
import Dashboard from "../pages/dashboard";
import Users from "../pages/userss";
import Products from "../pages/products";
import ProductDetails from "../pages/productDetails";
import Login from "../pages/login";
import ProtectedRoute from "./protectedRoutess";
import { useParams } from "react-router";
import Vendors from "../pages/vendors";
import VendorDetail from "../pages/vendorDetails";
import ComingSoon from "../pages/comingSoonn";
import LeadsPage from "../pages/leads";
import LeadsDetailsPage from "../pages/leadsDetails";
import Client from "../pages/client";
import ClientDetails from "../pages/clientDetails";
import ProjectsPage from "../pages/projects";
import ProjectsDetails from "../pages/projectsDetails";
import OrdersPage from "../pages/orders";
import OrderDetailsPage from "../pages/orderDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}

        <Route path="/" element={<Login />} />

        {/* Protected routes - single ProtectedRoute wrapper with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/:id" element={<VendorDetail />} />
            <Route path="clients" element={<Client />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadsDetailsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectsDetails />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="orders/all" element={<ComingSoon />} />
            <Route path="orders/pending" element={<ComingSoon />} />
            <Route path="orders/completed" element={<ComingSoon />} />
            <Route path="testing" element={<ComingSoon />} />
            <Route path="billing" element={<ComingSoon />} />
            <Route path="reports" element={<ComingSoon />} />
            <Route path="settings" element={<ComingSoon />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
