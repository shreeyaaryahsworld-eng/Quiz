const express = require('express');
const router = express.Router();
const { 
  saveResult, // Changed from saveStageResult to match controller
  getProgressReport, 
  saveQuizProgress, 
  resetStageProgress 
} = require('../controllers/progressController');

// POST: Save Final Result (with Activity Log)
router.post('/save-result', saveResult);

// POST: Save Partial Progress (No log needed for every click)
router.post("/save-quiz-progress", saveQuizProgress);

// POST: Reset Progress (Retake)
router.post("/reset-progress", resetStageProgress);

// GET: Fetch Data
router.get('/get-progress/:userId', getProgressReport);

module.exports = router;