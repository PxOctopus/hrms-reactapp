export type Shift = {
  id: number;
  name: string;
  startTime: string; // "08:00"
  endTime: string;   // "16:00"
  days: number[];    // 1-7 (Mon..Sun)
  companyId: number;
};

export type ShiftAssignment = {
  id: number;
  shiftId: number;
  employeeId: number;
  startDate: string; // ISO
  endDate?: string;  // ISO
};