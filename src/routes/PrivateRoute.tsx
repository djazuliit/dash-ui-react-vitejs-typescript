import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  // Jika token belum ada, redirect ke halaman login
  return token ? <Outlet /> : <Navigate to="/auth/sign-in" replace />;
};

export default PrivateRoute;
