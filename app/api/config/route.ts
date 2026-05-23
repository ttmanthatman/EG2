import { NextResponse } from "next/server";
import { readApiConfig } from "@/lib/llm/readApiConfig";

export async function GET() {
  try {
    const config = readApiConfig();
    return NextResponse.json({
      configured: true,
      model: config.modelName,
      mock: process.env.USE_MOCK_LLM === "true",
    });
  } catch (err) {
    return NextResponse.json({
      configured: false,
      model: null,
      mock: process.env.USE_MOCK_LLM === "true",
      error: err instanceof Error ? err.message : "Unknown config error",
    });
  }
}
