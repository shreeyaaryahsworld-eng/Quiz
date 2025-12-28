const express = require("express");
const { saveAnswers, getAnswers } = require("../controllers/userAnswerController");

const router = express.Router();

// POST /api/user-answers - Save answers
router.post("/", saveAnswers);

// GET /api/user-answers/:userId/:stage - Get answers
router.get("/:userId/:stage", getAnswers);

module.exports = router;