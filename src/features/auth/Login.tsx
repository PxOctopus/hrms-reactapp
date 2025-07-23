import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "../../lib/authApi";
import { LoginRequest } from "../../types/Auth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Form validation schema
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await login(data);
      localStorage.setItem("token", response.token);
      navigate("/profile"); // Redirect after successful login
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        {/* Display server-side error */}
        {errorMessage && (
          <div className="text-red-600 mb-4 text-sm">{errorMessage}</div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {/* Forgot password link */}
        <p className="mt-2 text-sm text-center text-gray-600">
          <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium">
            Forgot your password?
          </Link>
        </p>

        {/* Register redirect */}
        <p className="mt-4 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
