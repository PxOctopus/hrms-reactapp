import axios from "./axios";
import { Employee, EmployeeCreateRequest } from "../types/Employee";

// Fetch all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await axios.get("/employees");
  return response.data;
};

// Get single employee by ID
export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await axios.get(`/employees/${id}`);
  return response.data;
};

// Create a new employee
export const createEmployee = async (
  data: EmployeeCreateRequest
): Promise<Employee> => {
  const response = await axios.post("/employees", data);
  return response.data;
};

// Update an employee
export const updateEmployee = async (
  id: number,
  data: EmployeeCreateRequest
): Promise<Employee> => {
  const response = await axios.put(`/employees/${id}`, data);
  return response.data;
};

// Delete an employee
export const deleteEmployee = async (id: number): Promise<void> => {
  await axios.delete(`/employees/${id}`);
};

// Approve employee
export const approveEmployee = async (id: number): Promise<void> => {
  await axios.post(`/employees/${id}/approve`);
};

// Reject employee
export const rejectEmployee = async (id: number): Promise<void> => {
  await axios.post(`/employees/${id}/reject`);
};

// Toggle employee status (active/inactive)
export const toggleEmployeeStatus = async (id: number): Promise<void> => {
  await axios.patch(`/api/employees/${id}/toggle-active`);
};
