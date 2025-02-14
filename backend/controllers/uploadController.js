import axios from 'axios'
import FormData from 'form-data';
import * as Bytescale from "@bytescale/sdk";
import nodeFetch from "node-fetch";
import fs from "fs";


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

export const uploadAudio = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No audio file" });
        //Upload to Bytescale
        const uploadManager = new Bytescale.UploadManager({
            fetchApi: nodeFetch,
            apiKey: process.env.BYTESCALE_API_KEY,
        });

        const result = await uploadManager.upload({
            data: fs.createReadStream(req.file.path),
            size: fs.statSync(req.file.path).size,
            mime: req.file.mimetype,
            originalFileName: req.file.originalname
        });

        //Cleanup
        fs.unlinkSync(req.file.path);

        res.json({
            url: result.fileUrl,
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Audio processing failed" });
    }
};