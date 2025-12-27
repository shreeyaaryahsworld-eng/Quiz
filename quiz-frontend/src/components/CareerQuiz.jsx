import React, { useState, useEffect } from "react";
import axios from "axios";

import { careerQuizQuestions } from "./Questions";
import QuizHome from "./QuizHome";
import QuizGame from "./QuizGame";
import QuizResults from "./QuizResults";
import PremiumPlans from "./PremiumPlans";
import { Lock } from "lucide-react";

const CareerQuiz = () => {
  const [questions] = useState(
    [...careerQuizQuestions].sort(() => Math.random() - 0.5)
  );

  const [currentScreen, setCurrentScreen] = useState("loading"); // home | quiz | results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [domainCounts, setDomainCounts] = useState({});
  const [result, setResult] = useState(null);
const [answers, setAnswers] = useState({});

  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const STAGE_KEY = "careerQuiz";
  const CATEGORY_NAME = "Career Path Assessment";

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  /* ---------------- INIT ---------------- */
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

        // ✅ If already completed → show results
        if (report?.stageResults?.[STAGE_KEY]) {
          setResult(report.stageResults[STAGE_KEY]);
          setCurrentScreen("results");
          return;
        }

        // ✅ Resume quiz if partially done
        if (report?.stageProgress?.[STAGE_KEY]) {
          const saved = report.stageProgress[STAGE_KEY];
          setCurrentQuestion(saved.currentQuestionIndex || 0);
          setDomainCounts(saved.domainCounts || {});
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

  /* ---------------- ANSWER HANDLER ---------------- */
  const handleAnswer = (questionIndex, option) => {
  const newDomain = option.domain;

  setDomainCounts(prevCounts => {
    const updated = { ...prevCounts };

    // remove previous answer for this question (if exists)
    const prevDomain = answers[questionIndex]?.domain;
    if (prevDomain) {
      updated[prevDomain] = Math.max(0, (updated[prevDomain] || 1) - 1);
    }

    // add new domain
    updated[newDomain] = (updated[newDomain] || 0) + 1;
const user = getUser();
if (user?._id) {
  axios.post(`${API_URL}/api/progress/save-quiz-progress`, {
    userId: user._id,
    stage: STAGE_KEY,
    currentQuestionIndex: currentQuestion,
    domainCounts: updated,
    totalQuestions: questions.length,
    categoryName: CATEGORY_NAME
  }).catch(() => {});
}

    return updated;
  });

  setAnswers(prev => ({
    ...prev,
    [questionIndex]: option
  }));
};

  /* ---------------- NEXT / SUBMIT ---------------- */
 const nextQuestion = async () => {
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(i => i + 1);
    return;
  }

  // SUBMIT (use latest state)
  const finalCounts = { ...domainCounts };

  const resultData = {
    domainCounts: finalCounts,
    totalQuestions: questions.length
  };

  setResult(resultData);
  setCurrentScreen("results");

  const user = getUser();
  if (user?._id) {
    // Save result
    axios.post(`${API_URL}/api/progress/save-result`, {
      userId: user._id,
      stage: STAGE_KEY,
      categoryName: CATEGORY_NAME,
      resultData
    }).catch(() => {});

    // Save answers
    const answersArray = questions.map((q, index) => ({
      questionText: q.question,
      selectedOptionText: answers[index]?.text || '',
    }));

    axios.post(`${API_URL}/api/user-answers`, {
      userId: user._id,
      userName: user.name || user.email,
      stage: STAGE_KEY,
      questions: answersArray
    }).catch(() => {});
  }
};


  /* ---------------- RETAKE ---------------- */
  const handleRetake = async () => {
    const user = getUser();
    if (user?._id) {
      await axios.post(`${API_URL}/api/progress/reset-progress`, {
        userId: user._id,
        stage: STAGE_KEY,
        categoryName: CATEGORY_NAME
      });
    }

    setDomainCounts({});
    setCurrentQuestion(0);
    setResult(null);
    setCurrentScreen("quiz");
  };

  /* ---------------- RENDER ---------------- */
  if (currentScreen === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (currentScreen === "home") {
    return <QuizHome onStart={() => setCurrentScreen("quiz")} />;
  }

  if (currentScreen === "results") {
    if (isPremium) {
      const answersArray = questions.map((q, index) => ({
        questionText: q.question,
        selectedOptionText: answers[index]?.text || '',
        domain: answers[index]?.domain || ''
      }));

      return (
        <QuizResults
          showResults={result}
          answers={answersArray}
          onRetake={handleRetake}
          onHome={() => setCurrentScreen("home")}
        />
      );
    }

    // 🔒 Locked view
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center space-y-6">
          <Lock className="mx-auto w-10 h-10 text-gray-400" />
          <h2 className="text-2xl font-bold">Results Locked</h2>
          <p>Upgrade to see your career matches</p>

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

        {showPremiumPopup && (
          <PremiumPlans onClose={() => setShowPremiumPopup(false)} />
        )}
      </div>
    );
  }
const previousQuestion = () => {
  if (currentQuestion > 0) {
    setCurrentQuestion(i => i - 1);
  }
};

  // QUIZ
  return (
   <QuizGame
  question={questions[currentQuestion]}
  currentQuestionIndex={currentQuestion}
  totalQuestions={questions.length}
  handleAnswer={handleAnswer}
  nextQuestion={nextQuestion}
  previousQuestion={previousQuestion}
  isLastQuestion={currentQuestion === questions.length - 1}
  selectedAnswer={answers[currentQuestion]}/>

  );
};

export default CareerQuiz;
