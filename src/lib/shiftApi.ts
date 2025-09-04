import axios from "./axios";
import { Shift } from "../types/shift";

export const shiftApi = {
  list: (companyId: number) => axios.get<Shift[]>(`/api/shifts`, { params: { companyId } }),
  create: (data: { name: string; startTime: string; endTime: string; days: number[] }) => axios.post(`/api/shifts`, data),
  update: (id: number, data: Partial<Shift>) => axios.put(`/api/shifts/${id}`, data),
  remove: (id: number) => axios.delete(`/api/shifts/${id}`),
  assign: (id: number, data: { employeeId: number; startDate: string; endDate?: string }) =>
    axios.post(`/api/shifts/${id}/assign`, data),
};
