import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile } from "../types/User";
import { getCurrentUser } from "../lib/userApi";

interface AuthContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // 👈 eklendi

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      getCurrentUser()
        .then((userData) => setUser(userData))
        .catch((err) => {
          console.error("❌ Failed to fetch user:", err);
          setUser(null);
        })
        .finally(() => setLoading(false)); // ✅ veri geldi veya hata aldıktan sonra loading false
    } else {
      setLoading(false); // no token varsa da loading false yapılmalı
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
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
