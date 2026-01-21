import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router as apiRoutes } from "./routes/index.js";

import { env } from "./utils/env.js";

export const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    env.CLIENT_URL,
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiRoutes);
