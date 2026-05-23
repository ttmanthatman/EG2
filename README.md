# Virtual Character Studio

A node-based workflow system for psychologically continuous virtual characters, inspired by ComfyUI.

## Project Goal

Virtual Character Studio is not a chatbot. It is a character simulation engine that models long-term identity, memory, emotion, body state, inner psychological activity, faith/value tensions, relationship dynamics, and final natural action/dialogue — with strict separation between structured state and narrative performance.

## Architecture

```
User Input → Memory Retriever → State Updater → Narrative Builder → Character Performer → Committer → Character Output
```

## Quick Start

```bash
npm install
# Create api.txt: line 1 = DeepSeek API key, line 2 = model name
npm run dev
```

## Tech Stack

Next.js 15 · TypeScript · React 19 · Tailwind CSS 4 · @xyflow/react · Zustand · DeepSeek API · Vitest