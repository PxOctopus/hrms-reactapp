import api from "./axios";
import type { AxiosRequestConfig } from "axios";
import type { UserProfile } from "../types/User";
import type { ManagerUpdateProfileRequest } from "../types/User";
import type { EmployeeUpdateProfileRequest } from "../types/Employee";

/**
 * Fetch current user's profile.
 * Default passes `skipAuthRedirect: true` so public browsing doesn't auto-redirect
 * to /login on a stale token during app bootstrap.
 */
export async function getCurrentUser(
  config?: AxiosRequestConfig
): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/users/profile", {
    skipAuthRedirect: true,   // important for bootstrap UX
    ...config,
  });
  // console.debug("DEBUG user response:", res.data);
  return res.data;
}

// Admin: get all pending manager requests
export async function getPendingManagers() {
  const res = await api.get("/admin/companies/pending");
  return res.data;
}

// Admin: approve a manager's company request
export async function approveManagerCompany(userId: number) {
  const res = await api.post(`/admin/companies/approve/${userId}`);
  return res.data;
}

// Admin: reject a manager's company request
export async function rejectManagerCompany(userId: number) {
  const res = await api.post(`/admin/companies/reject/${userId}`);
  return res.data;
}

// Update current user's profile (generic)
export async function updateUserProfile(
  data: Partial<UserProfile>
): Promise<UserProfile> {
  const res = await api.put<UserProfile>("/users/profile", data);
  return res.data;
}

// Manager-specific profile update
export async function updateManagerProfile(data: ManagerUpdateProfileRequest) {
  const res = await api.put("/users/profile/manager", data);
  return res.data;
}

// Employee-specific profile update
export async function updateEmployeeProfile(data: EmployeeUpdateProfileRequest) {
  const res = await api.put("/employees/my-profile", data);
  return res.data;
}
