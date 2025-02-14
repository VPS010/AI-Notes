import express from 'express';
import {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    toggleFavorite
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .get(getNoteById)
    .patch(updateNote)
    .delete(deleteNote);

router.route('/:id/favorite').patch(toggleFavorite);

export default router;