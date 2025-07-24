import axios from "./axios"; // custom axios instance
import { UserProfile } from "../types/User";

// Fetch current user's profile
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>("/users/profile");
  return response.data;
};