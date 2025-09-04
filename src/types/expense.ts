export type Expense = {
  id: number;
  employeeId: number;
  title: string;
  amount: number;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  receiptUrl?: string;
  companyId: number;
};