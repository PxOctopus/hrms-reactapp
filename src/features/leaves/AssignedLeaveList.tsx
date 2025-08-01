import { useEffect, useState } from "react";
import { getLeavesAssignedByManager } from "../../lib/leaveApi";
import { Leave } from "../../types/Leave";

const AssignedLeavesList = () => {
  const [assignedLeaves, setAssignedLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedLeaves = async () => {
      try {
        const data = await getLeavesAssignedByManager();
        setAssignedLeaves(data);
      } catch (err) {
        console.error("Failed to fetch assigned leaves", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedLeaves();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Leaves Assigned by You</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Employee</th>
            <th className="py-2 px-4 text-left">Type</th>
            <th className="py-2 px-4 text-left">Dates</th>
            <th className="py-2 px-4 text-left">Reason</th>
            <th className="py-2 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {assignedLeaves.map((leave) => (
            <tr key={leave.id} className="border-t">
              <td className="py-2 px-4">{leave.employeeFullName}</td>
              <td className="py-2 px-4">{leave.leaveDefinitionName}</td>
              <td className="py-2 px-4">
                {leave.startDate} - {leave.endDate}
              </td>
              <td className="py-2 px-4">{leave.reason}</td>
              <td className="py-2 px-4">{leave.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedLeavesList;
