const mongoose = require("mongoose");

const userQuizAnswersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    required: true,
  },
  questions: [{
    questionText: {
      type: String,
      required: true,
    },
    selectedOptionText: {
      type: String,
      required: false,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserQuizAnswers", userQuizAnswersSchema);