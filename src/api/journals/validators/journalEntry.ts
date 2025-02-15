import {z} from "zod";

//List of valid emotions recieved from gemini sentimental analysis
const validEmotions = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring",
    "confusion", "curiosity", "desire", "disappointment", "disapproval",
    "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
    "joy", "love", "nervousness", "optimism", "pride", "realization",
    "relief", "remorse", "sadness", "surprise", "neutral"
  ] as const;

export const journalEntrySchema = z.object({
    userId:z.string().uuid(), //valid string uuid - for now temp number change to z.string().uuid() later
    entryText:z.string().min(30,"Entry must have at least 30 characters."), //valid string entry
    emotionLabel:z.array(z.enum(validEmotions)),//emotion is a valid array with validEmotions as allowed tuples of string
    createdAt:z.string().datetime().default(new Date().toISOString()), //valid datetime
  });

