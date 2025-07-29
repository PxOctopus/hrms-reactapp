export type ContractType = "PERMANENT" | "TEMPORARY" | "INTERN";

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  birthDate?: string;
  hireDate?: string;
  endDate?: string;
  position: string;
  contractType: ContractType;
  phoneNumber?: string;
  address?: string;
  salary?: number;
  annualLeave?: number;
  isActive: boolean;
  isPendingApprovalByManager: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface EmployeeCreateRequest {
  birthDate?: string;
  hireDate?: string;
  endDate?: string;
  position: string;
  contractType: ContractType;
  phoneNumber?: string;
  address?: string;
  salary: number;
  annualLeave: number;
  isPendingApprovalByManager: boolean;
}
