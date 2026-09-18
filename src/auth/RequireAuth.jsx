import { useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return children;
}
