export interface Company {
  id: number;
  companyName: string;
}

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
  company?: Company | null;
  companyApproved: boolean;
  phoneNumber?: string | null;
  mustChangePassword: boolean;
  pendingApprovalByManager?: boolean; // <-- NEW
}

export interface PendingManager {
  userId: number;
  fullName: string;
  email: string;
  pendingCompanyName: string;
}

export interface ManagerUpdateProfileRequest {
  phoneNumber?: string;
  address?: string;
}