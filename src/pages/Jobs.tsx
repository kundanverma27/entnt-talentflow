import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Job } from "../services/seed/jobsSeed";
import JobModal from "../components/Jobs/JobModal";
import { DeleteConfirmationModal } from "../components/Jobs/DeleteConfirmationModal";
import { toast } from "react-hot-toast";

interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  pageSize: number;
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get<JobsResponse>("/jobs", {
        params: { search, status: statusFilter, page: currentPage, pageSize },
      });
      setJobs(response.data.data);
      setTotalJobs(response.data.total);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get("/candidates");
      setCandidates(response.data.data || []);
    } catch {
      setCandidates([]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [search, statusFilter, currentPage, pageSize]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleArchive = async (job: Job) => {
    try {
      await axios.patch(`/jobs/${job.id}`, {
        status: job.status === "active" ? "archived" : "active",
      });
      fetchJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await axios.delete(`/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchJobs();
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch {
      toast.error("Error deleting job");
    }
  };

  const getApplicationsForJob = (jobId: string) =>
    candidates.filter((candidate) => candidate.jobId === jobId);

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newJobs = [...jobs];
    const [movedJob] = newJobs.splice(fromIndex, 1);
    newJobs.splice(toIndex, 0, movedJob);
    setJobs(newJobs);
    try {
      await axios.patch(`/jobs/${movedJob.id}/reorder`, {
        fromOrder: fromIndex,
        toOrder: toIndex,
      });
    } catch {
      fetchJobs();
    }
  };

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedJob) return;
    const draggedIndex = jobs.findIndex((job) => job.id === draggedJob.id);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedJob(null);
      return;
    }
    handleReorder(draggedIndex, targetIndex);
    setDraggedJob(null);
  };

  const totalPages = Math.ceil(totalJobs / pageSize);

  return (
    <div className="min-h-screen bg-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Jobs</h1>
            <p className="text-white-400/80 text-sm">
              Create and manage your job postings
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard/candidates")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
            >
              <span className="text-sm">View Candidates</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow"
            >
              <span className="text-sm">Create Job</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg shadow-md border border-gray-700 p-6 mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jobs by title or tags..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm bg-gray-800 text-white placeholder-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="sm:w-48 px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm bg-gray-800 text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 gap-4">
          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 rounded-lg shadow">
              <h3 className="text-lg font-medium text-white">No jobs found</h3>
              <p className="text-sm mt-1 text-white/70">
                {search || statusFilter
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first job posting."}
              </p>
            </div>
          ) : (
            jobs.map((job, index) => (
              <div
                key={job.id}
                draggable
                onDragStart={(e) => handleDragStart(e, job)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-gray-900 rounded-lg shadow-md p-6 flex flex-col sm:flex-row sm:justify-between transition hover:shadow-lg cursor-move ${
                  draggedJob?.id === job.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {job.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === "active"
                          ? "bg-emerald-800 text-emerald-400"
                          : "bg-gray-700 text-white/70"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mb-2">{job.location}</p>
                  <p className="text-sm text-white/70 mb-2">
                    {job.description.substring(0, 150)}...
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-700 rounded text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-white/80">
                    {getApplicationsForJob(job.id).length} applications
                  </p>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0 items-center">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/candidates?job=${job.id}`)
                    }
                    className="text-emerald-400 hover:text-emerald-200 text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setEditingJob(job)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(job)}
                    className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                  >
                    {job.status === "active" ? "Archive" : "Unarchive"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setJobToDelete(job);
                    }}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-white/70">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalJobs)} of {totalJobs} jobs
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white/70"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-gray-700 hover:bg-gray-800 text-white/70"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white/70"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreateModal || editingJob) && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setShowCreateModal(false);
            setEditingJob(null);
          }}
          onSave={() => {
            fetchJobs();
            setShowCreateModal(false);
            setEditingJob(null);
          }}
        />
      )}

      {showDeleteModal && jobToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDelete(jobToDelete.id)}
          jobTitle={jobToDelete.title}
        />
      )}
    </div>
  );
};

export default Jobs;
