import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [expiresAtUtc, setExpiresAtUtc] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    setExpiresAtUtc(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (loginEmail, password) => {
    setPending(true);
    setError(null);
    try {
      const { accessToken, expiresAtUtc: expiry } = await apiLogin(loginEmail, password);
      setToken(accessToken);
      setEmail(loginEmail);
      setExpiresAtUtc(expiry);
      return true;
    } catch (err) {
      setError(err.message || "Sign-in failed.");
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  const value = useMemo(
    () => ({ token, email, expiresAtUtc, error, pending, login, logout, isAuthenticated: Boolean(token) }),
    [token, email, expiresAtUtc, error, pending, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
