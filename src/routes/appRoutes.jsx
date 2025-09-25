import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Layout from "../components/layout/Layout";
// import Dashboard from "../pages/Dashboard";
// import Users from "../pages/Users";
// import Settings from "../pages/Settings";
import Login from "../pages/login";
import ProtectedRoute from "../components/ProtectedRoute";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes wrapped in Layout */}
        {/* <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
