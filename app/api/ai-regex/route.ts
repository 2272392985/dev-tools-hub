import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getApiConfigs } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { requirement, apiKey, model: modelName } = await req.json();

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement is required" },
        { status: 400 }
      );
    }

    let key = apiKey ? apiKey.trim() : "";

    if (!key) {
      const configs = await getApiConfigs();
      const geminiConfig = configs.find(c => c.service === 'gemini' && c.isActive);
      if (geminiConfig && geminiConfig.apiKey) {
        key = geminiConfig.apiKey.trim();
      }
    }

    if (!key) {
      key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    }

    if (!key) {
      return NextResponse.json(
        { error: "API Key is required. Please configure it in Admin Panel." },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-2.5-flash" });

    const prompt = `
You are an expert developer. Create a regular expression for the following requirement:
"${requirement}"

Rules:
1. Return ONLY the regex pattern.
2. Do not wrap in forward slashes unless requested.
3. Do not include markdown formatting (no \`\`\`).
4. Do not include explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/^```[\w]*\n/, "").replace(/\n```$/, "").trim();

    return NextResponse.json({ result: cleanText });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate regex" },
      { status: 500 }
    );
  }
}
