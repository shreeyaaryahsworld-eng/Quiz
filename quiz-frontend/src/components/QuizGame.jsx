import React, { useState } from "react";
import "../index.css";

const QuizGame = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  handleAnswer,
  nextQuestion,
  isLastQuestion,      // boolean from parent
  showResults,         // boolean from parent
  score,               // number from parent
  maxScore             // number from parent (usually totalQuestions)
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!question && !showResults) return null;

  const onOptionClick = (option) => {
    setSelectedOption(option);
    handleAnswer(question, option);
  };

  const onNextClick = () => {
    setSelectedOption(null);
    nextQuestion();
  };

  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
      : 0;

  // RESULTS VIEW
  if (showResults) {
    const percent =
      maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return (
      <div className="quiz-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900 px-4 py-8">
        <div className="quiz-card w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-sky-100 p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Quiz Results
          </h1>

          <p className="text-slate-600">
            You answered{" "}
            <span className="font-semibold text-blue-600">
              {score} / {maxScore}
            </span>{" "}
            questions correctly ({percent}%).
          </p>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Overall score</span>
              <span>{percent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Use these results to see which domains you are strongest in and
            explore matching career paths.
          </p>
        </div>
      </div>
    );
  }

  // QUESTION VIEW
  return (
    <div className="quiz-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900 px-4 py-8">
      <div className="quiz-card w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-sky-100 p-6 md:p-8 space-y-6">
        {/* Top bar / progress text */}
        <header className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Question{" "}
            <span className="font-semibold text-slate-900">
              {currentQuestionIndex + 1}
            </span>{" "}
            / {totalQuestions}
          </span>

          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
            Career Quiz
          </span>
        </header>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">
              Progress
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl md:text-2xl font-semibold text-slate-950">
          {question.question}
        </h2>

        {/* Optional code block */}
        {question.code && (
          <pre className="bg-slate-900 text-emerald-300 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {question.code}
          </pre>
        )}

        {/* Options */}
        <div className="grid gap-3">
          {question.options.map((option) => {
            const isSelected = selectedOption === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onOptionClick(option)}
                className={`quiz-option w-full min-h-[3.25rem] md:min-h-[3.5rem] flex items-center
                            p-3 md:p-4 rounded-xl border text-left text-sm md:text-base
                            transition-colors transition-shadow
                            ${
                              isSelected
                                ? "quiz-option--selected border-blue-500 bg-blue-50 text-slate-900 shadow-md"
                                : "border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300"
                            }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Next / Submit button */}
      
<footer className="flex justify-end pt-2">
  <button
    type="button"
    onClick={onNextClick}
    disabled={selectedOption === null}
    className="quiz-next inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium
               bg-blue-600 text-black shadow-sm
               hover:bg-blue-700 hover:shadow-md
               disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLastQuestion ? "Submit" : "Next"}
  </button>
</footer>

        
      </div>
    </div>
  );
};

export default QuizGame;
