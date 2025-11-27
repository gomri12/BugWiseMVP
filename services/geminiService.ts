
import { GoogleGenAI } from "@google/genai";
import { BugCluster } from '../types';

export const generateRootCauseAnalysis = async (
  bugTitle: string, 
  signals: any[]
): Promise<string> => {
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
  
  // Fallback if no key is present for the PoC
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`AI Analysis (Simulated): Based on the correlation between ${signals.length} data points, this bug appears to be a regression caused by a mismatch between the API contract in the Service Layer and the recent client-side update.`);
      }, 1500);
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a prompt based on the signals
    const prompt = `
      You are an expert DevOps and Software Engineer AI. 
      Analyze the following "Bug Signals" from disparate tools (Jira, Sentry, Datadog, GitHub) to determine the root cause of a recurring issue.
      
      Bug Title: ${bugTitle}
      
      Signals Correlation Data:
      ${JSON.stringify(signals, null, 2)}
      
      Instructions:
      1. Identify the correlation between the code changes (GitHub) and the errors (Sentry/Datadog).
      2. Explain why this might be happening despite previous "fixes" (Jira).
      3. Provide a concise 2-3 sentence technical summary suitable for a Senior Engineer.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis inconclusive.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI analysis at this time. Please check your API key.";
  }
};
