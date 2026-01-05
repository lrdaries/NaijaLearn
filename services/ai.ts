
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Fix: Moved the GoogleGenAI initialization into function scopes to ensure the most current process.env.API_KEY is used per request.

export const getCareerAdvice = async (goal: string, currentSkill: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the professional career coach for OyaSkill, Nigeria's leading job-ready skills platform. 
      A student says: "${goal}". Their current skill level is: "${currentSkill}".
      Provide a concise 3-step action plan for them to succeed in the Nigerian digital economy. 
      Include 1 specific tech track they should learn (e.g., UI/UX, Backend, etc.).
      Use an encouraging, professional "Naija" tone (e.g., using "Oya," "No dulling"). Keep it under 120 words.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Oshey! My connection is a bit shaky, but no dulling. Pick a track below and let's go!";
  }
};

export const startOyaChat = async (message: string, isSubscribed: boolean) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = isSubscribed 
      ? `You are the OyaSkill Tech Mentor (PRO MODE). You are a senior software engineer and product designer from Lagos, Nigeria. 
         Your goal is to provide deep technical help, teach concepts step-by-step, debug code, and give professional career guidance.
         
         Guidelines:
         - Tone: Encouraging, professional, and culturally relevant (Naija tech slang).
         - Expertise: Provide full code examples, detailed architectural advice, and deep learning support.
         - Context: This user is a PAID member. They deserve your best technical secrets.`
      : `You are the OyaSkill Assistant (PREVIEW MODE). You are helpful and friendly but you are LIMITED.
         
         Rules:
         - Do NOT provide full code solutions or deep step-by-step technical teaching.
         - If a user asks for code or "How do I build X?", give a very high-level overview (max 2 sentences) and then politely explain that deep technical mentoring and code reviews are reserved for OyaSkill Pro members.
         - Encourage them to subscribe for ₦10,000/month or check their school portal to unlock your full "Mentor Mode".
         - Use a catchy Naija tone: "Oya, to get the full gist and the code for this, you need to join OyaSkill Pro!"
         - Keep answers short and nudge towards subscription.`;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat AI Error:", error);
    return "Eya! I'm having small network issues. Abeg, try again in a bit!";
  }
};
