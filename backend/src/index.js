import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017";
const DB_NAME = process.env.DB_NAME || "togethergo";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);

if (CORS_ORIGINS.length > 0) {
  app.use(
    cors({
      origin: CORS_ORIGINS,
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

app.use(express.json());

// Simple health check for Docker/local testing
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "togethergo-backend" });
});

async function start() {
  try {
    const uri = `${MONGO_URL}/${DB_NAME}`;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB at", uri);

    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start backend:", err);
    process.exit(1);
  }
}

start();

