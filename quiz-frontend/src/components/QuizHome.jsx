import React from "react";
import { Play } from "lucide-react";

const QuizHome = ({ onStart }) => {
  const domains = [
    "Technology", "Creative", "Healthcare", "Education", "Finance",
    "Science", "Engineering", "Media", "Design", "Business", "Legal", "Culinary",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100">
      {/* HERO SECTION */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-snug animate-fadeInUp">
          🚀 Discover Your <span className="text-indigo-600">Perfect Career Path</span>
        </h1>
        <p className="text-gray-600 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
          Take our fun and insightful quiz to uncover your strengths, interests, and the career path that truly fits you.
        </p>
      </div>

      <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-10 md:p-12 max-w-5xl w-full">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What You'll Get</h3>
            <ul className="space-y-3 text-gray-700">
              <li>✨ Personalized career recommendations</li>
              <li>📊 Compatibility scores & analysis</li>
              <li>🎯 Expert guidance tailored to your profile</li>
              <li>🌍 Insights across 12 exciting career domains</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz Details</h3>
            <ul className="space-y-3 text-gray-700">
              <li>🕐 Estimated Time: <b>5–7 minutes</b></li>
              <li>📋 Total Questions: <b>22</b></li>
              <li>💡 Career Domains: <b>12</b></li>
              <li>🎓 Format: <b>Multiple Choice</b></li>
            </ul>
          </div>
        </div>

        {/* Domains Section */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-10 border border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-5 text-center">
            Career Domains Covered
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {domains.map((domain) => (
              <span key={domain} className="text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-200 rounded-xl py-2 px-3 text-center shadow-sm hover:shadow-md transition-all">
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg py-4 px-10 rounded-2xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 animate-bounce"
          >
            <Play className="w-5 h-5" />
            Start Your Career Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizHome;