const ProgressReport = require("../models/ProgressReport");


const mongoose = require("mongoose");

exports.getProgressReport = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const report = await ProgressReport.findOne({ userId });
    res.status(200).json({ success: true, data: report || {} });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// 2. SAVE PARTIAL PROGRESS (Run on "Next" Button)
exports.saveQuizProgress = async (req, res) => {
  try {
    const { userId, stage, currentQuestionIndex, domainCounts, totalQuestions, categoryName } = req.body;

 if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Calculate percentage (e.g. 5/20 = 25%)
    const percentage = Math.round(((currentQuestionIndex) / totalQuestions) * 100);

    const updateOps = {
      $set: {
        [`stageProgress.${stage}`]: {
          currentQuestionIndex,
          domainCounts,
          totalQuestions,
          lastUpdated: new Date()
        },
        // Update Sidebar Progress immediately
        [`categories.${categoryName}`]: percentage
      }
    };

    await ProgressReport.findOneAndUpdate(
      { userId }, 
      updateOps, 
      { new: true, upsert: true } // Create if doesn't exist
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save Progress Error:", error);
    res.status(500).json({ success: false, message: "Error saving progress" });
  }
};

exports.saveResult = async (req, res) => {
  try {
    const { userId, stage, resultData, categoryName } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    if (!resultData?.domainCounts) {
      return res.status(400).json({ success: false, message: "Invalid result data" });
    }
// Count how many questions exist per domain
const domainQuestionCount = {};
careerQuizQuestions.forEach(q => {
  domainQuestionCount[q.domain] =
    (domainQuestionCount[q.domain] || 0) + 1;
});

// Calculate percentage per domain
const allScores = Object.entries(domainCounts).map(
  ([domain, count]) => ({
    domain,
    count,
    percentage: Math.min(100, Math.round((count / totalQuestions) * 100 * 2))
  })
);



    // 2️⃣ Sort high → low
    allScores.sort((a, b) => b.count - a.count);

    // 3️⃣ Top 3 domains
    const topPaths = allScores.slice(0, 3);

    // 4️⃣ Personality logic (simple & explainable)
    let personalityType = "Broad Explorer";
    if (topPaths[0]?.percentage >= 40) {
      personalityType = "Strongly Inclined";
    } else if (topPaths[0]?.percentage >= 30) {
      personalityType = "Moderately Inclined";
    }

    const enrichedResult = {
      domainCounts,
      totalQuestions,
      allScores,
      topPaths,
      personalityType,
      completedAt: new Date()
    };

    // 5️⃣ Save + clear progress
    await ProgressReport.findOneAndUpdate(
      { userId },
      {
        $set: {
          [`stageResults.${stage}`]: enrichedResult,
          [`categories.${categoryName}`]: 100
        },
        $unset: {
          [`stageProgress.${stage}`]: ""
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      result: enrichedResult
    });
  } catch (error) {
    console.error("Save Result Error:", error);
    res.status(500).json({ success: false, message: "Failed to save result" });
  }
};


// 4. RESET PROGRESS (Run on Retake)
exports.resetStageProgress = async (req, res) => {
  try {
    const { userId, stage, categoryName } = req.body;
 if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const updateOps = {
      $unset: {
        [`stageResults.${stage}`]: "",   // Remove Final Result
        [`stageProgress.${stage}`]: ""   // Remove Partial Data
      },
      $set: {
        [`categories.${categoryName}`]: 0 // Reset Sidebar to 0%
      }
    };

    await ProgressReport.findOneAndUpdate({ userId }, updateOps, { new: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Reset Error:", error);
    res.status(500).json({ success: false });
  }
};

// 5. GET ACTIVITY LOGS
