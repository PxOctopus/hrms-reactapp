import { useNavigate } from "react-router-dom";
import { UserProfile } from "../../types/User";

interface ProfileInfoProps {
  user: UserProfile;
}

const ProfileInfo = ({ user }: ProfileInfoProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? null
      : date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const formattedDate = formatDate(user.createdAt);

  return (
    <div className="bg-white shadow-md rounded p-6 space-y-3 relative">
      {/* logout button */}
      <button
        onClick={handleLogout}
        className="absolute top-4 left-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Log out
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>

      <p><strong>Full Name:</strong> {user.fullName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      {user.role !== "ADMIN" && (
        <>
          <p>
            <strong>Company:</strong>{" "}
            {user.companyName || (
              <span className="text-yellow-600">
                Pending - {user.pendingCompanyName || "N/A"}
              </span>
            )}
          </p>

          {user.emailVerified && (
            <p>
              <strong>Email Verified:</strong> Yes
            </p>
          )}

          {user.enabled && (
            <p>
              <strong>Account Enabled:</strong> Yes
            </p>
          )}

          {formattedDate && (
            <p>
              <strong>Registered On:</strong> {formattedDate}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileInfo;
