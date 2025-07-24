import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { useAuth } from "./context/AuthContext";
import { getCurrentUser } from "./lib/userApi";

function App() {
  const { setUser } = useAuth();

  useEffect(() => {
    // Fetch user information on initial load if token exists
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // If token is valid, retrieve current user's profile
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          // If token is invalid or expired, clear token and reset user
          console.error("Failed to fetch user", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [setUser]);

  // Render the application router
  return <AppRouter />;
}

export default App;
