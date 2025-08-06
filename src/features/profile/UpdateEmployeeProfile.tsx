import ProfileUpdateForm from "../../components/profile/ProfileUpdateForm";
import { useAuth } from "../../context/AuthContext";
import { UserProfile } from "../../types/User";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const UpdateEmployeeProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not an employee
  useEffect(() => {
    if (!user || user.role !== "EMPLOYEE") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  if (!user || user.role !== "EMPLOYEE") return null;

  const handleUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser); // Update user context
    navigate("/profile"); // Go back to profile page
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Update Profile</h2>
      <ProfileUpdateForm user={user} onUpdate={handleUpdate} />
    </div>
  );
};

export default UpdateEmployeeProfile;