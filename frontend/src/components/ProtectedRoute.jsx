import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { token, isGuest } = useContext(AuthContext);

  if (!token && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
