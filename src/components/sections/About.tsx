import React from "react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

const About: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section
      id="about"
      className="flex flex-col gap-12 items-center py-16 lg:py-24 bg-black"
    >
      {/* Section Header */}
      <div className="flex items-center gap-5">
        <span className="md:w-40 sm:w-32 w-12 h-[2px] bg-gradient-to-r from-white to-emerald-400/70 rounded-full"></span>
        <p className="border md:text-base sm:text-sm text-xs md:px-8 sm:px-6 px-4 py-2 rounded-full drop-shadow-md font-bold uppercase border-emerald-400 text-white">
          Our Platform
        </p>
        <span className="md:w-40 sm:w-32 w-12 h-[2px] bg-gradient-to-r from-emerald-400/70 to-white rounded-full"></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Find Your Strategic Workforce Planning Partners Today
            </h2>

            <p className="text-gray-200 text-lg mb-8 leading-relaxed">
              Empower your hiring team with data-driven tools to attract,
              assess, and retain top talent efficiently.
            </p>

            <div className="space-y-4 mb-8">
              {/* Feature 1 */}
              <Feature
                title="Smart Job Management"
                description="Create, manage, and track job postings with our intuitive platform designed for efficient recruitment."
              />

              {/* Feature 2 */}
              <Feature
                title="Candidate Pipeline Management"
                description="Streamline your candidate workflow with advanced tracking, communication tools, and application management."
              />

              {/* Feature 3 */}
              <Feature
                title="Comprehensive Assessment Tools"
                description="Create and manage candidate assessments with our powerful evaluation system to find the right fit for your roles."
              />
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/hr-login")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Sign in for Demo
            </Button>
          </div>

          {/* Right Content (optional image) */}
          {/* <div className="w-full flex justify-center border-2 border-emerald-400 rounded-2xl overflow-hidden">
            <img src="/about.png" alt="About" className="w-full h-auto" />
          </div> */}
        </div>
      </div>
    </section>
  );
};

// Feature Component
const Feature: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="flex items-start space-x-3">
    <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg
        className="w-3 h-3 text-emerald-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
);

export default About;
