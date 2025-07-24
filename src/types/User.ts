export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  companyName?: string | null;
  pendingCompanyName?: string | null;
  emailVerified: boolean;
  enabled: boolean;
  createdAt: string;
}