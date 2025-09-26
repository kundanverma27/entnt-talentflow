import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import type { Candidate } from "../services/seed/candidateSeed";
import type { Job } from "../services/seed/jobsSeed";
import NotesWithMentions from "../components/NotesWithMentions";
import { toast } from "react-hot-toast";

const Candidates: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get("job");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [quickNote, setQuickNote] = useState("");

  const stages = [
    { id: "applied", name: "Applied", color: "bg-blue-600 text-white" },
    { id: "screening", name: "Screening", color: "bg-yellow-600 text-white" },
    { id: "interview", name: "Interview", color: "bg-purple-600 text-white" },
    { id: "offer", name: "Offer", color: "bg-green-600 text-white" },
    { id: "rejected", name: "Rejected", color: "bg-red-600 text-white" },
    { id: "hired", name: "Hired", color: "bg-emerald-600 text-white" },
  ];

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let url = "/candidates";
      const params = new URLSearchParams();
      if (jobFilter) params.append("jobId", jobFilter);
      if (search) params.append("search", search);
      if (stageFilter) params.append("stage", stageFilter);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await axios.get<{ data: Candidate[] }>(url);
      setCandidates(response.data.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("/jobs");
      setJobs(response.data.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => { if (jobs.length) fetchCandidates(); }, [jobFilter, jobs, search, stageFilter]);

  const getCandidatesByStage = (stageId: string) => candidates.filter(c => c.stage === stageId);
  const getJobTitle = (jobId: string) => jobs.find(j => j.id === jobId)?.title || "Unknown Job";

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await axios.delete(`/applications/${candidateId}`);
      toast.success("Candidate deleted successfully");
      fetchCandidates();
    } catch {
      toast.error("Error deleting candidate");
    }
  };

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (!draggedCandidate || draggedCandidate.stage === targetStage) return;
    try {
      await axios.patch(`/applications/${draggedCandidate.id}/status`, { status: targetStage });
      setCandidates(prev => prev.map(c => c.id === draggedCandidate.id ? { ...c, stage: targetStage } : c));
    } catch (error) { console.error(error); }
    setDraggedCandidate(null);
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString();
  const handleAddNote = (candidate: Candidate) => { setSelectedCandidate(candidate); setQuickNote(""); setShowNotesModal(true); };
  const handleSaveNote = () => {
    if (!selectedCandidate || !quickNote.trim()) return;
    const note = `[${new Date().toLocaleString()}] ${quickNote}`;
    const existing = localStorage.getItem(`candidate-notes-${selectedCandidate.id}`) || "";
    localStorage.setItem(`candidate-notes-${selectedCandidate.id}`, existing ? `${existing}\n\n${note}` : note);
    setShowNotesModal(false); setSelectedCandidate(null); setQuickNote("");
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-xl">Loading candidates...</p></div>;

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidates</h1>
          <p className="text-gray-300">{jobFilter ? `Applications for ${getJobTitle(jobFilter)}` : "Manage candidate applications"}</p>
        </div>
        <div className="flex items-center space-x-4">
          {jobFilter && <button onClick={() => navigate("/dashboard/candidates")} className="text-sm font-medium text-gray-300 hover:text-white">View All Applications</button>}
          <div className="text-sm font-bold text-white">Total: {candidates.length} candidates</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 bg-gray-900 rounded-lg border border-gray-700 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-700 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Stage</label>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-700 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Stages</option>
            {stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setSearch(""); setStageFilter(""); }} className="px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-800">Clear Filters</button>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map(stage => {
          const stageCandidates = getCandidatesByStage(stage.id);
          return (
            <div key={stage.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3 min-h-[600px] flex flex-col" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}>
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="font-semibold text-white text-sm">{stage.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${stage.color}`}>{stageCandidates.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {stageCandidates.length ? stageCandidates.map(candidate => (
                  <div key={candidate.id} draggable onDragStart={(e) => handleDragStart(e, candidate)} className="flex flex-col justify-between gap-1 bg-black rounded-lg p-3 shadow-sm border border-gray-700 hover:shadow-md cursor-move mb-3">
                    <div className="mb-2">
                      <h4 className="font-medium text-white text-sm truncate">{candidate.name}</h4>
                      <p className="text-gray-300 text-xs truncate">{candidate.email}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-200 font-medium truncate">{getJobTitle(candidate.jobId)}</p>
                      <p className="text-xs text-gray-400">Applied: {formatDate(candidate.appliedAt)}</p>
                    </div>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 2).map((skill, i) => <span key={i} className="px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded truncate max-w-[80px]" title={skill}>{skill}</span>)}
                        {candidate.skills.length > 2 && <span className="text-xs text-gray-400">+{candidate.skills.length - 2}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <button onClick={() => navigate(`/candidates/${candidate.id}`)} className="border border-emerald-500 text-xs text-white hover:bg-emerald-600 px-2 py-1 rounded">View</button>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleAddNote(candidate)} className="p-1 text-white hover:bg-gray-800 rounded" title="Add Notes">📝</button>
                        <button onClick={() => handleDeleteCandidate(candidate.id)} className="p-1 text-red-600 hover:text-red-700 hover:bg-gray-800 rounded" title="Delete">🗑️</button>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-6 text-gray-400 text-xs">No candidates</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Add Note for {selectedCandidate.name}</h3>
            <NotesWithMentions value={quickNote} onChange={setQuickNote} placeholder="Add a quick note... (use @ to mention team members)" rows={4} />
            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={() => setShowNotesModal(false)} className="px-3 py-1 border border-gray-700 rounded hover:bg-gray-800 text-white">Cancel</button>
              <button onClick={handleSaveNote} className="px-3 py-1 border border-emerald-500 rounded hover:bg-emerald-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
