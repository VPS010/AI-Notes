import Note from '../models/Note.js';

export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createNote = async (req, res) => {
    try {
        const { title, content, images, recordingUrl, favorite, duration } = req.body;

        const note = await Note.create({
            user: req.user.id,
            title,
            content,
            images: images || [],
            recordingUrl,
            duration: duration || "", // Store the duration returned by the uploadAudio endpoint
            favorite: favorite || false
        });

        res.status(201).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create note'
        });
    }
};



export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve note'
        });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { favorite: req.body.favorite },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle favorite status'
        });
    }
};


export const updateNote = async (req, res) => {
    try {
        const { title, content, images, recordingUrl, favorite } = req.body;

        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, content, images: images || [], recordingUrl, favorite },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update note'
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        res.status(200).json({ success: true, data: { id: req.params.id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};