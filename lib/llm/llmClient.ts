import { callDeepSeek, type DeepSeekMessage, type DeepSeekResponse } from "./deepseekClient";
import { createMockResponse, createMockJsonResponse, getMockJsonForSchema } from "./mockLLM";
import { repairJson } from "@/lib/utils/jsonRepair";

export interface GenerateTextParams { systemPrompt: string; userPrompt: string; temperature?: number; maxTokens?: number; }
export interface GenerateJsonParams { systemPrompt: string; userPrompt: string; temperature?: number; maxTokens?: number; schemaHint?: string; }
export interface LLMResult { content: string; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; }; }
export interface LLMJsonResult<T = unknown> { data: T; rawContent: string; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; }; }

function shouldUseMock(): boolean { return process.env.USE_MOCK_LLM === "true"; }

async function makeRequest(systemPrompt: string, userPrompt: string, temperature: number, maxTokens: number, responseFormat?: "json_object" | "text", schemaHint?: string): Promise<DeepSeekResponse> {
  if (shouldUseMock()) {
    if (responseFormat === "json_object") {
      const mockData = getMockJsonForSchema(schemaHint);
      return createMockJsonResponse(mockData);
    }
    return createMockResponse("[MOCK] This is a mock narrative context for testing.");
  }

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return callDeepSeek({ messages, temperature, max_tokens: maxTokens });
}

export async function generateText(params: GenerateTextParams): Promise<LLMResult> {
  const temperature = params.temperature ?? 0.7;
  const maxTokens = params.maxTokens ?? 2048;
  const response = await makeRequest(params.systemPrompt, params.userPrompt, temperature, maxTokens, undefined);
  return { content: response.choices[0].message.content, usage: response.usage };
}

export async function generateJson<T = unknown>(params: GenerateJsonParams): Promise<LLMJsonResult<T>> {
  const temperature = params.temperature ?? 0.3;
  const maxTokens = params.maxTokens ?? 4096;
  const response = await makeRequest(params.systemPrompt, params.userPrompt, temperature, maxTokens, "json_object", params.schemaHint);
  const rawContent = response.choices[0].message.content;
  const parseResult = repairJson<T>(rawContent);
  if (!parseResult.success) throw new Error(`Failed to parse JSON from LLM response: ${parseResult.error}`);
  return { data: parseResult.data as T, rawContent, usage: response.usage };
}
