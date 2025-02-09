import express from "express";
import dotenv from "dotenv";
dotenv.config({path:"src/config/.env"});
import journalRoutes from "./src/api/journals/journalRoutes";


const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/journals", journalRoutes);

export default app;
