import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/dashboard";
import Users from "../pages/Users";
import Products from "../pages/products";
import ProductRMC from "../pages/productRMC";
import Login from "../pages/login";
import ProtectedRoute from "../components/protectedRoutess";
import { useParams } from "react-router";
import Vendors from "../pages/vendors";
import VendorDetail from "../pages/VendorDetail";
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
            <Route path="products/:id" element={<ProductRMC />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/:id" element={<VendorDetail />} />
            <Route
              path="clients"
              element={
                <div className="p-6">
                  <h1>Clients Page</h1>
                </div>
              }
            />
            <Route
              path="leads"
              element={
                <div className="p-6">
                  <h1>Leads Page</h1>
                </div>
              }
            />
            <Route
              path="projects"
              element={
                <div className="p-6">
                  <h1>Projects Page</h1>
                </div>
              }
            />
            <Route
              path="orders"
              element={
                <div className="p-6">
                  <h1>Orders & Tracks Page</h1>
                </div>
              }
            />
            <Route
              path="orders/all"
              element={
                <div className="p-6">
                  <h1>All Orders Page</h1>
                </div>
              }
            />
            <Route
              path="orders/pending"
              element={
                <div className="p-6">
                  <h1>Pending Orders Page</h1>
                </div>
              }
            />
            <Route
              path="orders/completed"
              element={
                <div className="p-6">
                  <h1>Completed Orders Page</h1>
                </div>
              }
            />
            <Route
              path="testing"
              element={
                <div className="p-6">
                  <h1>Cube Testing Page</h1>
                </div>
              }
            />
            <Route
              path="billing"
              element={
                <div className="p-6">
                  <h1>Billing Page</h1>
                </div>
              }
            />
            <Route
              path="reports"
              element={
                <div className="p-6">
                  <h1>Reports Page</h1>
                </div>
              }
            />
            <Route
              path="settings"
              element={
                <div className="p-6">
                  <h1>Settings Page</h1>
                </div>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
