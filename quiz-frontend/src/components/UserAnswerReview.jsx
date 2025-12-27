import React from "react";

const UserAnswerReview = ({ userName, answers, onClose }) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .close-button {
          transition: all 0.2s ease;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-button:hover {
          background-color: #f3f4f6;
          transform: scale(1.1);
          color: #374151;
        }
      ` }} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Answer Review</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl close-button"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{userName}</h3>
            </div>
            <div className="space-y-4">
              {answers.map((answer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-2">
                    {index + 1}. {answer.questionText}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Selected: </span>
                    {answer.selectedOptionText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAnswerReview;