import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from "../../config/db"
import { journalEmbeddingSchema } from "./validators/journalEmbeddings";
import { journalEntrySchema } from './validators/journalEntry';
import { z } from "zod";


export const createJournalEntry: RequestHandler = async (req, res, next) => {
    try {
        const validatedData = journalEntrySchema.parse(req.body);
        
        const query = "INSERT INTO journal_entries(user_id,entry_text,emotion_labels) VALUES ($1,$2,$3)";
        const params = [
            validatedData.userId,
            validatedData.entryText,
            validatedData.emotionLabel
        ];

        const result = await pool.query(query, params);
        res.status(200).json({ message: "Success", rows: result.rows });
    } catch (error: any) {
        res.status(500).json({ error: error.errors || error.message });
    }
};

export const getJournalEntries: RequestHandler = async (req, res, next) => {
    try {
        // Fix Zod validation for userId param
        const { userId } = req.params;
        const validatedUserId = z.string().uuid().parse(userId);

        const query = `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [validatedUserId]);

        res.status(200).json({ message: "Success", rows: result.rows });
    } catch (error: any) {
        res.status(500).json({ error: error.errors || error.message });
    }
};