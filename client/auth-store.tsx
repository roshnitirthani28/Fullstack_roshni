"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "@/lib/api";

type User = {
  _id: string;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("syncdoc_auth") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
        setAuthToken(parsed.token);
      } catch {
        localStorage.removeItem("syncdoc_auth");
      }
    }
    setLoading(false);
  }, []);

  const setAuth = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    setAuthToken(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("syncdoc_auth", JSON.stringify({ user: u, token: t }));
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("syncdoc_auth");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, clearAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
