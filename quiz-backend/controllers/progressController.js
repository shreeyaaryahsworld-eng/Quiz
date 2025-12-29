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

    const { domainCounts, totalQuestions } = resultData;

    // Calculate percentage per domain
    const allScores = Object.entries(domainCounts).map(
      ([domain, count]) => ({
        domain,
        count,
        percentage: Math.round((count / totalQuestions) * 100),
      })
    );

    // Sort high → low
    allScores.sort((a, b) => b.count - a.count);

    // Top 3 domains
    const topPaths = allScores.slice(0, 3);

    // Recalculate percentages based on top 3 total
    const topTotal = topPaths.reduce((sum, item) => sum + item.count, 0);
    topPaths.forEach(item => {
      item.percentage = Math.round((item.count / topTotal) * 100);
    });

    // Personality logic (simple & explainable)
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

    // Save + clear progress
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
