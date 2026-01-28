import { GoogleGenAI } from "@google/genai";
import { ContextData } from '../types';

export const generateGeminiResponse = async (userText: string, contextData: ContextData): Promise<string> => {
  const systemPrompt = `You are the AI assistant for "Solar Synergy", a micromobility charging app at Universiti Teknologi PETRONAS (UTP). 
      
  Context Data:
  - User Wallet Balance: RM ${contextData.walletBalance.toFixed(2)}
  - Current Station: ${contextData.selectedStation ? contextData.selectedStation.name : 'None selected'}
  - Stations Available: Village 3c (Active), Village 4 (Occupied).
  - Pricing: Normal charging is FREE (Solar powered). Fast charging is RM 1.20/kWh.
  
  Your goal is to be helpful, concise, and encourage eco-friendly habits.
  If asked about location, use the context provided.
  If asked about costs, explain the difference between Eco (Free) and Turbo (Paid).
  Keep responses short (under 3 sentences) and friendly. Use emojis occasionally.`;

  try {
    // Initializing inside the function ensures it picks up the environment variable injected by Vercel
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userText,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I'm having trouble connecting to the solar grid right now. Try again later!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a graceful error message instead of crashing the UI
    return "Sorry, I couldn't reach the AI service. Please check your connection and try again.";
  }
};