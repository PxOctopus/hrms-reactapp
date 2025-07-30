import { PendingManager } from "../types/User";
import axios from "axios";

const API_URL = "http://localhost:9090/api"; // Backend base URL

// GET /api/admin/companies/pending
export const getPendingManagers = async (): Promise<PendingManager[]> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/admin/companies/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// POST /api/admin/companies/approve/{userId}
export const approveManagerCompany = async (userId: number): Promise<void> => {
  const token = localStorage.getItem("token");
  await axios.post(`${API_URL}/admin/companies/approve/${userId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// POST /api/admin/companies/reject/{userId}
export const rejectManagerCompany = async (userId: number): Promise<void> => {
  const token = localStorage.getItem("token");
  await axios.post(`${API_URL}/admin/companies/reject/${userId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
