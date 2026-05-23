import https from "node:https";
import { readApiConfig } from "./readApiConfig";

const DEEPSEEK_HOST = "api.deepseek.com";
const CHAT_COMPLETIONS_PATH = "/chat/completions";

if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
  console.warn("[DeepSeek] ⚠️  NODE_TLS_REJECT_UNAUTHORIZED=0 — TLS certificate verification is DISABLED.");
}

export interface DeepSeekMessage { role: "system" | "user" | "assistant"; content: string; }

export interface DeepSeekRequest {
  messages: DeepSeekMessage[]; temperature?: number; max_tokens?: number; stream?: false;
}

export interface DeepSeekResponse {
  id: string;
  choices: { index: number; message: { role: string; content: string; }; finish_reason: string; }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; };
}

export async function callDeepSeek(request: DeepSeekRequest): Promise<DeepSeekResponse> {
  const { apiKey, modelName } = readApiConfig();

  const body = JSON.stringify({
    model: modelName, messages: request.messages,
    temperature: request.temperature ?? 0.7, max_tokens: request.max_tokens ?? 2048,
    stream: false, thinking: { type: "disabled" },
  });

  console.log(`[DeepSeek] Calling https://${DEEPSEEK_HOST}${CHAT_COMPLETIONS_PATH} with model ${modelName}...`);
  const responseText = await makeHttpsRequest(body, apiKey);

  let data: DeepSeekResponse;
  try { data = JSON.parse(responseText); }
  catch { throw new Error(`DeepSeek returned non-JSON response: ${responseText.substring(0, 500)}`); }

  if (!data.choices || data.choices.length === 0) {
    throw new Error("DeepSeek API returned no choices in response.");
  }

  console.log(`[DeepSeek] Success. Tokens: ${data.usage?.total_tokens || "?"}`);
  return data;
}

function makeHttpsRequest(body: string, apiKey: string, timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: DEEPSEEK_HOST, path: CHAT_COMPLETIONS_PATH, method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "Content-Length": Buffer.byteLength(body) },
      timeout: timeoutMs,
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        const responseText = Buffer.concat(chunks).toString("utf-8");
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`DeepSeek API error (${res.statusCode}): ${responseText.substring(0, 300)}`));
          return;
        }
        resolve(responseText);
      });
    });

    req.on("error", (err: Error) => {
      const msg = err.message;
      if (msg.includes("ENOTFOUND")) reject(new Error(`Cannot resolve ${DEEPSEEK_HOST}.`));
      else if (msg.includes("ECONNREFUSED")) reject(new Error(`Connection refused by ${DEEPSEEK_HOST}.`));
      else if (msg.includes("ETIMEDOUT") || msg.includes("timeout")) reject(new Error(`Connection to ${DEEPSEEK_HOST} timed out.`));
      else if (msg.includes("CERT") || msg.includes("TLS") || msg.includes("SSL")) reject(new Error(`TLS error: ${msg}`));
      else reject(new Error(`Failed to connect to ${DEEPSEEK_HOST}: ${msg}`));
    });

    req.on("timeout", () => { req.destroy(); reject(new Error(`Request to ${DEEPSEEK_HOST} timed out.`)); });
    req.write(body); req.end();
  });
}
