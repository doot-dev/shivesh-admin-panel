// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
