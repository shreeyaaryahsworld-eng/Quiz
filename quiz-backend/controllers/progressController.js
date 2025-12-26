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
    const { userId, stage, currentQuestionIndex, answers, totalQuestions, categoryName } = req.body;
 if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Calculate percentage (e.g. 5/20 = 25%)
    const percentage = Math.round(((currentQuestionIndex) / totalQuestions) * 100);

    const updateOps = {
      $set: {
        [`stageProgress.${stage}`]: {
          currentQuestionIndex,
          answers,
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

    const { answers } = resultData; // [{ domain, isCorrect }, ...]

    // 1. Total score
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const maxScore = answers.length;
    const overallPercent = maxScore > 0 ? Math.round((totalCorrect / maxScore) * 100) : 0;

    // 2. Per-domain scores
    const domainTotals = {};
    const domainCorrect = {};

    for (const { domain, isCorrect } of answers) {
      if (!domainTotals[domain]) {
        domainTotals[domain] = 0;
        domainCorrect[domain] = 0;
      }
      domainTotals[domain] += 1;
      if (isCorrect) domainCorrect[domain] += 1;
    }

    const allScores = Object.entries(domainTotals).map(([domain, total]) => {
      const correct = domainCorrect[domain] || 0;
      const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
      return [domain, percent];
    });

    // sort high → low
    allScores.sort((a, b) => b[1] - a[1]);
    const topPaths = allScores.slice(0, 3);

    // 3. Simple personalityType placeholder
    const personalityType = "Explorer"; // or derive from pattern later

    const enrichedResult = {
      answers,
      totalCorrect,
      maxScore,
      overallPercent,
      allScores,
      topPaths,
      personalityType
    };

    const updateOps = {
      $set: {
        [`stageResults.${stage}`]: enrichedResult,
        [`categories.${categoryName}`]: 100
      },
      $unset: { [`stageProgress.${stage}`]: "" }
    };

    const updated = await ProgressReport.findOneAndUpdate(
      { userId },
      updateOps,
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, result: enrichedResult, data: updated });
  } catch (error) {
    console.error("Save Result Error:", error);
    res.status(500).json({ success: false });
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
