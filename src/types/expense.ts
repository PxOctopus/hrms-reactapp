export type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "WITHDRAWN";
export type ExpenseCategory =
  | "BUSINESS_MEAL" | "CONGRESS_PARTICIPATION" | "AIR_FARE" | "ACCOMMODATION"
  | "GROUND_TRANSPORT" | "MILEAGE" | "OFFICE_SUPPLIES" | "OTHER";
export type PaymentMethod = "COMPANY_CARD" | "PERSONAL_CARD" | "CASH";
export type ReceiptType = "INVOICE" | "RECEIPT" | "E_TICKET" | "PARKING_TICKET" | "OTHER";

export interface ExpenseResponseDTO {
  id: number;
  status: ExpenseStatus;
  category: ExpenseCategory;
  currency: string;
  grossAmount: string;
  vatAmount?: string | null;
  tipAmount?: string | null;
  netAmount?: string | null;
  paymentMethod?: PaymentMethod | null;
  receiptType?: ReceiptType | null;
  expenseDate: string;            // yyyy-MM-dd
  location?: string | null;
  note?: string | null;
  receiptFiles?: string[] | null;
  submittedAt?: string | null;
  managerReviewedAt?: string | null;
  managerReviewerId?: number | null;
  managerDecisionNote?: string | null;
  paidAt?: string | null;
  allowedActions?: string[];      // server sets via withAllowedActions

    employeeId?: number | null;
  employeeName?: string | null;
  employeeEmail?: string | null;
}

export interface ExpenseCreateDTO {
  category: ExpenseCategory;
  currency?: string;              // default TRY
  grossAmount: string;
  vatAmount?: string | null;
  tipAmount?: string | null;
  paymentMethod?: PaymentMethod | null;
  receiptType?: ReceiptType | null;
  expenseDate: string;            // yyyy-MM-dd
  location?: string | null;
  note?: string | null;
  receiptFiles?: string[] | null;
}

export type ExpenseUpdateDTO = ExpenseCreateDTO;
