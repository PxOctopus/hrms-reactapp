import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserProfile } from "../../lib/userApi";
import { useState } from "react";
import { UserProfile } from "../../types/User";
import { toast } from "react-toastify";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProfileUpdateFormProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
}

const ProfileUpdateForm = ({ user, onUpdate }: ProfileUpdateFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
    },
  });

  const [updated, setUpdated] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const updatedUser = await updateUserProfile(data);
      toast.success("Profile updated successfully");
      onUpdate(updatedUser); // Update the parent state
      setUpdated(true);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label className="block font-medium mb-1">Full Name</label>
        <input
          type="text"
          {...register("fullName")}
          className="w-full border p-2 rounded"
        />
        {errors.fullName && <p className="text-red-500">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">Phone Number</label>
        <input
          type="text"
          {...register("phoneNumber")}
          className="w-full border p-2 rounded"
        />
        {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}
      </div>

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
