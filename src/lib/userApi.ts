import axios from "./axios";
import { UserProfile } from "../types/User";

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>("/users/profile");
  return response.data;
};