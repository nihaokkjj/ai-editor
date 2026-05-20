# AI Video Editor

爆款结构迁移引擎：从样例视频拆解到新视频脚本、分镜、素材匹配和时间线重组的 AI 创作平台。

## 技术栈

- Monorepo：pnpm workspace
- Web：Vite + React + TypeScript
- API：NestJS + Prisma
- 数据库：PostgreSQL
- 队列：Redis + BullMQ
- 存储：Cloudflare R2 / S3-compatible storage
- 视频处理：FFmpeg / ffprobe
- 视频生成：Remotion，后续可选 Hyperframes / ComfyUI 做素材补全
- AI：ASR + LLM + 多模态模型

## 目录

```text
apps/
  web/                 # Vite React 前端工作台
  api/                 # NestJS API、Prisma、任务编排

packages/
  shared/              # 前后端共享类型、枚举、Zod Schema
  prompts/             # AI Prompt 模板

workers/
  video-worker/        # 后续拆出视频分析 Worker
  render-worker/       # 后续拆出渲染 Worker

docs/
  viral-structure-engine-spec.md
```

## 当前功能

现在项目处于“基础架构骨架”阶段，已经具备：

- `apps/web`：React 工作台首页、路由、TanStack Query、API client、基础页面布局。
- `apps/api`：NestJS 应用入口、模块分层、项目 `projects` 基础接口、PrismaService、BullMQ 配置入口、存储和 AI 服务占位。
- `packages/shared`：前后端共享枚举、核心业务类型、项目和时间线 Zod Schema。
- `packages/prompts`：结构识别、结构迁移、分镜生成、素材匹配的 Prompt 模板。
- `apps/api/prisma/schema.prisma`：项目、视频、分析、爆款结构、脚本、分镜、素材、时间线、渲染任务等核心数据模型。

还没有实现：

- 真实用户登录
- 视频上传到 R2
- FFmpeg 抽音频和镜头切分
- ASR 调用
- LLM 结构拆解和脚本迁移
- 时间线编辑器和视频导出

## 产品站位

当前版本不是普通成片生成器，而是“爆款结构迁移引擎”的 MVP 基座。系统目标是学习样例视频的创作方法，而不是复制内容：把脚本结构、镜头节奏、音乐卡点、字幕文案、剪辑手法和转化逻辑沉淀为可复用的自定义结构协议，再用新主题和新素材生成原创视频方案或成片。

第一阶段目标是跑通：

```text
创建项目
-> 上传样例视频
-> 提取字幕、镜头结构和音乐卡点
-> 生成结构协议与爆款结构报告
-> 输入新主题、产品信息和素材约束
-> 生成原创脚本、分镜和素材需求
-> 通过 Remotion/FFmpeg 拼装 showcase 或导出成片
```

等这个闭环成立后，再扩展素材匹配、时间线编辑和自动成片。

## 模块完成顺序

建议按以下顺序开发：

```text
0. 工程基座
1. 本地基础设施
2. 项目与样例视频管理
3. 视频分析最小链路
4. 爆款结构识别
5. 结构迁移与脚本生成
6. 分镜编辑器
7. 素材库与素材索引
8. 分镜素材匹配
9. 简版时间线
10. 视频导出
11. 质量、安全与商业化
```

详细交付物和验收标准见 [docs/viral-structure-engine-spec.md](docs/viral-structure-engine-spec.md) 的“模块完成顺序”。

## 本地开发

安装依赖：

```bash
pnpm install
```

准备环境变量：

```bash
cp .env.example .env
```

生成 Prisma Client：

```bash
pnpm db:generate
```

启动前后端：

```bash
pnpm dev
```

单独启动：

```bash
pnpm dev:web
pnpm dev:api
```

详细架构和字段说明见 [docs/viral-structure-engine-spec.md](docs/viral-structure-engine-spec.md)。
