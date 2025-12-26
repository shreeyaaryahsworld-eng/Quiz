import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, RefreshCw, ChevronRight } from "lucide-react";

import { careerQuizQuestions } from "./Questions";
import QuizHome from "./QuizHome";
import QuizGame from "./QuizGame";
import QuizResults from "./QuizResults";
import PremiumPlans from "./PremiumPlans";

const CareerQuiz = () => {
  const navigate = useNavigate();

  // shuffle once
  const [questions] = useState(
    [...careerQuizQuestions].sort(() => Math.random() - 0.5)
  );

  const [currentScreen, setCurrentScreen] = useState("loading");
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // 👉 IMPORTANT: answers is now an ARRAY, not object
  const [answers, setAnswers] = useState([]);

  const [result, setResult] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const STAGE_KEY = "careerQuiz";
  const CATEGORY_NAME = "Career Path Assessment";

  // ---------------- HELPERS ----------------

  const getUser = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // ---------------- INIT ----------------

  useEffect(() => {
    const init = async () => {
      const user = getUser();
      if (!user?._id) {
        setCurrentScreen("home");
        return;
      }

      setIsPremium(user.isPremium || false);

      try {
        const res = await axios.get(
          `${API_URL}/api/progress/get-progress/${user._id}`
        );

        const report = res.data?.data;

        if (report?.stageResults?.[STAGE_KEY]) {
          setResult(report.stageResults[STAGE_KEY]);
          setCurrentScreen("results");
          return;
        }

        if (report?.stageProgress?.[STAGE_KEY]) {
          const saved = report.stageProgress[STAGE_KEY];
          setCurrentQuestion(saved.currentQuestionIndex || 0);
          setCurrentScreen("quiz");
          return;
        }

        setCurrentScreen("home");
      } catch {
        setCurrentScreen("home");
      }
    };

    init();
  }, []);

  // ---------------- QUIZ LOGIC ----------------

  const handleAnswer = (question, selectedOption) => {
    const isCorrect = selectedOption === question.correctAnswer;

    setAnswers(prev => [
      ...prev,
      {
        domain: question.domain,
        isCorrect
      }
    ]);

    // background save
    const user = getUser();
    if (user?._id) {
      axios.post(`${API_URL}/api/progress/save-quiz-progress`, {
        userId: user._id,
        stage: STAGE_KEY,
        currentQuestionIndex: currentQuestion,
        answers: answers,
        totalQuestions: questions.length,
        categoryName: CATEGORY_NAME
      }).catch(() => {});
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  // ---------------- FINAL SUBMIT ----------------

  const submitQuiz = async () => {
    const user = getUser();

    const payload = {
      userId: user?._id,
      stage: STAGE_KEY,
      categoryName: CATEGORY_NAME,
      resultData: {
        answers
      }
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/progress/save-result`,
        payload
      );

      setResult(res.data.result);
      setCurrentScreen("results");
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  // ---------------- RETAKE ----------------

  const handleRetake = async () => {
    const user = getUser();
    if (user?._id) {
      await axios.post(`${API_URL}/api/progress/reset-progress`, {
        userId: user._id,
        stage: STAGE_KEY,
        categoryName: CATEGORY_NAME
      });
    }

    setAnswers([]);
    setCurrentQuestion(0);
    setResult(null);
    setCurrentScreen("quiz");
  };

  // ---------------- RENDER ----------------

  if (currentScreen === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (currentScreen === "home") {
    return <QuizHome onStart={() => setCurrentScreen("quiz")} />;
  }

  if (currentScreen === "results") {
    if (isPremium) {
      return (
        <QuizResults
          result={result}
          onRetake={handleRetake}
          onHome={() => setCurrentScreen("home")}
        />
      );
    }

    // 🔒 LOCKED VIEW
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center space-y-6">
          <Lock className="mx-auto w-10 h-10 text-gray-400" />
          <h2 className="text-2xl font-bold">Results Locked</h2>
          <p>Upgrade to see your top career domains</p>

          <button
            onClick={() => setShowPremiumPopup(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
          >
            Unlock Results
          </button>

          <button
            onClick={handleRetake}
            className="border px-6 py-3 rounded-lg"
          >
            Retake Quiz
          </button>
        </div>

        {showPremiumPopup && <PremiumPlans onClose={() => setShowPremiumPopup(false)} />}
      </div>
    );
  }

  // QUIZ SCREEN
  return (
    <QuizGame
      question={questions[currentQuestion]}
      currentQuestionIndex={currentQuestion}
      totalQuestions={questions.length}
      handleAnswer={handleAnswer}
      nextQuestion={nextQuestion}
    />
  );
};

export default CareerQuiz;
