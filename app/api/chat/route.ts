import { NextRequest, NextResponse } from "next/server";
import { runWorkflowTurn } from "@/lib/workflow/workflowRunner";
import { readApiConfig } from "@/lib/llm/readApiConfig";
import { safeRedact } from "@/lib/utils/safeRedact";

export async function POST(request: NextRequest) {
  try {
    let modelName = "unknown";
    try {
      const config = readApiConfig();
      modelName = config.modelName;
    } catch (configErr) {
      return NextResponse.json(
        { error: configErr instanceof Error ? configErr.message : "LLM configuration error." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const character_id = body.character_id || "character_001";
    const session_id = body.session_id || "default";
    const user_message = String(body.user_message || "").trim();

    if (!user_message) {
      return NextResponse.json({ error: "user_message is required." }, { status: 400 });
    }

    console.log(`[api/chat] Starting workflow for "${user_message.substring(0, 50)}…"`);
    const startTime = Date.now();

    const output = await runWorkflowTurn({ character_id, session_id, user_message });

    console.log(`[api/chat] Workflow complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    const safeOutput = JSON.parse(safeRedact(JSON.stringify(output)));
    return NextResponse.json({ ...safeOutput, model: modelName });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    const safeError = safeRedact(errorMessage);
    console.error("[api/chat] Error:", safeError);
    return NextResponse.json({ error: safeError }, { status: 500 });
  }
}
