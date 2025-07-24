import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/userApi";
import { UserProfile } from "../../types/User";
import ProfileInfo from "../../components/profile/ProfileInfo";

const ProfileSettings = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Show loading state
  if (loading) {
    return <p className="text-center mt-8 text-gray-500">Loading profile...</p>;
  }

  // Show error if user data failed to load
  if (!user) {
    return <p className="text-center mt-8 text-red-500">Failed to load profile.</p>;
  }

  // Render profile info if user is loaded
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <ProfileInfo user={user} />
    </div>
  );
};

export default ProfileSettings;