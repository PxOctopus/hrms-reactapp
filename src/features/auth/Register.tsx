import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../../lib/authApi";
import { RegisterRequest } from "../../types/Auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

// Form validation schema using Zod
const schema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
        message: "Password must contain uppercase, lowercase, and number",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyEmail: z.string().email("Invalid company email"),
    roleName: z.enum(["MANAGER", "EMPLOYEE"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const emailDomain = data.email.split("@")[1];
    const companyDomain = data.companyEmail.split("@")[1];

    // Validate domain match for EMPLOYEE role
    if (data.roleName === "EMPLOYEE" && emailDomain !== companyDomain) {
      setErrorMessage(`Your email must match the company's domain: @${companyDomain}`);
      return;
    }

    const request: RegisterRequest = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      roleName: data.roleName,
    };

    try {
      const response = await registerUser(request);

      // Save token if response includes it (depending on backend behavior)
      if (response.token) {
        localStorage.setItem("token", response.token);
        console.log("Token saved:", response.token);
        navigate("/profile");
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>

        {errorMessage && (
          <p className="text-red-500 mb-4 text-sm text-center">{errorMessage}</p>
        )}

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Company Name</label>
          <input
            type="text"
            {...register("companyName")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm">{errors.companyName.message}</p>
          )}
        </div>

        {/* Company Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Company Email</label>
          <input
            type="email"
            {...register("companyEmail")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.companyEmail && (
            <p className="text-red-500 text-sm">{errors.companyEmail.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="block text-sm font-medium">Role</label>
          <select
            {...register("roleName")}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select role</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
          {errors.roleName && (
            <p className="text-red-500 text-sm">{errors.roleName.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        {/* Login link */}
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
