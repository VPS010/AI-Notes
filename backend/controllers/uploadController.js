import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Image upload to ImgBB
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        return res.json({ url: response.data.data.url });
    } catch (error) {
        // If the error comes from axios, error.response might have status info
        const statusCode = error.response?.status || 500;
        return res.status(statusCode).json({ message: error.message });
    }
};

// Audio upload to Bytescale
export const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        const response = await axios.post(
            'https://api.bytescale.com/v1/upload',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${process.env.BYTESCALE_API_KEY}`
                }
            }
        );

        return res.json({ url: response.data.fileUrl });
    } catch (error) {
        const statusCode = error.response?.status || 500;
        return res.status(statusCode).json({ message: error.message });
    }
};
