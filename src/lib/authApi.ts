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
  try {
    const response = await axios.post<LoginResponse>("/auth/login", data);
    
    console.log("🔍 Full login response:", response.data);

    const loginResponse = response.data;

    if (loginResponse.accessToken) {
      localStorage.setItem("token", loginResponse.accessToken);
      console.log("✅ Token saved to localStorage:", loginResponse.accessToken);
    } else {
      console.warn("⚠️ No token found in login response!");
    }

    return loginResponse;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    throw error;
  }
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