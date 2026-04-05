---
name: brainstorm
description: Guided ideation for features, architecture, and technology decisions
---

# Brainstorm

Structured ideation session. Converge on a plan through focused questions, not open-ended chat.

## Step 1: Understand the Goal

Use AskUserQuestion:
- "What are you building?" (free text via Other)
- "What type of session?" Options:
  - New feature design
  - Architecture exploration
  - Technology evaluation
  - Problem solving

## Step 2: Requirements

Based on type, ask targeted follow-ups with AskUserQuestion:

**New Feature:** Who uses this? Must-have vs nice-to-have? Performance/scale constraints? Integration points?

**Architecture:** Target scale? Failure tolerance? Build vs buy? Latency requirements?

**Technology:** Problem with current stack? Migration cost? Team familiarity?

## Step 3: Explore Options

Spawn 3 parallel Agents using the Agent tool, each taking a different approach:

**Agent 1 — Conservative:** "Propose the simplest, lowest-risk approach to: {requirements}. Use proven patterns only. Under 500 words: approach, pros, cons, effort."

**Agent 2 — Balanced:** "Propose a modern best-practices approach to: {requirements}. Balance capability with complexity. Under 500 words."

**Agent 3 — Ambitious:** "Propose a cutting-edge approach to: {requirements}. Maximize capability, accept more complexity. Under 500 words."

## Step 4: Present and Decide

Show all 3 options using AskUserQuestion with preview fields so user can compare side by side. Let user pick one or combine elements.

## Step 5: Output

Create `.studio/brainstorm/` directory and write:
- `requirements.md` — structured requirements with priorities
- `architecture-sketch.md` — chosen approach with rationale
- `open-questions.md` — unresolved items

Then suggest next step: "Ready to plan implementation? I recommend `/sprint-plan`."
