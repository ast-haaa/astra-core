import React, { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

type Role = "consumer" | "farmer" | "transporter" | "labtester";
type User = { email: string; role: Role; name?: string } | null;

type AuthCtx = {
  user: User;
  login: (email: string, role: Role) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    try {
      return JSON.parse(localStorage.getItem("herbtrace-user") || "null");
    } catch {
      return null;
    }
  });

  const [, navigate] = useLocation();

  function login(email: string, role: Role) {
    const u: User = { email, role, name: email.split("@")[0] };
    setUser(u);
    localStorage.setItem("herbtrace-user", JSON.stringify(u));

    // redirect based on role
    if (role === "consumer") navigate("/");
    else if (role === "farmer") navigate("/farmer/dashboard");
    else if (role === "transporter") navigate("/transporter/dashboard");
    else if (role === "labtester") navigate("/labtester/dashboard");
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("herbtrace-user");
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
