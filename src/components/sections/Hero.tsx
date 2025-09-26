import React from "react";
import { Button } from "../ui/Button";
import { COMPANY_INFO, PLATFORM_STATS } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section
      id="home"
      className="flex flex-col gap-5 items-center bg-black py-20 lg:py-32"
    >
      <div className="flex items-center gap-5">
        <span className="md:w-40 sm:w-25 w-12 h-[2px] bg-gradient-to-r from-white to-emerald-400/70 rounded-full"></span>
        <p className="border md:text-base sm:text-sm text-xs md:px-8 sm:px-6 px-4 py-2 rounded-full drop-shadow-md font-bold uppercase border-emerald-400 text-emerald-300">
          About Our Platform
        </p>
        <span className="md:w-40 sm:w-25 w-12 h-[2px] bg-gradient-to-r from-emerald-400/70 to-white rounded-full"></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Revolutionize Your Recruitment with{" "}
              <span className="text-emerald-400">Intelligent</span>,{" "}
              <span className="text-emerald-400"> Efficient</span>,{" "}
              <span className="text-gray-400">Data-Powered Solutions</span>
            </h1>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl">
              {COMPANY_INFO.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button
                variant="default"
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => navigate("/hr-login")}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="flex justify-center lg:justify-end">
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              {PLATFORM_STATS.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-900 rounded-2xl md:p-8 p-2 shadow-lg border border-gray-800 text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-sm font-medium">
                    {stat.label}
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    {index === 0
                      ? "Recruiters and hiring managers trust our tools to simplify decision-making and reduce time-to-hire."
                      : "Join forward-thinking companies building better teams through structured, data-driven recruitment."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
