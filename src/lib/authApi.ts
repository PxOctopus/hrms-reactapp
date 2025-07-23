import axios from "./axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  AuthResponse,
} from "../types/Auth";

// Login
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axios.post("/auth/login", data);
  return response.data;
}

// Register
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await axios.post("/auth/register", data);
  return response.data;
}

// Forgot Password
export async function forgotPassword(data: ForgotPasswordRequest) {
  const response = await axios.post("/auth/forgot-password", data);
  return response.data;
}

// Reset Password
export async function resetPassword(data: ResetPasswordRequest) {
  const response = await axios.post("/auth/reset-password", data);
  return response.data;
}

// Verify Email
export async function verifyEmail(data: VerifyEmailRequest) {
  const response = await axios.post("/auth/verify-email", data);
  return response.data;
}