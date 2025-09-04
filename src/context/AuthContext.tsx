import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { UserProfile } from "../types/User";
import { getCurrentUser } from "../lib/userApi";
import api from "../lib/axios";

type AuthContextType = {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>; // <-- NEW: re-fetch user & merge employee flag
};

// Undefined by default to enforce usage via the hook
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Centralized re-fetch function used both on boot and after login
  const refreshUser = useCallback(async () => {
    // NOTE: We do a "soft" loading here; you can use a separate spinner if you like
    try {
      // 1) Fetch the base user
      const me = await getCurrentUser();
      let merged = me;

      // 2) If EMPLOYEE, fetch minimal approval flag and merge it
      const role = String(me.role || "").toUpperCase();
      if (role === "EMPLOYEE") {
        try {
          // Backend should return: { pendingApprovalByManager: boolean }
          const { data } = await api.get<{ pendingApprovalByManager?: boolean }>(
            "/employees/me"
          );
          merged = {
            ...me,
            // Safe default: if backend omits the field, treat as pending (true)
            pendingApprovalByManager: data?.pendingApprovalByManager ?? true,
          };
        } catch {
          // If the request fails, default to pending to keep the app safe
          merged = { ...me, pendingApprovalByManager: true };
        }
      }

      setUser(merged);
    } catch (err) {
      // If current-user fetch fails, clear any stale auth
      console.error("refreshUser failed:", err);
      setUser(null);
      throw err;
    }
  }, []);

  // On first load, hydrate user if a token exists
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  // Clear auth state + stored tokens
  const logout = () => {
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume the auth context safely
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
