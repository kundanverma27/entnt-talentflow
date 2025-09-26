import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface DashboardStatistics {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  newCandidates: number;
  totalAssessments: number;
  completedAssessments: number;
  interviewsScheduled: number;
  offersPending: number;
  hiredCandidates: number;
}

const HrDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    newCandidates: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    interviewsScheduled: 0,
    offersPending: 0,
    hiredCandidates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("/dashboard/statistics");
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
  }) => (
    <div className="bg-gray-800 text-white rounded-lg shadow-md p-4 hover:bg-gray-700 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-gray-700 rounded-lg">{icon}</div>
          <div className="ml-4">
            <h3 className="font-medium">{title}</h3>
            <p className="text-xs text-gray-300">{subtitle}</p>
          </div>
        </div>
        <div className="text-right font-bold text-lg">{value}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">HR Dashboard</h1>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HR Dashboard</h1>
        <p className="text-gray-300">Welcome to your HR dashboard</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Jobs"
          value={statistics.totalJobs}
          subtitle={`${statistics.activeJobs} active`}
          icon={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
              />
            </svg>
          }
        />

        <StatCard
          title="Candidates"
          value={statistics.totalCandidates}
          subtitle={`${statistics.hiredCandidates} hired`}
          icon={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />

        <StatCard
          title="Assessments"
          value={statistics.totalAssessments}
          subtitle={`${statistics.completedAssessments} completed`}
          icon={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />

        <StatCard
          title="Interviews"
          value={statistics.interviewsScheduled}
          subtitle={`${statistics.offersPending} offers pending`}
          icon={
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/dashboard/candidates")}
            className="bg-indigo-600 rounded-lg shadow-md p-6 hover:bg-indigo-500 transition cursor-pointer"
          >
            <h3 className="text-lg font-medium text-white">
              Candidates ({statistics.totalCandidates})
            </h3>
            <p className="text-sm text-gray-200">
              New this week: {statistics.newCandidates}
            </p>
          </div>

          <div
            onClick={() => navigate("/dashboard/jobs")}
            className="bg-green-600 rounded-lg shadow-md p-6 hover:bg-green-500 transition cursor-pointer"
          >
            <h3 className="text-lg font-medium text-white">
              Jobs ({statistics.totalJobs})
            </h3>
            <p className="text-sm text-gray-200">
              Active: {statistics.activeJobs}
            </p>
          </div>

          <div
            onClick={() => navigate("/dashboard/assessments")}
            className="bg-yellow-500 rounded-lg shadow-md p-6 hover:bg-yellow-400 transition cursor-pointer"
          >
            <h3 className="text-lg font-medium text-white">
              Assessments ({statistics.totalAssessments})
            </h3>
            <p className="text-sm text-gray-900">
              Completed: {statistics.completedAssessments}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 text-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3 text-gray-200">
          <div>{statistics.newCandidates} new candidates applied this week</div>
          <div>{statistics.completedAssessments} assessments completed</div>
          <div>{statistics.activeJobs} active job postings</div>
          <div>{statistics.interviewsScheduled} interviews scheduled</div>
          <div>{statistics.offersPending} offers pending</div>
          <div>{statistics.hiredCandidates} candidates hired</div>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
