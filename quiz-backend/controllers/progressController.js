const ProgressReport = require("../models/ProgressReport");


// 1. GET PROGRESS REPORT
exports.getProgressReport = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const report = await ProgressReport.findOne({ userId });
    
    // It is okay to return null if no report exists yet
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

// 3. SAVE FINAL RESULT (Run on Quiz Finish)
exports.saveResult = async (req, res) => {
  try {
    const { userId, stage, resultData, categoryName } = req.body;

    const updateOps = {
      $set: {
        [`stageResults.${stage}`]: resultData, // Store Final Result
        [`categories.${categoryName}`]: 100    // Force 100% completion
      },
      // Clear the partial progress since they are done
      $unset: {
        [`stageProgress.${stage}`]: "" 
      }
    };

    await ProgressReport.findOneAndUpdate({ userId }, updateOps, { new: true, upsert: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save Result Error:", error);
    res.status(500).json({ success: false });
  }
};

// 4. RESET PROGRESS (Run on Retake)
exports.resetStageProgress = async (req, res) => {
  try {
    const { userId, stage, categoryName } = req.body;

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
