import { getLoginUrl } from "@/const";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Mock user data - en producción esto vendría del servidor
const mockUser = {
  id: 1,
  name: "Usuario Demo",
  email: "demo@example.com",
  role: "user" as const,
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};

  const logout = useCallback(async () => {
    // Clear local storage
    localStorage.removeItem("manus-runtime-user-info");
    // Redirect to login
    window.location.href = getLoginUrl();
  }, []);

  const state = useMemo(() => {
    // Try to get user from localStorage
    const storedUser = localStorage.getItem("manus-runtime-user-info");
    const user = storedUser ? JSON.parse(storedUser) : mockUser;
    
    return {
      user: user ?? null,
      loading: false,
      error: null,
      isAuthenticated: Boolean(user),
    };
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.user]);

  return {
    ...state,
    refresh: () => Promise.resolve(),
    logout,
  };
}
