import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile } from "../types/User";
import { getCurrentUser } from "../lib/userApi"; // API fonksiyonun bu olmalı

interface AuthContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user from API if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      getCurrentUser()
        .then((userData) => setUser(userData))
        .catch((err) => {
          console.error("❌ Failed to fetch user from token:", err);
          setUser(null);
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
