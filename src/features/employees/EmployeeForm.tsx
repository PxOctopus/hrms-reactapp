import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ContractType } from "../../types/enums";
import { createEmployee, getEmployeeById, updateEmployee } from "../../lib/employeeApi";
import { EmployeeCreateRequest } from "../../types/Employee";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

// Validation schema
const schema = z.object({
  fullName: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  contractType: z.nativeEnum(ContractType, {
    errorMap: () => ({ message: "Contract type is required" }),
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  salary: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Salary must be a valid number" }),
  annualLeave: z.string().regex(/^\d+$/, { message: "Annual leave must be a valid number" }),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  endDate: z.string().optional(),
  email: z.string().email("Invalid email").optional(), // will be required for manager via UI
});

type FormData = z.infer<typeof schema>;

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { user: currentUser } = useAuth();
  const isManager = currentUser?.role === "MANAGER";

  // derive manager's email domain (e.g., "gmail.com")
  const companyDomain = useMemo(() => {
    const e = currentUser?.email || "";
    const at = e.indexOf("@");
    return at > -1 ? e.slice(at + 1).toLowerCase() : "";
  }, [currentUser?.email]);

  // local-part state used only for split email UI
  const [emailLocal, setEmailLocal] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Prefill on edit
  useEffect(() => {
    if (isEditMode && id) {
      getEmployeeById(Number(id))
        .then((employee) => {
          reset({
            fullName: employee.fullName || "",
            position: employee.position,
            contractType: employee.contractType as ContractType,
            phoneNumber: employee.phoneNumber || "",
            address: employee.address || "",
            salary: employee.salary ? employee.salary.toString() : "",
            annualLeave: employee.annualLeave ? employee.annualLeave.toString() : "",
            birthDate: employee.birthDate || "",
            hireDate: employee.hireDate || "",
            endDate: employee.endDate || "",
            email: employee.email || "",
          });
        })
        .catch((error) => {
          toast.error("Failed to load employee.");
          console.error("Load error:", error);
        });
    }
  }, [id, isEditMode, reset]);

  // keep combined email value in form when using split email UI
  useEffect(() => {
    if (!isEditMode && isManager && companyDomain) {
      setValue("email", emailLocal ? `${emailLocal}@${companyDomain}` : "");
    }
  }, [emailLocal, companyDomain, isEditMode, isManager, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      // require email for manager create flow
      if (isManager && !isEditMode && !data.email) {
        throw new Error("Email is required");
      }

      const payload: EmployeeCreateRequest = {
        ...data,
        salary: parseFloat(data.salary),
        annualLeave: parseInt(data.annualLeave),
        pendingApprovalByManager: isManager ? false : true,
        email: isManager ? data.email! : currentUser?.email || "",
        fullName: isManager ? data.fullName! : currentUser?.fullName || "",
      };

      if (isEditMode && id) {
        await updateEmployee(Number(id), payload);
        toast.success("Employee updated successfully.");
      } else {
        await createEmployee(payload);
        toast.success("Employee created successfully.");
      }

      setTimeout(() => navigate("/employees"), 800);
    } catch (error) {
      toast.error("Submission failed.");
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? "Update the employee details below."
            : "Fill in the details to add a new team member."}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
        {/* Manager-only identity fields */}
        {isManager && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <input
                type="text"
                {...register("fullName", { required: "Full name is required" })}
                placeholder="Jane Doe"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>

              {/* Split email UI when creating and domain is known */}
              {!isEditMode && companyDomain ? (
                <>
                  <div className="flex w-full overflow-hidden rounded-lg border">
                    <input
                      type="text"
                      value={emailLocal}
                      onChange={(e) => setEmailLocal(e.target.value.trim())}
                      placeholder="username"
                      className="flex-1 px-3 py-2 text-sm outline-none"
                    />
                    <span className="border-l bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      @{companyDomain}
                    </span>
                  </div>
                  {/* hidden registered field to satisfy form validation */}
                  <input type="hidden" {...register("email", { required: "Email is required" })} />
                  <p className="mt-1 text-xs text-gray-500">
                    Will be saved as <strong>{emailLocal ? `${emailLocal}@${companyDomain}` : `@${companyDomain}`}</strong>
                  </p>
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
                </>
              ) : (
                // Fallback: regular email input (edit mode or domain not derivable)
                <>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder={`jane@${companyDomain || "company.com"}`}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
                </>
              )}
            </div>
          </div>
        )}

        {/* Job basics */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Position</label>
            <input
              type="text"
              {...register("position")}
              placeholder="e.g., Software Engineer"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            {errors.position && <p className="mt-1 text-xs text-rose-600">{errors.position.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contract type</label>
            <select {...register("contractType")} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">Select contract type…</option>
              {Object.values(ContractType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.contractType && <p className="mt-1 text-xs text-rose-600">{errors.contractType.message}</p>}
          </div>
        </div>

        {/* Contacts */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <input
              type="text"
              {...register("phoneNumber")}
              placeholder="+90 5xx xxx xx xx"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              type="text"
              {...register("address")}
              placeholder="Street, city, country"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Compensation & leave */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Salary</label>
            <input
              type="text"
              {...register("salary")}
              placeholder="e.g., 50000"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            {errors.salary && <p className="mt-1 text-xs text-rose-600">{errors.salary.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Annual leave (days)</label>
            <input
              type="text"
              {...register("annualLeave")}
              placeholder="e.g., 20"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            {errors.annualLeave && <p className="mt-1 text-xs text-rose-600">{errors.annualLeave.message}</p>}
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Birth date</label>
            <input type="date" {...register("birthDate")} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hire date</label>
            <input type="date" {...register("hireDate")} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End date (if any)</label>
            <input type="date" {...register("endDate")} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
