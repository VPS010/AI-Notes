// routes/uploadRoutes.js
import express from 'express';
import { uploadImage, uploadAudio } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(protect); // Apply authentication middleware

router.post('/image', upload.single('image'), uploadImage);
router.post('/audio', upload.single('audio'), uploadAudio);
export default router;