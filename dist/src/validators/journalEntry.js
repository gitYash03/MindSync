"use strict";
//List of valid emotions recieved from gemini sentimental analysis
const validEmotions = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring",
    "confusion", "curiosity", "desire", "disappointment", "disapproval",
    "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
    "joy", "love", "nervousness", "optimism", "pride", "realization",
    "relief", "remorse", "sadness", "surprise", "neutral"
];
const journalEntrySchema = z.object({
    userId: z.string().uuid(), //valid string uuid
    entryText: z.string().min(30, "Entry must have at least 30 characters."), //valid string entry
    emotionLabel: z.array(z.enum(validEmotions)), //emotion is a valid array with validEmotions as allowed tuples of string
    createdAt: z.string().datetime(), //valid datetime
});
module.exports = { journalEmbeddingSchema };
