import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "EN" | "HI" | "MR" | "GU" | "PA";

export interface FarmerProfile {
  id: string;
  fullName: string;
  mobile?: string;
  email?: string;
  state: string;
  city: string;
  areaVillage: string;
  role: string;
  language: Language;
}

interface AuthContextType {
  farmer: FarmerProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  pendingAuth: { type: "mobile" | "email"; value: string } | null;
  language: Language;
  login: (farmer: FarmerProfile) => void;
  logout: () => void;
  updateFarmer: (updates: Partial<FarmerProfile>) => void;
  setPendingAuth: (auth: { type: "mobile" | "email"; value: string } | null) => void;
  setLanguage: (lang: Language) => void;
  completeProfile: (profile: Omit<FarmerProfile, "id" | "role" | "language" | "mobile" | "email">) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [pendingAuth, setPendingAuth] = useState<{ type: "mobile" | "email"; value: string } | null>(null);
  const [language, setLanguage] = useState<Language>("EN");

  const login = (farmerData: FarmerProfile) => {
    setFarmer(farmerData);
  };

  const logout = () => {
    setFarmer(null);
    setPendingAuth(null);
  };

  const updateFarmer = (updates: Partial<FarmerProfile>) => {
    if (farmer) {
      setFarmer({ ...farmer, ...updates });
    }
  };

  const completeProfile = (profile: Omit<FarmerProfile, "id" | "role" | "language" | "mobile" | "email">) => {
    if (!pendingAuth) return;

    const newFarmer: FarmerProfile = {
      id: crypto.randomUUID(),
      ...profile,
      ...(pendingAuth.type === "mobile" ? { mobile: pendingAuth.value } : { email: pendingAuth.value }),
      role: "Farmer",
      language,
    };
    setFarmer(newFarmer);
    setPendingAuth(null);
  };

  const isProfileComplete = farmer !== null && farmer.fullName !== "";

  return (
    <AuthContext.Provider
      value={{
        farmer,
        isAuthenticated: !!farmer && isProfileComplete,
        isProfileComplete,
        pendingAuth,
        language,
        login,
        logout,
        updateFarmer,
        setPendingAuth,
        setLanguage,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
