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
  active: boolean;
  pendingApprovalByManager: boolean;
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
  pendingApprovalByManager?: boolean;
  email: string;
  fullName: string;
}


export interface EmployeeUpdateProfileRequest {
  phoneNumber?: string;
  address?: string;
  birthDate?: string;
}
