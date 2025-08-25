import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../../lib/authApi";
import { RegisterRequest } from "../../types/Auth";
import { Link } from "react-router-dom";
import { useState } from "react";
import Brand from "../common/Brand";

const schema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$/, {
        message: "Password must contain uppercase, lowercase, and number",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyEmail: z.string().email("Invalid company email"),
    roleName: z.enum(["MANAGER", "EMPLOYEE"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const emailDomain = data.email.split("@")[1];
    const companyDomain = data.companyEmail.split("@")[1];

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
      if (response.token) localStorage.setItem("token", response.token);
      setRegisteredEmail(data.roleName === "MANAGER" ? data.companyEmail : data.email);
      setRegistrationSuccess(true);
      setErrorMessage("");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
         <Brand withMargin />

          {registrationSuccess ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-700">Registration Successful</h2>
              <p className="mt-2 text-slate-700">
                Please check your email to verify your account:
                <br />
                <strong>{registeredEmail}</strong>
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
              <p className="mt-1 text-sm text-slate-600">
                Start your free trial. No credit card required.
              </p>

              {errorMessage && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-700">Full Name</label>
                  <input
                    type="text"
                    {...register("fullName")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Password</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Company Name</label>
                  <input
                    type="text"
                    {...register("companyName")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Company Email</label>
                  <input
                    type="email"
                    {...register("companyEmail")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  />
                  {errors.companyEmail && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.companyEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Role</label>
                  <select
                    {...register("roleName")}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                  >
                    <option value="">Select role</option>
                    <option value="MANAGER">Manager</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                  {errors.roleName && (
                    <p className="mt-1 text-xs text-red-600">{errors.roleName.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Registering..." : "Create account"}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-indigo-700 hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:flex md:min-h-screen md:items-center md:justify-center bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover">
        <div className="bg-slate-900/50 px-8 py-6 rounded-2xl">
          <h2 className="text-5xl font-extrabold tracking-tight text-white">Peoplea</h2>
          <p className="mt-2 text-slate-200">Human Resource Management System</p>
        </div>
      </div>
    </div>
  );
}
