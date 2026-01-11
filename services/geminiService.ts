import { GoogleGenAI, Type } from "@google/genai";
import { Video } from "../types";

export const getSmartSuggestions = async (video: Video) => {
  try {
    // Always initialize a new GoogleGenAI instance inside the function to use the most current API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this video metadata and provide additional descriptive tags and a better category. 
      Title: ${video.title}
      Current Tags: ${video.tags.join(', ')}
      Current Category: ${video.category}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            refinedCategory: { type: Type.STRING },
            aiDescription: { type: Type.STRING }
          },
          required: ["suggestedTags", "refinedCategory", "aiDescription"]
        }
      }
    });

    // Extract text from the GenerateContentResponse object's text property
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
};