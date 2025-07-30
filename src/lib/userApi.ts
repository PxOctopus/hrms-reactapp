import axios from "./axios"; // custom axios instance
import { UserProfile } from "../types/User";

// Fetch current user's profile
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>("/users/profile");
  return response.data;
};

// Get all pending manager requests
export const getPendingManagers = async () => {
  const response = await axios.get("/api/admin/companies/pending");
  return response.data;
};

// Approve a manager's company request
export const approveManagerCompany = async (userId: number) => {
  const response = await axios.post(`/api/admin/companies/approve/${userId}`);
  return response.data;
};

// Reject a manager's company request
export const rejectManagerCompany = async (userId: number) => {
  const response = await axios.post(`/api/admin/companies/reject/${userId}`);
  return response.data;
};