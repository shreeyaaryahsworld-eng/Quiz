// QuizContainer.jsx
import React, { useState } from "react";
import axios from "axios";
import QuizGame from "./QuizGame";
import QuizResults from "./QuizResults";
import { careerQuizQuestions } from "./Questions";

const QuizContainer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [domainScores, setDomainScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showResultsData, setShowResultsData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id; // adjust to your user shape
  const STAGE = "career_quiz";
  const CATEGORY_NAME = "Career Quiz";

  const currentQuestion = careerQuizQuestions[currentIndex];
  const totalQuestions = careerQuizQuestions.length;

  const handleAnswer = (question, selectedOption) => {
    const isCorrect = question.correctAnswer === selectedOption;
    if (!isCorrect) return;

    setDomainScores((prev) => {
      const prevDomainScore = prev[question.domain] || 0;
      return { ...prev, [question.domain]: prevDomainScore + 1 };
    });
  };

  // ---------- Finish + (optionally) save final result ----------
  const handleFinish = async () => {
    const domainQuestionCounts = careerQuizQuestions.reduce((acc, q) => {
      acc[q.domain] = (acc[q.domain] || 0) + 1;
      return acc;
    }, {});

    const allScores = Object.entries(domainQuestionCounts).map(
      ([domain, count]) => {
        const raw = domainScores[domain] || 0;
        const percent = Math.round((raw / count) * 100);
        return [domain, percent];
      }
    );

    const topPaths = [...allScores].sort(([, a], [, b]) => b - a);
    const personalityType = "analytical and curious";

    const resultData = { topPaths, allScores, personalityType };

    setShowResultsData(resultData);
    setShowResults(true);

    if (userId) {
      try {
        await axios.post("/api/progress/save-result", {
          userId,
          stage: STAGE,
          resultData,
          categoryName: CATEGORY_NAME
        });
      } catch (err) {
        console.error("Error saving final result", err);
      }
    }
  };

  // ---------- Next ----------
  const handleNext = async () => {
    const isLast = currentIndex === totalQuestions - 1;

    // (optional) save partial progress here if you want
    // await axios.post("/api/progress/save-quiz-progress", { ... });

    if (isLast) {
      await handleFinish();     // last question → Submit → results
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // ---------- Retake ----------
  const handleRetake = async () => {
    setCurrentIndex(0);
    setDomainScores({});
    setShowResults(false);
    setShowResultsData(null);

    if (userId) {
      try {
        await axios.post("/api/progress/reset-progress", {
          userId,
          stage: STAGE,
          categoryName: CATEGORY_NAME
        });
      } catch (err) {
        console.error("Error resetting progress", err);
      }
    }
  };

  const handleHome = () => {
    window.location.href = "/";
  };

  // --------- RESULTS vs QUIZ VIEW ----------
  if (showResults && showResultsData) {
    return (
      <QuizResults
        showResults={showResultsData}
        onRetake={handleRetake}
        onHome={handleHome}
      />
    );
  }

  return (
    <QuizGame
      question={currentQuestion}
      currentQuestionIndex={currentIndex}
      totalQuestions={totalQuestions}
      handleAnswer={handleAnswer}
      nextQuestion={handleNext}
      isLastQuestion={currentIndex === totalQuestions - 1}
    />
  );
};

export default QuizContainer;
