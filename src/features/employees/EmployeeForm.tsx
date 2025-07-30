import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ContractType } from "../../types/enums";
import {
  createEmployee,
  getEmployeeById,
  updateEmployee,
} from "../../lib/employeeApi";
import { EmployeeCreateRequest } from "../../types/Employee";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Validation schema using Zod
const schema = z.object({
  position: z.string().min(1, "Position is required"),
  contractType: z.nativeEnum(ContractType, {
    errorMap: () => ({ message: "Contract type is required" }),
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  salary: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Salary must be a valid number",
  }),
  annualLeave: z.string().regex(/^\d+$/, {
    message: "Annual leave must be a valid number",
  }),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Load employee data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      getEmployeeById(Number(id))
        .then((employee) => {
          reset({
            position: employee.position,
            contractType: employee.contractType as ContractType,
            phoneNumber: employee.phoneNumber || "",
            address: employee.address || "",
            salary: employee.salary ? employee.salary.toString() : "",
            annualLeave: employee.annualLeave
              ? employee.annualLeave.toString()
              : "",
            birthDate: employee.birthDate || "",
            hireDate: employee.hireDate || "",
            endDate: employee.endDate || "",
          });
        })
        .catch((error) => {
          toast.error("Failed to load employee.");
          console.error("Load error:", error);
        });
    }
  }, [id, isEditMode, reset]);

  // Submit handler
  const onSubmit = async (data: FormData) => {
    try {
      const payload: EmployeeCreateRequest = {
        ...data,
        salary: parseFloat(data.salary),
        annualLeave: parseInt(data.annualLeave),
         isPendingApprovalByManager: false,
      };

      if (isEditMode && id) {
        await updateEmployee(Number(id), payload);
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(payload);
        toast.success("Employee created successfully!");
      }

      setTimeout(() => {
        navigate("/employees");
      }, 1500);
    } catch (error) {
      toast.error("Submission failed.");
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Employee" : "Add New Employee"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          {...register("position")}
          placeholder="Position"
          className="w-full border px-3 py-2 rounded"
        />
        {errors.position && (
          <p className="text-red-500 text-sm">{errors.position.message}</p>
        )}

        <select {...register("contractType")} className="w-full border px-3 py-2 rounded">
          <option value="">Select Contract Type</option>
          {Object.values(ContractType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.contractType && (
          <p className="text-red-500 text-sm">{errors.contractType.message}</p>
        )}

        <input
          type="text"
          {...register("phoneNumber")}
          placeholder="Phone Number"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          {...register("address")}
          placeholder="Address"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          {...register("salary")}
          placeholder="Salary"
          className="w-full border px-3 py-2 rounded"
        />
        {errors.salary && (
          <p className="text-red-500 text-sm">{errors.salary.message}</p>
        )}

        <input
          type="text"
          {...register("annualLeave")}
          placeholder="Annual Leave"
          className="w-full border px-3 py-2 rounded"
        />
        {errors.annualLeave && (
          <p className="text-red-500 text-sm">{errors.annualLeave.message}</p>
        )}

        <input type="date" {...register("birthDate")} className="w-full border px-3 py-2 rounded" />
        <input type="date" {...register("hireDate")} className="w-full border px-3 py-2 rounded" />
        <input type="date" {...register("endDate")} className="w-full border px-3 py-2 rounded" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : isEditMode ? "Update" : "Create"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
