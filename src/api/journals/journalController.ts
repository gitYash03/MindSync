import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from "../../config/db"
import { journalEmbeddingSchema } from "./validators/journalEmbeddings";
import { journalEntrySchema } from './validators/journalEntry';
import { generateEmbeddings, emotionAnalysisAndGeneratePrompt } from '../../utils/geminiHelpers';
import { z } from "zod";



export const createJournalEntry: RequestHandler = async (req, res, next) => {
    const client = await pool.connect(); 
    try {
        await client.query("BEGIN"); //Begin postgres transaction

        const emotionsAndPrompt = await emotionAnalysisAndGeneratePrompt(req.body.entryText);
        const validatedData = journalEntrySchema.parse({
            userId: req.body.userId,
            entryText:req.body.entryText,
            emotionLabel:emotionsAndPrompt.emotions
    });
        
        const journalInsertquery = "INSERT INTO journal_entries(user_id,entry_text,emotion_labels) VALUES ($1,$2,$3) RETURNING journal_id";
        const journalInsertparams = [
            validatedData.userId,
            validatedData.entryText,
            validatedData.emotionLabel
        ];

        const journalInsertresult = await client.query(journalInsertquery, journalInsertparams);
        const journalId = journalInsertresult.rows[0].journal_id;
        //rows: [ { journal_id: 7 } ],
        await console.log(journalInsertresult);
        const vectorEmbeddings = await generateEmbeddings(validatedData.entryText);
        const formattedVector = `'[${vectorEmbeddings.join(' ')}]'`;
        console.log(formattedVector);

        const validatedEmbedding = journalEmbeddingSchema.parse({
            journalId,
            journalEmbedding: formattedVector
        });

        const embeddingInsertquery = `INSERT INTO journal_embeddings (journal_id, embedding) VALUES ($1, $2)`;
        const embeddingInsertparams = [validatedEmbedding.journalId,validatedEmbedding.journalEmbedding];
        const embeddingInsertResult = client.query(embeddingInsertquery,embeddingInsertparams);
        client.query('COMMIT');

        res.status(200).json({ message: "Success", rows: [journalInsertresult.rows,embeddingInsertResult.rows] });
    } catch (error: any) {
        client.query('ROLLBACK'); //Rollback in case of error
        res.status(500).json({ error: error.errors || error.message});
    } finally {
        client.release();
    }
};

export const getJournalEntries: RequestHandler = async (req, res, next) => {
    try {

        const { userId } = req.params;
        const validatedUserId = z.union([z.string().uuid(), z.string()]).parse(userId);


        const query = `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [validatedUserId]);


        res.status(200).json({ message: "Success", rows: result.rows });
    } catch (error: any) {
        res.status(500).json({ error: error.errors || error.message });
    }
};


// export const createJournalEmbeddings: RequestHandler = async (req,res,next) => {
//     try{
//         const validatedData = journalEmbeddingSchema.parse(req.body);

//     }catch(error: any){

//     }
// };