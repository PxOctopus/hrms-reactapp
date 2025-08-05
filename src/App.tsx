import { useEffect, useState } from "react";
import AppRouter from "./router/AppRouter";
import { useAuth } from "./context/AuthContext";
import { getCurrentUser } from "./lib/userApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true); // State to track whether user data is being loaded

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Try to fetch the authenticated user's profile using the token
          const userData = await getCurrentUser();
          setUser(userData); // Set user in global context
        } catch (err) {
          // If token is invalid or expired, clear it and reset the user
          console.error("Failed to fetch user", err);
          localStorage.removeItem("token");
          setUser(null);
          toast.warning("Session expired. Please log in again.");
        }
      }

      // Whether token exists or not, mark loading as complete
      setLoading(false);
    };

    fetchUser();
  }, [setUser]);

  // Prevent rendering the router until user state is resolved
  if (loading) return null;

  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
