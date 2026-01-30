import express from "express";
import cors from "cors";
import uploadRouter from "./routes/upload.js";

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/upload', uploadRouter)

app.listen(5000, () => {
    console.log("Server running on port 5000");
})  