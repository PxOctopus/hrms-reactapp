import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../lib/authApi";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmail({ token })
      .then(() => {
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
        {status === "loading" && <p className="text-gray-700">Verifying your email...</p>}

        {status === "success" && (
          <div>
            <p className="text-green-600 text-lg font-semibold">Your account has been verified!</p>
            <p className="mt-4 text-sm text-gray-500">You can now log in to your account.</p>

            {/* Redirect button to login page */}
            <Link
              to="/login"
              className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="text-red-600 text-lg font-semibold">Invalid or expired verification link.</p>
            <p className="mt-4 text-sm text-gray-500">Please request a new one or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
