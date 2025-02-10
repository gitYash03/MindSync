import dotenv from "dotenv";
const envResult = dotenv.config({ path: "../config/.env" });
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const generateEmbeddings = async (text: string): Promise<number[]> => {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values; // Extracts the embedding array
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw new Error("Failed to generate embedding");
    }
};

export const emotionAnalysisAndGeneratePrompt = async(entryText: string): Promise<{ emotions: string[]; geminiPrompt: string }> => {
    const validEmotions = [
        "admiration", "amusement", "anger", "annoyance", "approval", "caring",
        "confusion", "curiosity", "desire", "disappointment", "disapproval", "disgust",
        "embarrassment", "excitement", "fear", "gratitude", "grief", "joy",
        "love", "nervousness", "optimism", "pride", "realization", "relief",
        "remorse", "sadness", "surprise","neutral"
      ];
      
      var prompt = `
      Given below is a journal entry. Identify and classify the top 5 emotions strictly from this predefined list of 28 emotions in the GoEmotions dataset: 
      ${validEmotions.join(", ")}.
      
      🚨 **IMPORTANT**:
        - You MUST return emotions **only** from this list.
        - If an emotion doesn't match exactly, use the closest valid emotion from \`emotionMap\` (e.g., uncertainty -> confusion).
        - If completely uncertain, default to **"neutral"**.
      
      Return the output in the following JSON format without any additional text or explanations:
      
      \`\`\`json
      {
        "emotions": [
          [emotion1, percentage1], 
          [emotion2, percentage2], 
          [emotion3, percentage3], 
          [emotion4, percentage4], 
          [emotion5, percentage5]
        ],
        "prompt": "A short question to help the user explore their emotions further, tailored to the detected emotions."
      }
      \`\`\`
      
        - Emotions are **only** from the provided \`validEmotions\` list.
        - The 'prompt' is insightful and relevant to the identified emotions.
        - Do not include any extra text, explanations, or conversational elements.
      `;
      
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        prompt += entryText;
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        const jsonString = await getJsonString(responseText);
        
        if(jsonString === "error"){
            throw new Error("Failed to extract JSON from response.");
        }
        
        const parsedData = JSON.parse(jsonString);
        const emotions = parsedData.emotions.map(([emotion]: [string, number]) => emotion);
        const geminiPrompt = parsedData.prompt;

        return {emotions,geminiPrompt};
    } catch (error) {
        console.error("Error in emotion analysis:", error);
        return { 
            emotions: [], 
            geminiPrompt: "Could not generate a prompt due to an error." 
        };
    }

};

const getJsonString = async(responseText : string) : Promise<string> => {
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
      return jsonString;
    }else{
        console.error("No JSON object found in the response text.");
        console.error("Response Text:", responseText);
        return "error";
    }
};