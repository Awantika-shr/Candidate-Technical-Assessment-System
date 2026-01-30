import Router from "express";
import upload from "../config/multer.js";

const uploadRouter = Router();

uploadRouter.post("/upload-resume", upload.single("resume"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ message: "Resume uploaded successfully", file: req.file.filename });
});

export default uploadRouter 