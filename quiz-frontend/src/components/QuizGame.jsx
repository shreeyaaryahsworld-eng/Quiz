import React from "react";
import "../index.css";

const QuizGame = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  handleAnswer,
  nextQuestion,
  previousQuestion,
  isLastQuestion,
  selectedAnswer
}) => {
  if (!question) return null;

  const progressPercent =
    totalQuestions > 0
      ? Math.round((currentQuestionIndex / totalQuestions) * 100)
      : 0;

  return (
    <div className="quiz-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900 px-4 py-6">
      <div className="quiz-card w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-sky-100 p-4 sm:p-6 md:p-8 space-y-5">

        {/* Header */}
        <header className="flex justify-between text-xs sm:text-sm text-slate-500">
          <span>
            Question{" "}
            <span className="font-semibold text-slate-900">
              {currentQuestionIndex + 1}
            </span>{" "}
            / {totalQuestions}
          </span>
          <span className="font-semibold text-blue-600">Career Quiz</span>
        </header>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-950">
          {question.question}
        </h2>

        {/* Options */}
        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.domain;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleAnswer(currentQuestionIndex, option)}
                className={`w-full min-h-[3.25rem]
                  px-4 py-3 rounded-xl border
                  text-left text-sm sm:text-base
                  transition-all
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 hover:bg-blue-50"
                  }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="pt-3 flex gap-3 justify-between">
          <button
            type="button"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-lg border text-sm sm:text-base disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={nextQuestion}
            disabled={!selectedAnswer}
            className="px-6 py-3 rounded-lg
              bg-indigo-600 text-black text-sm sm:text-base font-medium
              hover:bg-blue-700 disabled:opacity-50"
          >
            {isLastQuestion ? "Submit" : "Next"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default QuizGame;
