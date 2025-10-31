import { useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // App is now public without authentication
  // Always return an authenticated state
  const state = useMemo(() => {
    return {
      user: {
        id: 1,
        openId: "public-user",
        name: "Usuario Público",
        email: "public@example.com",
        role: "user" as const,
      },
      loading: false,
      error: null,
      isAuthenticated: true,
    };
  }, []);

  const logout = async () => {
    // No-op logout since app is public
    return;
  };

  return {
    ...state,
    refresh: async () => {},
    logout,
  };
}

