// src/App.tsx
import { useEffect, useState } from "react";
import AppRouter from "./router/AppRouter"; 
import { useAuth } from "./context/AuthContext";
import { getCurrentUser } from "./lib/userApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // unmount koruması

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getCurrentUser();
          if (isMounted) setUser(userData);
        } catch (err) {
          console.error("Failed to fetch user", err);
          localStorage.removeItem("token");
          if (isMounted) {
            setUser(null);
            toast.warning("Session expired. Please log in again.");
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [setUser]);


  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
