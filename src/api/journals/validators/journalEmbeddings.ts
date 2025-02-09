import {z} from "zod";

export const journalEmbeddingSchema = z.object({
    journalId:z.number().int().positive(), //positive primary key generated
    journalEmbedding:z.array(z.number()).length(3024), //array of 3024 floating point embeddings genedated by gemini's text-embedding-004 model
});