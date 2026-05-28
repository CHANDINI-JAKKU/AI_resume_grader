import express from 'express'
import multer from 'multer'
import {
  uploadResume,
  analyzeResume,
  getHistory,
  getResumeDetail,
  addJobAnalysis,
  getLeaderboard,
} from '../controllers/resumeController.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Dynamic endpoints for frontend API (REST structure)
router.get('/leaderboard', getLeaderboard)
router.get('/:id', getResumeDetail)
router.post('/:id/analyses', addJobAnalysis)

// Root mapping (REST standard)
router.post('/', upload.single('resume'), uploadResume)
router.get('/', getHistory)

// Backward compatible endpoints
router.post('/upload-resume', upload.single('resume'), uploadResume)
router.post('/analyze', analyzeResume)
router.get('/history', getHistory)

export default router
