# Knowledge Studio Refactor Implementation Plan

> **For Hermes:** The next implementation phase should rebuild the app around a real Read → Think → Create workflow, not add more generator sections.

**Goal:** Turn Knowledge Studio into a research-to-content workspace with Inbox, Reader, Counterview, Projects, Library, and Studio.

**Architecture:** Frontend-only for now, but structured around InputItem, ReadingAnalysis, Project, Draft, and Template objects. AI tasks should be contextual and project-aware.

**Tech Stack:** Vite, ES Modules, Vitest, localStorage, OpenAI-compatible API.

---

## Phase 1 — App shell
- Build workspace navigation:
  - Dashboard
  - Inbox
  - Reader
  - Projects
  - Library
  - Studio

## Phase 2 — Domain objects
- Add models for:
  - InputItem
  - ReadingAnalysis
  - Project
  - Draft
  - Template / Rebuttal Framework

## Phase 3 — Reader first
- Support:
  - Summary
  - Core claims
  - Alternative angles
  - Rebuttals
  - Counter-rebuttals
  - Open questions
  - Create project from article

## Phase 4 — Project system
- Add:
  - Brief
  - Sources
  - Draft versions
  - Save to library

## Phase 5 — AI task system
- Split provider calls into task-based APIs:
  - summary
  - counterview analysis
  - project brief
  - draft generation
  - rewrite

## Phase 6 — Verify and publish
- Run tests
- Rebuild Pages
- Verify live UI matches new product structure
