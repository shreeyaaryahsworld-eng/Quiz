import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const QuizGame = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  answers,
  handleAnswer,
  nextQuestion,
  prevQuestion,
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
    "“Your career journey begins with understanding yourself.”",
    "“Every answer brings you closer to your true calling.”",
    "“Trust your instincts — they know the way.”",
    "“Be honest with yourself, that’s where clarity begins.”",
    "“Your passion is waiting for your courage to catch up.”",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  if (!question) return <div className="p-10 text-center">Loading...</div>;

  return (
    // 1. Changed min-h-screen to allow scrolling on mobile
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      
      {/* 2. Removed fixed height constraint (md:h-[85vh]) on mobile so it grows with content */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* LEFT SIDE — Quiz Questions */}
        {/* Added p-6 for mobile, p-10 for desktop */}
        <div className="flex flex-col justify-center p-6 md:p-10 order-2 md:order-1">
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              <span className="text-xs font-bold text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 leading-snug">
            {question.text}
          </h2>

          {/* Options - Grid layout for better touch targets */}
          <div className="space-y-3 mb-8">
            {[5, 4, 3, 2, 1].map((value, index) => {
              const isSelected = answers[question.id] === value;
              const optionLabels = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];
              const optionLetters = ["A", "B", "C", "D", "E"];
              const labelText = optionLabels[5 - value];
              const letter = optionLetters[index];

              return (
                <label
                  key={value}
                  className={`group flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 shadow-sm"
                      : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={value}
                    checked={isSelected}
                    onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
                    className="hidden"
                  />
                  
                  {/* Custom Radio Circle */}
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 mr-4 transition-colors ${
                    isSelected 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "border-gray-300 text-gray-400 group-hover:border-indigo-400"
                  }`}>
                    {isSelected ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{letter}</span>
                    )}
                  </div>

                  <span className={`text-sm sm:text-base font-medium ${isSelected ? "text-indigo-900" : "text-gray-700"}`}>
                    {labelText}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex-1 flex items-center justify-center py-3.5 rounded-xl font-semibold transition-colors ${
                currentQuestionIndex === 0
                  ? "text-gray-300 cursor-not-allowed bg-gray-50"
                  : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Prev
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={!answers[question.id]}
              className={`flex-[2] flex items-center justify-center py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all transform active:scale-95 ${
                !answers[question.id]
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
              }`}
            >
              {currentQuestionIndex === totalQuestions - 1 ? "Get Results" : "Next Question"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE — Hidden on mobile (hidden md:flex) to prevent overflow/clutter */}
        <div className="hidden md:flex order-1 md:order-2 relative bg-indigo-600 flex-col items-center justify-center p-12 text-center text-white overflow-hidden">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 max-w-sm">
            <div className="mb-8 p-4 bg-white/10 rounded-full inline-block backdrop-blur-sm">
               <img 
                 src="https://cdn-icons-png.flaticon.com/512/4140/4140037.png" 
                 alt="Thinking" 
                 className="w-24 h-24 object-contain drop-shadow-md" 
               />
            </div>
            
            <div className="h-24 flex items-center justify-center">
              <p className="text-xl font-medium leading-relaxed italic animate-fade-in opacity-90">
                {quotes[currentQuoteIndex]}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizGame;