import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language, apiKey, model: modelName } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Use provided key, env var, or hardcoded default
    const key = apiKey || process.env.GEMINI_API_KEY || "AIzaSyDl0YiPR2qE7EfUXXa-Vgzst7Mt4ht-N30";

    if (!key) {
      return NextResponse.json(
        { error: "API Key is required" },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(key);
    // Use selected model or default to gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

    const prompt = `
You are an expert developer. Please add detailed comments to the following ${language || "code"} snippet.
Rules:
1. Add JSDoc/DocString for functions and classes.
2. Add inline comments for complex logic.
3. Do not change the code logic.
4. Return ONLY the commented code, no markdown formatting or explanation.

Code:
${code}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/^```[\w]*\n/, "").replace(/\n```$/, "");

    return NextResponse.json({ result: cleanText });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate comments" },
      { status: 500 }
    );
  }
}
