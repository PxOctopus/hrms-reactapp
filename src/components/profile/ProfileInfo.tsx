import { UserProfile } from "../../types/User";

interface ProfileInfoProps {
  user: UserProfile;
}

const ProfileInfo = ({ user }: ProfileInfoProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  return (
    <div className="bg-white shadow-md rounded p-6 space-y-3">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>

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
          <p>
            <strong>Email Verified:</strong>{" "}
            {user.emailVerified ? "Yes" : "No"}
          </p>
          <p>
            <strong>Account Enabled:</strong>{" "}
            {user.enabled ? "Yes" : "No"}
          </p>
          <p>
            <strong>Registered On:</strong> {formatDate(user.createdAt)}
          </p>
        </>
      )}
    </div>
  );
};

export default ProfileInfo;
