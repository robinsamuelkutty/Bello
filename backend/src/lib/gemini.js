import { GoogleGenerativeAI } from "@google/generative-ai";

// Load the API key from the environment variable
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export const sendGeminiMessage = async (message) => {
  try {
    // Determine the best model available. You can also make this configurable.
    const modelName = "gemini-2.0-flash"; // Or another model that is best for you.

    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(message);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Failed to get response from Gemini");
  }
};