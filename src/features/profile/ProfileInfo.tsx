import { useNavigate } from "react-router-dom";
import { UserProfile } from "../../types/User";
import { useAuth } from "../../context/AuthContext";

interface ProfileInfoProps {
  user: UserProfile;
}

const ProfileInfo = ({ user }: ProfileInfoProps) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Format date as "day month year"
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
  {/* Logout button */}
  <button
    onClick={handleLogout}
    className="absolute top-4 left-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
  >
    Log out
  </button>

  {/* Edit button (top-right, only if not ADMIN) */}
  {user.role !== "ADMIN" && (
    <button
      onClick={() =>
        user.role === "MANAGER"
          ? navigate("/profile/update-manager")
          : navigate("/profile/update-employee")
      }
      className="absolute top-4 right-4"
    >
      <svg
        className="w-5 h-5 text-blue-600 hover:text-blue-800 transition"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z" />
      </svg>
    </button>
  )}

  <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>

  <p><strong>Full Name:</strong> {user.fullName}</p>
  <p><strong>Email:</strong> {user.email}</p>
  <p><strong>Role:</strong> {user.role}</p>

  {user.role !== "ADMIN" && (
    <p>
      <strong>Company:</strong>{" "}
      {user.company ? (
        <span className="text-green-600">
          Approved - {user.company.companyName}
        </span>
      ) : (
        <span className="text-yellow-600">
          Pending - {user.pendingCompanyName || "N/A"}
        </span>
      )}
    </p>
  )}

  {formattedDate && (
    <p>
      <strong>Registered On:</strong> {formattedDate}
    </p>
  )}
</div>
  );
};

export default ProfileInfo;
