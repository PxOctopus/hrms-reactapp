import axios from "./axios";
import { UserProfile } from "../types/User";
import {ManagerUpdateProfileRequest} from "../types/User";
import { EmployeeUpdateProfileRequest } from "../types/Employee";


// Fetch current user's profile
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>("/users/profile");
   console.log("DEBUG user response:", response.data);
  return response.data;
};

// Get all pending manager requests
export const getPendingManagers = async () => {
  const response = await axios.get("/admin/companies/pending");
  return response.data;
};

// Approve a manager's company request
export const approveManagerCompany = async (userId: number) => {
  const response = await axios.post(`/admin/companies/approve/${userId}`);
  return response.data;
};

// Reject a manager's company request
export const rejectManagerCompany = async (userId: number) => {
  const response = await axios.post(`/admin/companies/reject/${userId}`);
  return response.data;
};

// Update current user's profile
export const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axios.put<UserProfile>("/users/profile", data);
  return response.data;
};


export const updateManagerProfile = async (data: ManagerUpdateProfileRequest) => {
  const response = await axios.put("/users/profile/manager", data);
  return response.data;
};

export const updateEmployeeProfile = async (data: EmployeeUpdateProfileRequest) => {
  const response = await axios.put("/employees/my-profile", data);
  return response.data;
};