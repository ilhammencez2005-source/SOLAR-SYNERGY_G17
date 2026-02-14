
import { GoogleGenAI } from "@google/genai";
import { ContextData } from '../types';

export const generateGeminiResponse = async (userText: string, contextData: ContextData): Promise<string> => {
  const systemPrompt = `You are the AI technical lead for "Solar Synergy" at UTP Group 17.
      
  HARDWARE TROUBLESHOOTING (IR SENSOR VERSION):
  - AUTO-LOCK NOT WORKING? Check if the IR Sensor (D3) is getting 5V from Vin. If the red LED on the IR module isn't flashing when you put your hand in front of it, check the wiring.
  - SENSITIVITY: There is a small screw (potentiometer) on the IR module. Turn it to adjust the detection range.
  - SERVO ISSUES: Ensure the servo is on D4. It will lock automatically when the IR detects an object.
  - LCD REMOVAL: Remind the user that the LCD has been removed from this version to focus on IR security.

  Project Context:
  - User Wallet: RM ${contextData.walletBalance.toFixed(2)}
  - Active Station: ${contextData.selectedStation ? contextData.selectedStation.name : 'None'}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userText,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I'm having trouble connecting to the cloud. Check your hardware jumpers!";
  } catch (error) {
    return "The assistant is busy recalibrating. Check your breadboard for loose connections! 🔌";
  }
};
