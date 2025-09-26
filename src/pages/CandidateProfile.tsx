import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Candidate } from "../services/seed/candidateSeed";
import type { Job } from "../services/seed/jobsSeed";
import NotesWithMentions from "../components/NotesWithMentions";

interface TimelineEvent {
  stage: string;
  date: Date;
  note: string;
}

interface CandidateProfileProps {}

const CandidateProfile: React.FC<CandidateProfileProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [newNote, setNewNote] = useState("");

  const stages = [
    { id: "applied", name: "Applied", color: "bg-blue-700 text-white" },
    { id: "screening", name: "Screening", color: "bg-yellow-600 text-white" },
    { id: "interview", name: "Interview", color: "bg-purple-700 text-white" },
    { id: "offer", name: "Offer", color: "bg-green-700 text-white" },
    { id: "rejected", name: "Rejected", color: "bg-red-700 text-white" },
    { id: "hired", name: "Hired", color: "bg-emerald-700 text-white" },
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidateResponse, timelineResponse] = await Promise.all([
        axios.get(`/candidates/${id}`),
        axios.get(`/candidates/${id}/timeline`),
      ]);

      setCandidate(candidateResponse.data);
      setTimeline(timelineResponse.data || []);

      if (candidateResponse.data.jobId) {
        const jobResponse = await axios.get(
          `/jobs/${candidateResponse.data.jobId}`
        );
        setJob(jobResponse.data);
      }

      const savedNotes = localStorage.getItem(`candidate-notes-${id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!candidate) return;

    try {
      await axios.patch(`/candidates/${candidate.id}`, {
        stage: newStage,
        updatedAt: new Date(),
      });

      setCandidate((prev) =>
        prev ? { ...prev, stage: newStage as Candidate["stage"] } : null
      );

      const newTimelineEvent: TimelineEvent = {
        stage: newStage,
        date: new Date(),
        note: `Moved to ${
          stages.find((s) => s.id === newStage)?.name || newStage
        }`,
      };
      setTimeline((prev) => [newTimelineEvent, ...prev]);

      const timelineResponse = await axios.get(`/candidates/${id}/timeline`);
      setTimeline(timelineResponse.data || []);
    } catch (error) {
      console.error("Error updating candidate stage:", error);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const noteWithTimestamp = `[${new Date().toLocaleString()}] ${newNote}`;
    const updatedNotes = notes
      ? `${notes}\n\n${noteWithTimestamp}`
      : noteWithTimestamp;

    setNotes(updatedNotes);
    setNewNote("");

    localStorage.setItem(`candidate-notes-${id}`, updatedNotes);
  };

  const getStageInfo = (stageId: string) => {
    return (
      stages.find((s) => s.id === stageId) || {
        name: stageId,
        color: "bg-gray-700 text-white",
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-blue-900 min-h-screen text-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-blue-900 min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Candidate not found</h1>
          <button
            onClick={() => navigate("/dashboard/candidates")}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const currentStageInfo = getStageInfo(candidate.stage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-blue-900 min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{candidate.name}</h1>
            <p className="text-gray-300 mb-2">{candidate.email}</p>
            {job && (
              <p className="text-gray-400">
                Applied for: <span className="font-medium">{job.title}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => navigate("/dashboard/candidates")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Details */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-black text-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Current Status</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${currentStageInfo.color}`}
                >
                  {currentStageInfo.name}
                </span>
                <span className="text-sm text-gray-300">
                  Since {new Date(candidate.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <select
                value={candidate.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="px-3 py-1 border border-gray-600 bg-black text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-black text-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Application Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-300">
                  Applied Date:
                </span>
                <p className="text-sm">{new Date(candidate.appliedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-300">
                  Last Updated:
                </span>
                <p className="text-sm">{new Date(candidate.updatedAt).toLocaleDateString()}</p>
              </div>
              {candidate.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-300">Phone:</span>
                  <p className="text-sm">{candidate.phone}</p>
                </div>
              )}
              {candidate.experience && (
                <div>
                  <span className="text-sm font-medium text-gray-300">Experience:</span>
                  <p className="text-sm">{candidate.experience}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-black text-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Notes</h2>
            <div className="space-y-4">
              <NotesWithMentions
                value={newNote}
                onChange={setNewNote}
                placeholder="Add a note about this candidate... (use @ to mention team members)"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                Add Note
              </button>
              {notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Previous Notes:</h3>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">{notes}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-black text-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Timeline</h2>
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-300">No timeline events yet.</p>
            ) : (
              timeline.map((event, index) => {
                const stageInfo = getStageInfo(event.stage);
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${stageInfo.color}`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${stageInfo.color}`}
                        >
                          {stageInfo.name}
                        </span>
                        <span className="text-xs text-gray-300">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{event.note}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
