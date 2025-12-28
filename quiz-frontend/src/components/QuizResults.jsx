import React, { useRef, useState } from "react";
import {
  BarChart3, Trophy, BookOpen, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import PremiumPopup from "../components/PremiumPlans";
import UserAnswerReview from "../components/UserAnswerReview";
import { useNavigate } from "react-router-dom";

const QuizResults = ({ showResults, onRetake, onHome, answers }) => {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [showModal, setShowModal] = useState(false);

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
const totalDomainScore = Object.values(domainCounts).reduce(
  (sum, count) => sum + count,
  0
);
const allScores = Object.entries(domainCounts).map(
  ([domain, count]) => ({
    domain,
    count,
    percentage: Math.round((count / totalDomainScore) * 100),
  })
);
const sortedDomains = allScores.sort((a, b) => b.count - a.count);
const topDomains = sortedDomains.slice(0, 3);

// Recalculate percentages based on top 3 total
const topTotal = topDomains.reduce((sum, item) => sum + item.count, 0);
topDomains.forEach(item => {
  item.percentage = Math.round((item.count / topTotal) * 100);
});
const topPaths = sortedDomains.slice(0, 5);

// Simple, explainable personality text
const personalityType =
  topDomains[0]?.percentage >= 40
    ? "strongly inclined"
    : topDomains[0]?.percentage >= 30
    ? "moderately inclined"
    : "broadly curious";


 const top3ChartData = topDomains.map((d) => ({
  name: d.domain,
  score: d.percentage,
}));

const domainDescriptions = {
  technology: "You enjoy working with computers, software, systems, and digital tools to solve problems.",
  creative: "You are imaginative and enjoy expressing ideas through art, writing, or innovation.",
  healthcare: "You are interested in helping people, improving health, and caring for others.",
  education: "You enjoy teaching, guiding, and helping others learn and grow.",
  finance: "You are comfortable with numbers, money management, and financial planning.",
  science: "You are curious about how the world works and enjoy research, experiments, and discovery.",
  engineering: "You like building things, fixing problems, and applying ideas to real-life solutions.",
  media: "You enjoy storytelling, content creation, communication, and working with digital or mass media.",
  design: "You are drawn to visuals, creativity, layout, and creating user-friendly experiences.",
  business: "You think strategically about ideas, leadership, growth, and decision-making.",
  legal: "You value rules, logic, fairness, and structured thinking.",
  culinary: "You enjoy cooking, food creativity, and working in food-related environments."
};


const downloadReport = async () => {
  if (!reportRef.current) {
    alert("Report element not found.");
    return;
  }

  try {
    const node = reportRef.current;

    const dataUrl = await domtoimage.toPng(node, {
      bgcolor: "#ffffff",
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 10; // ⭐ LEFT & RIGHT MARGIN (mm)
    const usableWidth = pdfWidth - margin * 2;

    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const imgWidthPx = img.width;
      const imgHeightPx = img.height;

      const scale = usableWidth / imgWidthPx;
      const imgHeightMm = imgHeightPx * scale;

      let heightLeft = imgHeightMm;
      let position = margin;

      // First page
      pdf.addImage(
        dataUrl,
        "PNG",
        margin,
        position,
        usableWidth,
        imgHeightMm
      );

      heightLeft -= pdfHeight;

      // Extra pages
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeightMm + margin;

        pdf.addImage(
          dataUrl,
          "PNG",
          margin,
          position,
          usableWidth,
          imgHeightMm
        );

        heightLeft -= pdfHeight;
      }

      pdf.save("Career_Gen_AI_Report.pdf");
      alert("Report downloaded successfully!");
    };
  } catch (err) {
    console.error("Download error:", err);
    alert("Failed to download report: " + err.message);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-10">
        <div ref={reportRef}><div className="text-center mb-10">
          <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your Career Quiz Results</h1>
          <p className="text-gray-600 text-sm sm:text-base">Here are your top career matches and detailed domain scores.</p>
        </div>
       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {topDomains.map(({domain}) => (
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
            Your responses suggest you have a strong interest in <b>{topDomains[0].domain} </b> 
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
            {topDomains.map((item, i) => (
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
                 <BarChart data={top3ChartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} />
                   <YAxis domain={[0, 100]} />
                   <Tooltip />
                   <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                     {top3ChartData.map((entry, i) => <Cell key={`cell-${i}`} fill="#6366F1" />)}
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
        </div>
      </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-10 flex-nowrap overflow-hidden">
          <button onClick={onRetake} className="bg-indigo-600 hover:bg-indigo-700 text-black font-semibold py-2 px-4 rounded-md">Retake Quiz</button>
          <button onClick={onHome} className="bg-gray-600 hover:bg-gray-700 text-black font-semibold py-2 px-4 rounded-md">Back to Home</button>
          <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200">View My Answers</button>
          <button onClick={() => navigate("/interest-form")} className="bg-green-600 hover:bg-green-700 text-black font-semibold py-2 px-4 rounded-md">Get Assessment</button>
          <button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700 text-black font-semibold py-2 px-4 rounded-md">Download Report</button>
        </div>
      {showModal && (
        <UserAnswerReview
          userId={user._id}
          stage="careerQuiz"
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default QuizResults;