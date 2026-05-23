import type { WorkflowNode } from "./workflowTypes";
import { runUserInputNode } from "@/lib/modules/userInputNode";
import { runMemoryRetriever } from "@/lib/modules/memoryRetriever";
import { runStateUpdater } from "@/lib/modules/stateUpdater";
import { runNarrativeBuilder } from "@/lib/modules/narrativeBuilder";
import { runCharacterPerformer } from "@/lib/modules/characterPerformer";
import { runCommitter } from "@/lib/modules/committer";
import { runCharacterOutputNode } from "@/lib/modules/characterOutputNode";

export type NodeRunner = (ctx: Record<string, unknown>) => Promise<Record<string, unknown>>;

export function getNodeRunner(node: WorkflowNode): NodeRunner {
  switch (node.type) {
    case "UserInput": return runUserInputNode;
    case "MemoryRetriever": return runMemoryRetriever;
    case "StateUpdater": return runStateUpdater;
    case "NarrativeBuilder": return runNarrativeBuilder;
    case "CharacterPerformer": return runCharacterPerformer;
    case "Committer": return runCommitter;
    case "CharacterOutput": return runCharacterOutputNode;
    default: throw new Error(`Unknown node type: ${node.type}`);
  }
}
