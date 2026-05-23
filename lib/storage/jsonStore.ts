import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "lib", "storage", "data");

function getFilePath(filename: string): string { return path.join(DATA_DIR, filename); }
function readJsonFile<T = unknown>(filename: string): T {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}
function writeJsonFile(filename: string, data: unknown): void { fs.writeFileSync(getFilePath(filename), JSON.stringify(data, null, 2), "utf-8"); }

export async function loadCharacterProfile(_characterId: string): Promise<unknown> { return readJsonFile("characterProfile.json"); }
export async function loadMemoryStore(_characterId: string): Promise<unknown> { return readJsonFile("memoryStore.json"); }
export async function saveMemoryStore(_characterId: string, memories: unknown[]): Promise<void> { writeJsonFile("memoryStore.json", memories); }
export async function loadCurrentState(_characterId: string): Promise<unknown> { return readJsonFile("currentState.json"); }
export async function saveCurrentState(_characterId: string, state: unknown): Promise<void> { writeJsonFile("currentState.json", state); }

export function buildCharacterProfileSummary(profile: unknown): string {
  const p = profile as Record<string, unknown>;
  if (!p || Object.keys(p).length === 0) return "角色设定暂时不可用。";
  const parts: string[] = [];
  const name = p.name || "未知角色";
  const identity = p.identity as Record<string, unknown> | undefined;
  if (identity) parts.push(`${name}，${identity.age || ""}岁${identity.gender || ""}，${identity.occupation || ""}。${identity.social_position || ""}。${identity.cultural_background || ""}。`);
  const personality = p.personality as Record<string, unknown> | undefined;
  if (personality) {
    const traits = personality.stable_traits as string[] | undefined;
    if (traits && traits.length > 0) parts.push(`${name}是一个${traits.join("、")}的人。`);
    if (personality.temperament) parts.push(String(personality.temperament));
  }
  const speech = p.speech_style as Record<string, unknown> | undefined;
  if (speech) parts.push(`说话方式：${[speech.tone, speech.vocabulary, speech.directness, speech.emotional_disclosure_level].filter(Boolean).join("；")}。`);
  const faith = p.faith_worldview as Record<string, unknown> | undefined;
  if (faith) parts.push(`信仰背景：${faith.tradition || ""}。${faith.maturity || ""}。`);
  const selfNarr = p.self_narrative as Record<string, unknown> | undefined;
  if (selfNarr?.core_story) parts.push(`关于自己的核心故事：${selfNarr.core_story}`);
  const fears = p.fears as string[] | undefined;
  if (fears && fears.length > 0) parts.push(`害怕的事情：${fears.join("；")}。`);
  const desires = p.desires as string[] | undefined;
  if (desires && desires.length > 0) parts.push(`内心渴望：${desires.join("；")}。`);
  return parts.join("\n\n");
}
