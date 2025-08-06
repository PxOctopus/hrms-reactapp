import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateManagerProfile,
  updateEmployeeProfile,
  getCurrentUser,
} from "../../lib/userApi";
import { useState } from "react";
import { UserProfile } from "../../types/User";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

// Define schemas
const managerSchema = z.object({
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

const employeeSchema = z.object({
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  birthDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid date format (YYYY-MM-DD)"
    ),
});

type ManagerFormData = z.infer<typeof managerSchema>;
type EmployeeFormData = z.infer<typeof employeeSchema>;

interface ProfileUpdateFormProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
}

const ProfileUpdateForm = ({ user, onUpdate }: ProfileUpdateFormProps) => {
  const isManager = user.role === "MANAGER";
  const isEmployee = user.role === "EMPLOYEE";
  const { setUser } = useAuth(); // 🔄 Update global AuthContext

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManagerFormData | EmployeeFormData>({
    resolver: zodResolver(isManager ? managerSchema : employeeSchema),
    defaultValues: isManager
      ? {
          phoneNumber: user.phoneNumber || "",
          address: (user as any).address || "",
        }
      : {
          phoneNumber: user.phoneNumber || "",
          address: (user as any).address || "",
          birthDate: (user as any).birthDate || "",
        },
  });

  const [updated, setUpdated] = useState(false);

  const onSubmit = async (data: ManagerFormData | EmployeeFormData) => {
    try {
      // Güncelleme API çağrısı
      if (isManager) {
        await updateManagerProfile(data as ManagerFormData);
      } else if (isEmployee) {
        await updateEmployeeProfile(data as EmployeeFormData);
      } else {
        toast.error("Only managers or employees can update their profile.");
        return;
      }

      // 🔄 Kullanıcıyı tekrar çek ve AuthContext'i güncelle
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser);
      onUpdate(refreshedUser);
      setUpdated(true);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-white p-4 rounded shadow"
    >
      <div>
        <label className="block font-medium mb-1">Phone Number</label>
        <input
          type="text"
          {...register("phoneNumber")}
          className="w-full border p-2 rounded"
        />
        {"phoneNumber" in errors && (
          <p className="text-red-500">{errors.phoneNumber?.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Address</label>
        <input
          type="text"
          {...register("address")}
          className="w-full border p-2 rounded"
        />
        {"address" in errors && (
          <p className="text-red-500">{errors.address?.message}</p>
        )}
      </div>

      {isEmployee && (
        <div>
          <label className="block font-medium mb-1">Birth Date</label>
          <input
            type="date"
            {...register("birthDate")}
            className="w-full border p-2 rounded"
          />
          {"birthDate" in errors && (
            <p className="text-red-500">
              {(errors as any).birthDate?.message}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isSubmitting ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
};

export default ProfileUpdateForm;
