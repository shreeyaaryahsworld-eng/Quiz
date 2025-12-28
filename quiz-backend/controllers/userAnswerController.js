const mongoose = require("mongoose");
const UserQuizAnswers = require("../models/UserQuizAnswers");

// POST /api/user-answers - Save answers on quiz submit
const saveAnswers = async (req, res) => {
  try {
    const { userId, userName, stage, questions } = req.body;

    if (!userId || !userName || !stage || !questions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newAnswers = new UserQuizAnswers({
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      stage,
      questions,
    });

    await newAnswers.save();

    res.status(201).json({ message: "Answers saved successfully" });
  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/user-answers/:userId/:stage - Get answers by userId and stage
const getAnswers = async (req, res) => {
  try {
    const { userId, stage } = req.params;

    if (!userId || !stage) {
      return res.status(400).json({ message: "Missing userId or stage" });
    }

    const answers = await UserQuizAnswers.findOne({ userId: new mongoose.Types.ObjectId(userId), stage }).sort({ createdAt: -1 });

    if (!answers) {
      return res.status(404).json({ message: "Answers not found" });
    }

    res.status(200).json({ data: answers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  saveAnswers,
  getAnswers,
};