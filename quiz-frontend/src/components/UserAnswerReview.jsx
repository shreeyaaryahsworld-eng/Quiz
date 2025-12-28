import React, { useState, useEffect } from "react";
import axios from "axios";

const UserAnswerReview = ({ userId, stage, onClose }) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user-answers/${userId}/${stage}`);
        setAnswers(res.data.data.questions || []);
      } catch (err) {
        setError("Failed to load answers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && stage) {
      fetchAnswers();
    }
  }, [userId, stage]);
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Your Quiz Answers Review</h2>
              <button
                onClick={onClose}
                className="bg-red-500 hover:bg-red-600 text-gray rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading your answers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          {answer.questionText}
                        </h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700">
                            <span className="font-medium text-blue-600">Your Answer: </span>
                            {answer.selectedOptionText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAnswerReview;