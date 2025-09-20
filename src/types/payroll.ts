export type PayrollAdjustmentType = "REIMBURSEMENT" | "BONUS" | "DEDUCTION";

export interface PayrollAdjustment {
  id: number;
  type: PayrollAdjustmentType;
  amount: string;          // TRY  (backend BigDecimal -> string)
  currency: string;        // "TRY"
  description?: string | null;
  effectiveDate: string;   // yyyy-MM-dd
  expenseId?: number | null;
  processed: boolean;
}
