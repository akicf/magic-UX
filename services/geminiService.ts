import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real production app, ensure strict backend proxying or secure environment handling.
// Here we use the environment variable as per guidelines.
const getClient = () => {
    if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateHolidayWish = async (theme: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Happy Holidays! (Add API Key for AI wishes)";
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a very short, magical, and poetic holiday wish (max 10 words) based on the theme: ${theme}. Do not use quotes.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "May your days be merry and bright!";
  }
};