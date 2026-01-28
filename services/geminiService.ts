import { GoogleGenAI } from "@google/genai";
import { ContextData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userText,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I'm having trouble connecting to the solar grid right now. Try again later!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't reach the AI service. Please try again.";
  }
};