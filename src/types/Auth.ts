import { UserProfile } from "../types/User";
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyEmail: string;
  roleName: "MANAGER" | "EMPLOYEE";
}

export interface AuthResponse {
  token: string;
  role: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: string;
  tokenType: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
