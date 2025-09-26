import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Job } from "../services/seed/jobsSeed";
import type { Assessment, Question } from "../services/seed/assessmentsSeed";
import toast from "react-hot-toast";

interface AssessmentBuilderProps {}

const AssessmentBuilder: React.FC<AssessmentBuilderProps> = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobResponse, assessmentResponse] = await Promise.all([
        axios.get(`/jobs/${jobId}`),
        axios.get(`/assessments/${jobId}`).catch(() => ({ data: { data: [] } })),
      ]);

      setJob(jobResponse.data);
      const assessments = assessmentResponse.data.data;

      if (assessments && assessments.length > 0) {
        setAssessment(assessments[0]);
      } else {
        const newAssessment: Assessment = {
          id: `assessment-${jobId}`,
          jobId: jobId!,
          title: `Assessment for ${jobResponse.data.title}`,
          description: "",
          sections: [],
          createdAt: new Date(),
        };
        setAssessment(newAssessment);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    if (!assessment) return;
    const newSection = {
      id: `section-${Date.now()}`,
      title: `Section ${assessment.sections.length + 1}`,
      questions: [],
    };
    setAssessment({
      ...assessment,
      sections: [...assessment.sections, newSection],
    });
    setSelectedSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<{ title: string }>) => {
    if (!assessment) return;
    setAssessment({
      ...assessment,
      sections: assessment.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    });
  };

  const addQuestion = (sectionId: string, type: Question["type"]) => {
    if (!assessment) return;
    const section = assessment.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newQuestion: Question = {
      id: `q-${sectionId}-${Date.now()}`,
      type,
      question: "",
      required: false,
      options:
        type === "single-choice" || type === "multi-choice" ? ["Option 1", "Option 2"] : undefined,
      validation:
        type === "short-text" || type === "long-text"
          ? { minLength: 0, maxLength: 1000 }
          : type === "numeric"
          ? { min: 0, max: 100 }
          : undefined,
    };

    setAssessment({
      ...assessment,
      sections: assessment.sections.map((s) =>
        s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s
      ),
    });
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    if (!assessment) return;
    setAssessment({
      ...assessment,
      sections: assessment.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
            }
          : section
      ),
    });
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    if (!assessment) return;
    setAssessment({
      ...assessment,
      sections: assessment.sections.map((section) =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter((q) => q.id !== questionId) }
          : section
      ),
    });
    setSelectedQuestion(null);
  };

  const deleteSection = (sectionId: string) => {
    if (!assessment) return;
    setAssessment({
      ...assessment,
      sections: assessment.sections.filter((s) => s.id !== sectionId),
    });
    setSelectedSection(null);
  };

  const saveAssessment = async () => {
    if (!assessment) return;
    try {
      await axios.post("/assessments", assessment);
      toast.success("Assessment saved successfully");
      navigate("/dashboard/assessments");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment");
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateForm = () => {
    if (!assessment) return true;
    for (const section of assessment.sections) {
      for (const question of section.questions) {
        if (question.required && !responses[question.id]) return false;
        if (question.validation) {
          const value = responses[question.id];
          if (value !== undefined && value !== null && value !== "") {
            if (
              question.validation.minLength &&
              value.length < question.validation.minLength
            ) {
              return false;
            }
            if (
              question.validation.maxLength &&
              value.length > question.validation.maxLength
            ) {
              return false;
            }
            if (question.validation.min && value < question.validation.min) {
              return false;
            }
            if (question.validation.max && value > question.validation.max) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  const shouldShowQuestion = (question: Question) => {
    if (!question.conditionalOn) return true;
    const conditionalValue = responses[question.conditionalOn.questionId];
    if (Array.isArray(question.conditionalOn.value)) {
      return question.conditionalOn.value.includes(conditionalValue);
    }
    return conditionalValue === question.conditionalOn.value;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job || !assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment not found</h1>
        <button
          onClick={() => navigate("/dashboard/assessments")}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Assessment Builder</h1>
          <p className="text-sm text-gray-600">
            {job.title} • {job.jobType} • {job.location}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/dashboard/assessments")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveAssessment}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {["builder", "preview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "builder" | "preview")}
              className={`pb-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab === "builder" ? "Builder" : "Live Preview"}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder */}
        {activeTab === "builder" && (
          <div className="space-y-6">
            {/* Sections */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Sections</h2>
                <button
                  onClick={addSection}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition"
                >
                  Add Section
                </button>
              </div>
              <div className="space-y-3">
                {assessment.sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedSection === section.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="text-gray-900 font-medium bg-transparent border-none outline-none w-full"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="text-red-600 hover:text-red-700 ml-2 transition"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {section.questions.length} question(s)
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            {selectedSection && (
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                  <select
                    defaultValue=""
                    onChange={(e) => addQuestion(selectedSection, e.target.value as Question["type"])}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="" disabled>
                      Add Question
                    </option>
                    <option value="single-choice">Single Choice</option>
                    <option value="multi-choice">Multi Choice</option>
                    <option value="short-text">Short Text</option>
                    <option value="long-text">Long Text</option>
                    <option value="numeric">Numeric</option>
                    <option value="file-upload">File Upload</option>
                  </select>
                </div>

                {assessment.sections
                  .find((s) => s.id === selectedSection)
                  ?.questions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-3 border rounded-lg transition ${
                        selectedQuestion === q.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedQuestion(q.id)}
                    >
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(selectedSection, q.id, { question: e.target.value })}
                          className="w-full text-gray-900 font-medium bg-transparent border-none outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(selectedSection, q.id);
                          }}
                          className="text-red-600 hover:text-red-700 ml-2 transition"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{q.type}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {activeTab === "preview" && (
          <div className="bg-gray-50 p-6 rounded-lg shadow space-y-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
            {assessment.sections.length === 0 ? (
              <p className="text-gray-500">No sections added yet.</p>
            ) : (
              assessment.sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <h3 className="font-medium text-gray-800">{section.title}</h3>
                  {section.questions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No questions in this section</p>
                  ) : (
                    section.questions.map((q) => (
                      <div key={q.id} className="p-2 border rounded bg-white text-gray-800">
                        {q.question || "Untitled Question"}
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentBuilder;
