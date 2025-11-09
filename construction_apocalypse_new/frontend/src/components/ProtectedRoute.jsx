import { Navigate } from "react-router-dom";
import { authAPI } from "../utils/api";

function ProtectedRoute({ children }) {
  const isAuthenticated = authAPI.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

