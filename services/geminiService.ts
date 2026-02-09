
import { GoogleGenAI } from "@google/genai";
import { ContextData } from '../types';

export const generateGeminiResponse = async (userText: string, contextData: ContextData): Promise<string> => {
  const systemPrompt = `You are the AI assistant for "Solar Synergy" at UTP. 
      
  Hardware Knowledge (MANDATORY):
  - Lock/Unlock Mechanism: App sends 'U' (Unlock) and 'L' (Lock).
  - Servo Wiring: Signal wire to Pin 9 (Arduino) or Pin 18 (ESP32).
  - LED Indicators: 
      * Red LED (Locked) -> Pin 4.
      * Green LED (Unlocked) -> Pin 5.
  - Bluetooth Advice: Users must use HM-10 (BLE). The older HC-05 will NOT work with browsers. 
  - Bluetooth Wiring: RX to Pin 2, TX to Pin 3 using SoftwareSerial.

  Context:
  - Wallet: RM ${contextData.walletBalance.toFixed(2)}
  - Active Station: ${contextData.selectedStation ? contextData.selectedStation.name : 'None'}
  
  Be very concise (max 2 sentences), encouraging, and use emojis. Guide users to the 'Smart Bridge' in the Profile for code sketches. ⚡️🌱`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userText,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Solar grid offline. Try again later!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection to the AI guide lost. Please check your data connection.";
  }
};
