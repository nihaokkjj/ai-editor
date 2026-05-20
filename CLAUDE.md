# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AI Video Editor is a pnpm workspace monorepo for a “viral structure migration engine”: ingest a sample viral video, extract its script structure, shot rhythm, caption pattern, music cues, editing techniques, and conversion logic into a reusable structure protocol, then use a new topic/material constraints to generate an original script, storyboard, asset plan, and rendered showcase/video.

The repo is currently an MVP infrastructure skeleton. The intended first workflow is:

```text
create project -> upload sample video -> extract captions/shots/music cues -> generate structure protocol/report -> enter new topic/material constraints -> generate original script/storyboard/asset requirements -> assemble showcase via Remotion/FFmpeg
```

Detailed product/module specs live in `docs/viral-structure-engine-spec.md`.

## Commands

Use pnpm 9.15.4 from the repository root.

```bash
pnpm install                 # install workspace dependencies
cp .env.example .env         # create local env file
pnpm db:generate             # generate Prisma client for apps/api
pnpm db:migrate              # run Prisma dev migration
pnpm dev                     # run all workspace dev servers in parallel
pnpm dev:web                 # run Vite web app on port 3000
pnpm dev:api                 # run Nest API in watch mode, default port 4000
pnpm build                   # build all workspaces
pnpm lint                    # lint/type-lint all workspaces
pnpm typecheck               # typecheck all workspaces
pnpm format                  # prettier --write .
```

Package-scoped commands:

```bash
pnpm --filter @ai-editor/web build
pnpm --filter @ai-editor/web lint
pnpm --filter @ai-editor/web typecheck
pnpm --filter @ai-editor/api build
pnpm --filter @ai-editor/api lint
pnpm --filter @ai-editor/api typecheck
pnpm --filter @ai-editor/api prisma:studio
pnpm --filter @ai-editor/shared build
```

There is currently no test runner configured in the root, web, api, shared, or prompts package scripts. Do not invent test commands; add a test setup first if tests are required.

## Architecture

### Workspace layout

- `apps/web`: Vite + React + TypeScript frontend workspace.
- `apps/api`: NestJS API, Prisma schema/client integration, module skeletons, and future job orchestration.
- `packages/shared`: Common enums, business types, Zod schemas, and the custom structure protocol exported through `@ai-editor/shared` for frontend, backend, prompts, and editor state.
- `packages/prompts`: Markdown prompt templates for structure analysis, structure migration, storyboard generation, and asset matching.
- `workers/video-worker` and `workers/render-worker`: Placeholders for later extraction; MVP jobs should stay in the API `jobs` module until FFmpeg/Remotion/render workloads need independent CPU/GPU/Python scaling.
- `docs/viral-structure-engine-spec.md`: Source of truth for target product flow, module responsibilities, database shape, and delivery order.

### Frontend

`apps/web` is a lightweight Vite React app, not Next.js. It uses:

- React Router for pages/routes (`apps/web/src/app/App.tsx`).
- TanStack Query provider at app bootstrap (`apps/web/src/main.tsx`).
- Axios API client in `apps/web/src/lib/api/client.ts`, using `VITE_API_BASE_URL` or `http://localhost:4000`.
- Tailwind CSS via Vite/Tailwind packages.
- `@ai-editor/shared` enums/types directly in UI code.

The current UI is a skeleton workspace page showing the MVP workflow and default project settings.

### Backend

`apps/api` is a NestJS app. `apps/api/src/app.module.ts` wires global config from `.env.local` and `.env`, Prisma, and domain modules:

- `auth`, `projects`, `videos`, `analysis`, `structures`, `generations`, `storyboards`, `assets`, `timelines`, `render-jobs`, `jobs`, `storage`, `ai`.

`apps/api/src/main.ts` enables CORS for `WEB_ORIGIN` (default `http://localhost:3000`) and a global `ValidationPipe` with whitelist and transform enabled.

Most modules are placeholders. The implemented project slice is:

- `projects.controller.ts`: `GET /projects`, `GET /projects/:projectId`, `POST /projects`.
- `projects.dto.ts`: class-validator DTO using shared `TargetPlatform`.
- `projects.service.ts`: Prisma-backed list/find/create with `ProjectStatus.Draft`.

`PrismaService` extends `PrismaClient` and connects/disconnects on Nest module lifecycle.

### Data model

`apps/api/prisma/schema.prisma` targets PostgreSQL and models the full planned workflow:

- users, projects, source videos and analyses
- viral structures and reusable structure templates
- generation inputs and generated scripts
- storyboards, assets, embeddings, asset matches
- timelines and render jobs

Many fields are JSON because AI/video analysis payloads are still evolving. Shared TypeScript/Zod shapes in `packages/shared` should be kept aligned with API DTOs and Prisma semantics when those contracts become user-facing.

### Storage, jobs, and AI

- `StorageService` currently only derives public URLs from `S3_PUBLIC_BASE_URL`; full S3/R2 upload handling is not implemented yet.
- `AiService` is a placeholder returning `not_implemented` for viral structure analysis.
- MVP video analysis/rendering should live in `apps/api/src/modules/jobs` first, using BullMQ to orchestrate FFmpeg/ffprobe, ASR/LLM calls, Remotion rendering, and final FFmpeg assembly.
- Prefer Remotion for programmable MG animation, dynamic posters, subtitle animations, and generated video fragments; use FFmpeg for extraction, transcoding, concatenation, mixing, and final packaging.
- The structure protocol is the central contract between sample analysis and new video generation. Keep `packages/shared` schemas, prompt output formats, Prisma JSON payload semantics, and frontend editor state aligned around it.

## Important repository guidance

The existing `AGENTS.md` warns that this is not the familiar Next.js API surface and says to read `node_modules/next/dist/docs/` before writing Next.js code. This repository currently uses Vite React for the web app and does not contain a Next.js app; do not introduce Next.js assumptions into `apps/web`.
