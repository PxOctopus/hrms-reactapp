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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
