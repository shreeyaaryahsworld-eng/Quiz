import React, { useRef } from "react";
import {
  BarChart3, Trophy, BookOpen, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PremiumPopup from "../components/PremiumPlans";
import { useNavigate } from "react-router-dom";

const QuizResults = ({ showResults, onRetake, onHome }) => {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  // Premium Check
  if (!user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <PremiumPopup
          onClose={() => navigate("/")}
          onUpgrade={() => { window.location.reload(); }}
        />
      </div>
    );
  }

const domainCounts = showResults?.domainCounts || {};
const totalQuestions = showResults?.totalQuestions || 0;
if (!Object.keys(domainCounts).length) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>No results to display.</p>
    </div>
  );
}
const allScores = Object.entries(domainCounts).map(
  ([domain, count]) => ({
    domain,
    count,
    percentage: Math.round((count / totalQuestions) * 100),
  })
);

const sortedDomains = [...allScores].sort(
  (a, b) => b.count - a.count
);

const topPaths = sortedDomains.slice(0, 5);

// Simple, explainable personality text
const personalityType =
  topPaths[0]?.percentage >= 40
    ? "strongly inclined"
    : topPaths[0]?.percentage >= 30
    ? "moderately inclined"
    : "broadly curious";


 const top5ChartData = topPaths.map((d) => ({
  name: d.domain,
  score: d.percentage,
}));

const domainDescriptions = {
  technology: "You enjoy working with systems, logic, and digital tools.",
  design: "You are drawn to creativity, aesthetics, and user experience.",
  data: "You enjoy finding patterns and insights in information.",
  engineering: "You like building, optimizing, and solving practical problems.",
  business: "You think strategically about growth and decision-making.",
  finance: "You are comfortable with numbers, planning, and risk.",
  management: "You prefer organizing people and processes.",
  law: "You value structure, reasoning, and rules.",
  psychology: "You are interested in understanding people and behavior.",
  education: "You enjoy teaching, guiding, and mentoring.",
  communication: "You like expressing ideas and persuasion.",
  social: "You are empathetic and people-oriented."
};


  const downloadReport = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, scrollY: -window.scrollY });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Career_Gen_AI_Report.pdf");
    } catch (err) {
      console.error(err);
      alert("Failed to download report.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 py-8">
      <div ref={reportRef} className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-10">
        <div className="text-center mb-10">
          <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your Career Quiz Results</h1>
          <p className="text-gray-600 text-sm sm:text-base">Here are your top career matches and detailed domain scores.</p>
        </div>

        {/* Top 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {topPaths.slice(0, 3).map(({domain}) => (
            <div key={domain} className="bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 rounded-2xl p-5 text-center shadow-sm">
              <Trophy className="w-8 h-8 mx-auto text-indigo-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{domain}</h3>
              <p className="text-sm text-gray-600">{domainDescriptions[domain]}</p>
            </div>
          ))}
        </div>

        {/* Analysis Text */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10 shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">What This Means for You</h3>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Your responses suggest you have a strong interest in <b>{topPaths[0].domain}</b>
 and related fields.
            You’re naturally inclined toward tasks that match your <b>{personalityType}</b> nature.
          </p>
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-5 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" /> Top 3 Matches
            </h2>
            {topPaths.slice(0, 3).map((item, i) => (
              <div key={item.domain} className={`mb-4 p-5 border rounded-xl ${i === 0 ? "bg-green-50 border-green-200" : i === 1 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-semibold text-gray-800">{i + 1}. {item.domain}</h3>
                  <span className="font-bold text-lg">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          <div>
             <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
               <BarChart3 className="w-5 h-5 mr-2" /> Comparison
             </h3>
             <div className="w-full min-h-[260px] sm:min-h-[300px]">
               <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={top5ChartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} />
                   <YAxis domain={[0, 100]} />
                   <Tooltip />
                   <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                     {top5ChartData.map((entry, i) => <Cell key={`cell-${i}`} fill="#6366F1" />)}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 mt-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" /> Next Steps
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
              <li>Explore online courses related to your top domains.</li>
              <li>Participate in projects, clubs, or competitions.</li>
              <li>Connect with mentors.</li>
            </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-10 flex-nowrap overflow-hidden">
          <button onClick={onRetake} className="bg-indigo-600 hover:bg-indigo-700 text-black font-semibold py-2 px-4 rounded-md">Retake Quiz</button>
          <button onClick={onHome} className="bg-gray-600 hover:bg-gray-700 text-black font-semibold py-2 px-4 rounded-md">Back to Home</button>
          <button onClick={() => navigate("/interest-form")} className="bg-green-600 hover:bg-green-700 text-black font-semibold py-2 px-4 rounded-md">Get Assessment</button>
          <button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700 text-black font-semibold py-2 px-4 rounded-md">Download Report</button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;