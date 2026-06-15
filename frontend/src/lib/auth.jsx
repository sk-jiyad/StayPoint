// Auth state for the app: stores the backend AuthResponseDTO in localStorage and
// exposes login/register/logout plus derived flags via React context.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi, AUTH_KEY } from "./api";

const AuthContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // auth = { token, userId, email, role } | null
  const [auth, setAuth] = useState(readStored);

  const persist = useCallback((data) => {
    setAuth(data);
    if (data) localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    else localStorage.removeItem(AUTH_KEY);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login({ email, password });
      persist(data);
      return data;
    },
    [persist]
  );

  const register = useCallback(
    async (email, password, role) => {
      const data = await authApi.register({ email, password, role });
      persist(data);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({
      user: auth ? { userId: auth.userId, email: auth.email, role: auth.role } : null,
      isAuthenticated: Boolean(auth?.token),
      isOwner: auth?.role === "ROLE_OWNER",
      isAdmin: auth?.role === "ROLE_ADMIN",
      login,
      register,
      logout,
    }),
    [auth, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
