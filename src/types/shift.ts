export type Shift = {
  id: number;
  name: string;        // backend: shiftName
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  companyId: number;
};

export type ShiftAssignment = {
  id: number;
  employeeId: number;
  shiftId: number;
  shiftDate: string;   // "YYYY-MM-DD"
  startTime?: string;  // optional: denormalized from backend range endpoint
  endTime?: string;    // optional: denormalized from backend range endpoint
  active?: boolean;
};

/**
 * Lite representation of employees for assignment UI.
 * - label: display name (backend.displayName || email)
 * - email: kept for tooltip/secondary info
 * - status: ACTIVE means selectable, INACTIVE means disabled
 */
export type EmployeeLite = {
  id: number;
  label: string;                 // display name (fullName or email fallback)
  email: string;
  status: "ACTIVE" | "INACTIVE";
};