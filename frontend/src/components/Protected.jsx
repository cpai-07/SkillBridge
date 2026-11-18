import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted">Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}
