# 爆款结构迁移引擎项目结构与字段规范

本文档用于后续开发直接读取项目模块、数据结构、数据库字段、接口边界和核心业务流程。

项目目标：输入爆款样例视频，拆解其叙事结构、镜头节奏、字幕文案、情绪曲线和转化逻辑；再输入新的主题、产品信息或素材库，生成同结构但原创的新脚本、分镜、素材匹配方案和可编辑视频时间线。

## 1. 项目架构与技术栈定稿

本项目从“爆款结构迁移引擎”重新定位为一个可本地部署的 AI 视频创作系统。核心不是复制样例内容，而是把样例视频中有效的脚本结构、镜头节奏、音乐卡点、字幕文案、剪辑手法和转化逻辑拆成可复用的“结构协议”，再基于新主题、新素材和可配置参数自动拼装出原创视频。

交付目标应同时覆盖三件事：

- 可运行的代码系统：支持上传样例、解析结构、输入新主题并生成新视频方案或成片。
- 优质视频 showcase：最终效果要能体现结构迁移、素材补全和重组能力。
- 知识库沉淀：把有效剪辑技巧、结构模板、原子模块和自定义协议沉淀下来，后续可复用。

### 1.1 最终推荐技术栈

项目优先面向个人/小团队开发，选择“前端工作台 + NestJS 编排 API + 本地/异步视频处理 + Remotion/FFmpeg 渲染”的轻量 monorepo 架构，不在 MVP 阶段拆成复杂微服务。

```text
pnpm workspace monorepo
+ Vite + React + TypeScript
+ Tailwind CSS
+ React Router + TanStack Query + Zustand
+ NestJS + Prisma
+ PostgreSQL
+ Redis + BullMQ
+ Cloudflare R2 / S3-compatible storage
+ FFmpeg / ffprobe
+ Remotion
+ OpenAI / Claude / Gemini API
+ 可选：ComfyUI / Hyperframes / 本地素材生成能力
```

### 1.2 架构定位

- 采用轻量 monorepo，不采用单应用目录。
- 前端和后端独立运行：`apps/web` 是 H5/桌面工作台，`apps/api` 是任务编排和业务 API。
- 共享类型、枚举、Zod Schema、自定义结构协议放在 `packages/shared`。
- AI Prompt 模板和结构迁移提示词放在 `packages/prompts`。
- 视频分析、素材补全和渲染任务在 MVP 阶段先放在 NestJS `jobs` 模块，通过 BullMQ 异步处理。
- Remotion 负责可程序化生成视频片段、字幕动画、MG 动画和动态海报类画面；FFmpeg 负责抽音频、抽帧、转码、拼接和最终封装。
- 只有当 FFmpeg/渲染/视觉分析明显拖慢 API 或需要 Python/GPU 生态时，再把能力拆到 `workers/`。
- 不在 MVP 阶段拆 user-service、video-service、ai-service 等微服务。

### 1.3 核心系统链路

MVP 应优先跑通以下自动化闭环，人工只负责上传样例、输入主题/参数和挑选结果：

```text
上传样例视频
-> FFmpeg 抽音频、抽帧、基础元信息
-> ASR 转字幕
-> 镜头切分、音乐卡点、节奏点识别
-> LLM 抽取结构协议：脚本段落、镜头节奏、字幕样式、转场/卡点/CTA
-> 用户输入新主题、产品信息、目标平台、素材约束
-> LLM 生成新脚本、分镜和素材需求
-> Remotion/素材库/可选 ComfyUI 或 Hyperframes 生成或补齐画面片段
-> FFmpeg/Remotion 拼装新视频
-> 输出成片、时间线数据、结构模板和可复用剪辑知识
```

### 1.4 前端工作台

- Web 框架：Vite + React。
- 语言：TypeScript。
- 样式：Tailwind CSS。
- 路由：React Router。
- 服务端数据状态：TanStack Query，适合轮询分析、生成、渲染任务状态。
- 本地编辑器状态：Zustand，管理脚本编辑器、分镜编辑器、时间线编辑器和参数面板。
- 视频预览：HTMLVideoElement；需要更细编辑体验时接 WebCodecs。
- 音频波形和卡点展示：WaveSurfer.js。
- 时间线交互：dnd-kit 或自研 timeline interaction。
- 工作流页面应围绕“样例解析 -> 结构协议 -> 新主题生成 -> 素材补全 -> 视频重组 -> showcase 导出”组织，而不是普通素材管理后台。

选择原因：

- Vite React 更轻，适合 H5 工作台和本地可部署演示。
- React Router 足够覆盖项目页、样例拆解页、结构协议页、分镜页、素材页、时间线页和 showcase 页。
- TanStack Query 适合处理异步任务轮询和服务端缓存。
- Zustand 适合管理编辑器型复杂本地状态。

### 1.5 后端编排层

- API 服务：NestJS。
- ORM：Prisma。
- 数据库：PostgreSQL。
- 异步任务：Redis + BullMQ。
- 文件存储：Cloudflare R2 或其他 S3-compatible storage；本地开发可先用本地磁盘适配器。
- 视频处理：FFmpeg / ffprobe，后续按需加入 OpenCV、PySceneDetect、PaddleOCR。
- 渲染生成：Remotion 渲染片段或完整视频，FFmpeg 做拼接、混音、转码和封装。
- 向量检索：MVP 后可增加 pgvector，用于素材理解、素材匹配和剪辑知识检索。

选择原因：

- NestJS 模块化清楚，适合承载项目、视频、分析、结构、生成、素材、时间线、渲染等业务模块。
- Prisma 对个人开发效率高，迁移、类型和查询体验顺。
- BullMQ 可以承接视频分析、AI 生成、素材索引、Remotion 渲染、FFmpeg 导出等长任务。
- R2/S3 适合存储样例视频、抽帧、素材、Remotion 中间产物和导出成片。

### 1.6 AI、视频与素材能力

- ASR：OpenAI Whisper API 或本地 whisper.cpp。
- OCR：MVP 可先不做；需要识别硬字幕和画面文字时接 PaddleOCR。
- 镜头切分：FFmpeg scene detection，后续可接 PySceneDetect。
- 音乐卡点：先用 FFmpeg 音频能量/静音/节拍启发式分析，后续再接专业 beat tracking。
- 画面理解：MVP 先抽关键帧交给多模态模型描述。
- 结构识别：LLM 把脚本、镜头、卡点、字幕、转场和 CTA 抽象为结构协议。
- 结构迁移：LLM 基于结构协议和新主题生成原创脚本、分镜和素材需求。
- 素材补全：优先 Remotion 生成 MG 动画、动态海报、字幕动效和图文片段；可选 Hyperframes、ComfyUI 或外部生图/视频工具补充视觉素材。
- 素材匹配：MVP 2 再接 CLIP / 多模态 embedding / pgvector。
- TTS：MVP 3 再接 OpenAI、火山、Azure 或阿里云。

### 1.7 自定义结构协议

系统需要沉淀一个内部结构协议，用于连接“样例解析”和“新视频生成”。协议至少描述：

- `scriptBeats`：hook、problem、conflict、solution、proof、comparison、cta 等脚本段落。
- `shotRhythm`：镜头长度、切点、景别、运动、转场和重复节奏。
- `captionPattern`：字幕位置、字数节奏、强调词、封面标题、CTA 文案。
- `musicCues`：卡点时间、强弱节奏、音效点和画面同步策略。
- `visualAtoms`：可复用画面原子，如商品展示、人物口播、对比图、MG 图形、动态海报。
- `editAtoms`：可复用剪辑手法，如快切、推拉、闪白、缩放、分屏、蒙版、字幕弹出。
- `generationConstraints`：平台、时长、比例、品牌语气、素材限制和原创度约束。

该协议应优先作为 `packages/shared` 中的类型/Zod Schema 设计来源，并作为 prompt 输出格式、数据库 JSON 字段和前端编辑器状态的共同契约。

### 1.8 部署建议

个人开发优先选择本地可运行 + 托管服务组合：

- 本地开发/演示：web、api、PostgreSQL、Redis、FFmpeg、Remotion 在本机或 Docker Compose 中运行。
- 前端部署：Vercel / Cloudflare Pages。
- 后端部署：Railway / Render / Fly.io。
- 数据库：Supabase Postgres / Neon。
- Redis：Upstash Redis。
- 文件存储：Cloudflare R2。

最省心组合：

```text
Vercel 部署 web
+ Railway 部署 api 和队列 worker
+ Supabase Postgres
+ Upstash Redis
+ Cloudflare R2
+ 本地或 worker 环境安装 FFmpeg/Remotion 渲染依赖
```

## 2. 推荐项目目录

个人开发采用轻量 monorepo。仓库中只保留必要分层，先不拆复杂微服务。

```text
ai-video-editor/
  apps/
    web/
      src/
        main.tsx
        app/
        pages/
        components/
        features/
          upload/
          analysis/
          structure/
          generation/
          storyboard/
          assets/
          timeline/
        lib/
          api/
          query/
          routes/
        styles/

    api/
      src/
        main.ts
        app.module.ts
        modules/
          auth/
          projects/
          videos/
          analysis/
          structures/
          generations/
          storyboards/
          assets/
          timelines/
          render-jobs/
          jobs/
          storage/
          ai/
        common/
        config/
        prisma/

  packages/
    shared/
      src/
        types/
        enums/
        schemas/
        index.ts
    prompts/
      analyze-structure.md
      migrate-structure.md
      generate-storyboard.md
      match-assets.md

  workers/
    video-worker/              # 后期从 api jobs 模块拆出
    render-worker/             # 后期从 api jobs 模块拆出

  docs/
    viral-structure-engine-spec.md

  package.json
  pnpm-workspace.yaml
  turbo.json                   # 可选，项目变大后再启用
```

### 2.1 MVP 阶段后端模块

```text
apps/api/src/modules/
  auth/                        # 登录、用户
  projects/                    # 项目管理
  videos/                      # 视频上传、元信息
  analysis/                    # 样例拆解
  structures/                  # 爆款结构
  generations/                 # 结构迁移生成脚本
  storyboards/                 # 分镜
  assets/                      # 用户素材
  timelines/                   # 时间线
  render-jobs/                 # 渲染任务
  jobs/                        # BullMQ 队列和 processor
  storage/                     # R2/S3 封装
  ai/                          # LLM/ASR 调用封装
```

### 2.2 何时拆 Worker

MVP 阶段：

- `analysis`、`generations`、`render-jobs` 都通过 NestJS + BullMQ 处理。
- Worker processor 可以和 API 部署在同一个服务里。

当出现以下情况再拆 `workers/`：

- FFmpeg 任务明显拖慢 API。
- 渲染任务需要独立 CPU/GPU 资源。
- 队列并发和 Web API 扩缩容策略不同。
- 需要 Python 生态处理 OpenCV、PySceneDetect、PaddleOCR。

## 3. 核心模块

### 3.1 样例视频拆解模块

职责：

- 上传并转存样例视频
- 抽取音频
- ASR 语音转文字
- OCR 识别画面字幕
- 镜头切分
- 场景切分
- 关键帧抽取
- 画面主体和动作理解
- 音频节奏分析
- 输出结构化分析结果

### 3.2 爆款结构识别模块

职责：

- 根据字幕、镜头、画面、音频分析叙事结构
- 标注 hook、problem、conflict、solution、proof、comparison、cta 等片段角色
- 抽象文案模式、画面模式、剪辑模式、情绪曲线
- 生成可复用结构模板

### 3.3 结构迁移模块

职责：

- 读取样例结构模板
- 读取用户新主题、产品信息、目标平台、目标人群和品牌语气
- 生成原创脚本、标题、封面文案、字幕和分镜
- 输出多个候选版本
- 给出原创度、相似度和风险评分

### 3.4 素材理解与匹配模块

职责：

- 用户素材上传
- 图片/视频素材抽帧
- 素材标签生成
- embedding 入库
- 根据分镜需求检索匹配素材
- 输出素材与分镜的匹配置信度

### 3.5 时间线编辑与视频重组模块

职责：

- 将分镜、素材、字幕、音频、特效转为 timeline JSON
- 支持前端可视化编辑
- 支持预览
- 支持渲染 Worker 合成 MP4

## 4. 数据库字段

字段命名建议使用 snake_case；API 返回给前端时可统一转换为 camelCase。

### 4.1 users

用户表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 用户 ID |
| email | varchar | 是 | 邮箱 |
| name | varchar | 否 | 用户昵称 |
| avatar_url | text | 否 | 头像 |
| plan | varchar | 是 | free / pro / team / enterprise |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.2 projects

项目表，一个项目代表一次创作工作流。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 项目 ID |
| user_id | uuid | 是 | 创建者 ID |
| name | varchar | 是 | 项目名称 |
| description | text | 否 | 项目描述 |
| target_platform | varchar | 是 | douyin / xiaohongshu / tiktok / bilibili / kuaishou / youtube_shorts |
| target_audience | text | 否 | 目标人群 |
| brand_voice | varchar | 否 | 品牌语气 |
| status | varchar | 是 | draft / analyzing / generating / editing / rendering / completed / failed |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.3 videos

视频文件表，包含样例视频和生成视频。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 视频 ID |
| project_id | uuid | 是 | 所属项目 |
| user_id | uuid | 是 | 所属用户 |
| role | varchar | 是 | sample / asset / generated |
| original_filename | varchar | 否 | 原始文件名 |
| storage_key | text | 是 | 对象存储 key |
| public_url | text | 否 | 访问 URL |
| mime_type | varchar | 是 | 文件类型 |
| file_size | bigint | 是 | 文件大小，单位 byte |
| duration | numeric | 否 | 视频时长，单位秒 |
| width | integer | 否 | 宽度 |
| height | integer | 否 | 高度 |
| fps | numeric | 否 | 帧率 |
| bitrate | integer | 否 | 码率 |
| status | varchar | 是 | uploaded / processing / ready / failed |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.4 video_analysis

样例视频拆解结果表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 分析 ID |
| video_id | uuid | 是 | 视频 ID |
| project_id | uuid | 是 | 项目 ID |
| transcript | jsonb | 否 | ASR 分段文本 |
| ocr_texts | jsonb | 否 | OCR 识别结果 |
| shots | jsonb | 否 | 镜头切分 |
| scenes | jsonb | 否 | 场景切分 |
| keyframes | jsonb | 否 | 关键帧 |
| audio_analysis | jsonb | 否 | 音频节奏和音量分析 |
| visual_summary | jsonb | 否 | 画面理解摘要 |
| analysis_version | varchar | 是 | 分析算法版本 |
| status | varchar | 是 | pending / running / completed / failed |
| error_message | text | 否 | 失败原因 |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.5 viral_structures

爆款结构表，由样例视频分析后生成。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 结构 ID |
| project_id | uuid | 是 | 项目 ID |
| source_video_id | uuid | 是 | 样例视频 ID |
| analysis_id | uuid | 是 | 分析 ID |
| name | varchar | 是 | 结构名称 |
| platform | varchar | 是 | 平台 |
| genre | varchar | 是 | 类型，如 pain_solution_conversion |
| duration | numeric | 是 | 结构总时长 |
| aspect_ratio | varchar | 是 | 9:16 / 16:9 / 1:1 |
| hook_type | varchar | 否 | 钩子类型 |
| rhythm_pattern | varchar | 否 | 节奏模式 |
| emotion_curve | jsonb | 是 | 情绪曲线 |
| beats | jsonb | 是 | 结构片段数组 |
| copy_patterns | jsonb | 否 | 文案模式 |
| visual_patterns | jsonb | 否 | 画面模式 |
| editing_patterns | jsonb | 否 | 剪辑模式 |
| originality_policy | jsonb | 否 | 原创化约束 |
| confidence_score | numeric | 否 | 识别置信度，0-1 |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.6 structure_templates

可复用模板库。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 模板 ID |
| owner_user_id | uuid | 否 | 私有模板归属用户，公共模板可为空 |
| source_structure_id | uuid | 否 | 来源结构 ID |
| name | varchar | 是 | 模板名称 |
| description | text | 否 | 模板说明 |
| category | varchar | 是 | pain_solution / review / listicle / tutorial / story / comparison |
| target_platforms | jsonb | 是 | 适用平台 |
| suitable_industries | jsonb | 否 | 适用品类 |
| recommended_duration | numeric | 否 | 推荐时长 |
| structure | jsonb | 是 | 模板结构 |
| is_public | boolean | 是 | 是否公开 |
| usage_count | integer | 是 | 使用次数 |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.7 generation_inputs

结构迁移输入表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 输入 ID |
| project_id | uuid | 是 | 项目 ID |
| structure_id | uuid | 是 | 使用的结构 ID |
| topic | text | 是 | 新主题 |
| product_name | varchar | 否 | 产品名称 |
| product_description | text | 否 | 产品描述 |
| selling_points | jsonb | 否 | 卖点列表 |
| target_audience | text | 否 | 目标人群 |
| pain_points | jsonb | 否 | 用户痛点 |
| brand_voice | varchar | 否 | 品牌语气 |
| target_platform | varchar | 是 | 目标平台 |
| duration_preference | numeric | 否 | 期望时长 |
| constraints | jsonb | 否 | 额外约束 |
| created_at | timestamptz | 是 | 创建时间 |

### 4.8 generated_scripts

生成脚本表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 脚本 ID |
| project_id | uuid | 是 | 项目 ID |
| generation_input_id | uuid | 是 | 输入 ID |
| structure_id | uuid | 是 | 使用的结构 ID |
| variant_index | integer | 是 | 第几个生成版本 |
| title | varchar | 是 | 视频标题 |
| cover_text | varchar | 否 | 封面文案 |
| summary | text | 否 | 脚本摘要 |
| full_script | text | 是 | 完整口播/字幕脚本 |
| scenes | jsonb | 是 | 分镜数组 |
| subtitles | jsonb | 否 | 字幕数组 |
| cta | text | 否 | 行动引导 |
| estimated_duration | numeric | 否 | 预计时长 |
| similarity_score | numeric | 否 | 与样例的文案相似度，0-1 |
| originality_score | numeric | 否 | 原创度，0-1 |
| quality_score | numeric | 否 | 质量评分，0-1 |
| status | varchar | 是 | draft / selected / archived |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.9 storyboards

分镜表，通常由 selected script 转换而来。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 分镜 ID |
| project_id | uuid | 是 | 项目 ID |
| script_id | uuid | 是 | 脚本 ID |
| title | varchar | 是 | 分镜标题 |
| aspect_ratio | varchar | 是 | 9:16 / 16:9 / 1:1 |
| scenes | jsonb | 是 | 分镜场景 |
| status | varchar | 是 | draft / ready / locked |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.10 assets

用户素材表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 素材 ID |
| project_id | uuid | 是 | 项目 ID |
| user_id | uuid | 是 | 用户 ID |
| type | varchar | 是 | video / image / audio / text / logo |
| original_filename | varchar | 否 | 原始文件名 |
| storage_key | text | 是 | 对象存储 key |
| public_url | text | 否 | 访问 URL |
| mime_type | varchar | 是 | 文件类型 |
| file_size | bigint | 是 | 文件大小 |
| duration | numeric | 否 | 时长 |
| width | integer | 否 | 宽度 |
| height | integer | 否 | 高度 |
| tags | jsonb | 否 | 标签 |
| description | text | 否 | AI 描述 |
| dominant_colors | jsonb | 否 | 主色 |
| transcript | jsonb | 否 | 素材自带语音文本 |
| embedding_id | uuid | 否 | 向量 ID |
| quality_score | numeric | 否 | 素材质量评分 |
| status | varchar | 是 | uploaded / indexing / ready / failed |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.11 asset_embeddings

素材向量表。如果使用 pgvector，可以把 embedding 字段设为 vector 类型。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 向量 ID |
| asset_id | uuid | 是 | 素材 ID |
| project_id | uuid | 是 | 项目 ID |
| modality | varchar | 是 | image / video_frame / audio / text |
| frame_time | numeric | 否 | 视频帧时间点 |
| embedding | vector | 是 | 向量 |
| model | varchar | 是 | 向量模型 |
| created_at | timestamptz | 是 | 创建时间 |

### 4.12 asset_matches

分镜与素材匹配结果。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 匹配 ID |
| project_id | uuid | 是 | 项目 ID |
| storyboard_id | uuid | 是 | 分镜 ID |
| scene_id | varchar | 是 | 分镜片段 ID |
| asset_id | uuid | 是 | 素材 ID |
| match_reason | text | 否 | 匹配原因 |
| confidence_score | numeric | 是 | 置信度，0-1 |
| rank | integer | 是 | 排序 |
| created_at | timestamptz | 是 | 创建时间 |

### 4.13 timelines

可编辑时间线表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 时间线 ID |
| project_id | uuid | 是 | 项目 ID |
| storyboard_id | uuid | 否 | 来源分镜 |
| script_id | uuid | 否 | 来源脚本 |
| name | varchar | 是 | 时间线名称 |
| duration | numeric | 是 | 总时长 |
| aspect_ratio | varchar | 是 | 9:16 / 16:9 / 1:1 |
| fps | numeric | 是 | 帧率 |
| width | integer | 是 | 宽度 |
| height | integer | 是 | 高度 |
| tracks | jsonb | 是 | 轨道数组 |
| settings | jsonb | 否 | 渲染设置 |
| status | varchar | 是 | draft / ready / rendering / rendered / failed |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

### 4.14 render_jobs

视频渲染任务表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | uuid | 是 | 渲染任务 ID |
| project_id | uuid | 是 | 项目 ID |
| timeline_id | uuid | 是 | 时间线 ID |
| user_id | uuid | 是 | 用户 ID |
| status | varchar | 是 | pending / queued / running / completed / failed / canceled |
| progress | integer | 是 | 进度，0-100 |
| output_storage_key | text | 否 | 成片存储 key |
| output_url | text | 否 | 成片 URL |
| output_duration | numeric | 否 | 成片时长 |
| output_file_size | bigint | 否 | 成片大小 |
| error_message | text | 否 | 失败原因 |
| started_at | timestamptz | 否 | 开始时间 |
| completed_at | timestamptz | 否 | 完成时间 |
| created_at | timestamptz | 是 | 创建时间 |
| updated_at | timestamptz | 是 | 更新时间 |

## 5. TypeScript 核心类型

这些类型可以后续拆到 `types/` 或 `packages/shared-types/`。

```ts
export type TargetPlatform =
  | "douyin"
  | "xiaohongshu"
  | "tiktok"
  | "bilibili"
  | "kuaishou"
  | "youtube_shorts";

export type AspectRatio = "9:16" | "16:9" | "1:1";

export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "generating"
  | "editing"
  | "rendering"
  | "completed"
  | "failed";

export type StructureBeatRole =
  | "hook"
  | "problem"
  | "conflict"
  | "solution"
  | "proof"
  | "comparison"
  | "transition"
  | "cta";

export type StructureGenre =
  | "pain_solution_conversion"
  | "before_after_comparison"
  | "product_review"
  | "counterintuitive_education"
  | "story_reversal"
  | "listicle"
  | "challenge_experiment"
  | "persona_story"
  | "tutorial"
  | "emotional_resonance";
```

### 5.1 VideoAnalysis

```ts
export type TranscriptSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
};

export type OcrSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  bbox?: [number, number, number, number];
  confidence?: number;
};

export type ShotSegment = {
  id: string;
  start: number;
  end: number;
  duration: number;
  keyframeUrl?: string;
  shotType?: "close_up" | "medium" | "wide" | "screen_recording" | "product" | "unknown";
  cameraMotion?: "static" | "pan" | "tilt" | "zoom_in" | "zoom_out" | "handheld" | "unknown";
  visualSummary?: string;
};

export type SceneSegment = {
  id: string;
  start: number;
  end: number;
  summary: string;
  location?: string;
  subjects?: string[];
  mood?: string;
};

export type AudioAnalysis = {
  bpm?: number;
  volumePeaks: Array<{
    time: number;
    intensity: number;
  }>;
  musicMood?: string;
  speechRatio?: number;
  silenceSegments?: Array<{
    start: number;
    end: number;
  }>;
};

export type VisualSegment = {
  start: number;
  end: number;
  summary: string;
  subjects: string[];
  actions: string[];
  emotions?: string[];
  onScreenText?: string[];
};

export type VideoAnalysis = {
  id: string;
  videoId: string;
  projectId: string;
  duration: number;
  transcript: TranscriptSegment[];
  ocrTexts: OcrSegment[];
  shots: ShotSegment[];
  scenes: SceneSegment[];
  keyframes: Array<{
    time: number;
    url: string;
    summary?: string;
  }>;
  audioAnalysis: AudioAnalysis;
  visualSummary: VisualSegment[];
  status: "pending" | "running" | "completed" | "failed";
};
```

### 5.2 ViralStructure

```ts
export type EmotionPoint = {
  time: number;
  emotion: "curiosity" | "anxiety" | "surprise" | "trust" | "desire" | "relief" | "urgency";
  intensity: number;
};

export type StructureBeat = {
  id: string;
  start: number;
  end: number;
  duration: number;
  role: StructureBeatRole;
  intent: string;
  hookType?: string;
  copyPattern: string;
  visualPattern: string;
  audioPattern?: string;
  editingPattern?: string;
  pacing?: "fast" | "medium" | "slow";
  requiredAssets?: AssetRequirement[];
  sourceEvidence?: {
    transcriptSegmentIds?: string[];
    shotIds?: string[];
    ocrSegmentIds?: string[];
  };
};

export type AssetRequirement = {
  id: string;
  type: "video" | "image" | "audio" | "text" | "logo";
  description: string;
  tags: string[];
  idealDuration?: number;
  priority: "required" | "recommended" | "optional";
};

export type OriginalityPolicy = {
  doNotCopyPhrases: string[];
  doNotCopyVisuals: string[];
  allowedSimilarity: {
    structure: "low" | "medium" | "high";
    copy: "low" | "medium";
    visual: "low" | "medium";
  };
};

export type ViralStructure = {
  id: string;
  sourceVideoId: string;
  analysisId: string;
  platform: TargetPlatform;
  genre: StructureGenre;
  duration: number;
  aspectRatio: AspectRatio;
  hookType?: string;
  rhythmPattern?: string;
  emotionCurve: EmotionPoint[];
  beats: StructureBeat[];
  copyPatterns?: string[];
  visualPatterns?: string[];
  editingPatterns?: string[];
  originalityPolicy?: OriginalityPolicy;
  confidenceScore?: number;
};
```

### 5.3 GenerationInput 与 GeneratedScript

```ts
export type GenerationInput = {
  id: string;
  projectId: string;
  structureId: string;
  topic: string;
  productName?: string;
  productDescription?: string;
  sellingPoints?: string[];
  targetAudience?: string;
  painPoints?: string[];
  brandVoice?: "professional" | "friendly" | "sharp" | "funny" | "premium" | "authentic";
  targetPlatform: TargetPlatform;
  durationPreference?: number;
  constraints?: {
    bannedWords?: string[];
    mustMention?: string[];
    toneNotes?: string;
    complianceNotes?: string;
  };
};

export type GeneratedScene = {
  id: string;
  beatId: string;
  start: number;
  end: number;
  role: StructureBeatRole;
  voiceover?: string;
  subtitle: string;
  visualDirection: string;
  shotDirection: string;
  editingDirection?: string;
  audioDirection?: string;
  assetRequirements: AssetRequirement[];
};

export type GeneratedScript = {
  id: string;
  projectId: string;
  generationInputId: string;
  structureId: string;
  variantIndex: number;
  title: string;
  coverText?: string;
  summary?: string;
  fullScript: string;
  scenes: GeneratedScene[];
  subtitles?: SubtitleClip[];
  cta?: string;
  estimatedDuration?: number;
  similarityScore?: number;
  originalityScore?: number;
  qualityScore?: number;
  status: "draft" | "selected" | "archived";
};
```

### 5.4 Asset

```ts
export type AssetType = "video" | "image" | "audio" | "text" | "logo";

export type AssetTag = {
  name: string;
  category:
    | "subject"
    | "scene"
    | "emotion"
    | "action"
    | "product"
    | "quality"
    | "format";
  confidence?: number;
};

export type Asset = {
  id: string;
  projectId: string;
  userId: string;
  type: AssetType;
  originalFilename?: string;
  storageKey: string;
  publicUrl?: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  width?: number;
  height?: number;
  tags?: AssetTag[];
  description?: string;
  dominantColors?: string[];
  transcript?: TranscriptSegment[];
  embeddingId?: string;
  qualityScore?: number;
  status: "uploaded" | "indexing" | "ready" | "failed";
};

export type AssetMatch = {
  id: string;
  projectId: string;
  storyboardId: string;
  sceneId: string;
  assetId: string;
  matchReason?: string;
  confidenceScore: number;
  rank: number;
};
```

### 5.5 Storyboard 与 Timeline

```ts
export type StoryboardScene = {
  id: string;
  scriptSceneId: string;
  beatId: string;
  start: number;
  end: number;
  role: StructureBeatRole;
  subtitle: string;
  voiceover?: string;
  visualDirection: string;
  shotDirection: string;
  editingDirection?: string;
  selectedAssetIds?: string[];
  assetMatches?: AssetMatch[];
};

export type Storyboard = {
  id: string;
  projectId: string;
  scriptId: string;
  title: string;
  aspectRatio: AspectRatio;
  scenes: StoryboardScene[];
  status: "draft" | "ready" | "locked";
};

export type SubtitleClip = {
  id: string;
  start: number;
  end: number;
  text: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    position?: "top" | "center" | "bottom";
  };
};

export type TimelineClip = {
  id: string;
  assetId?: string;
  type: "video" | "image" | "audio" | "subtitle" | "text" | "effect";
  start: number;
  end: number;
  sourceStart?: number;
  sourceEnd?: number;
  text?: string;
  transform?: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  };
  effect?: {
    name: string;
    params?: Record<string, unknown>;
  };
};

export type TimelineTrack = {
  id: string;
  type: "video" | "image" | "audio" | "subtitle" | "text" | "effect";
  name: string;
  locked?: boolean;
  muted?: boolean;
  clips: TimelineClip[];
};

export type Timeline = {
  id: string;
  projectId: string;
  storyboardId?: string;
  scriptId?: string;
  name: string;
  duration: number;
  aspectRatio: AspectRatio;
  fps: number;
  width: number;
  height: number;
  tracks: TimelineTrack[];
  settings?: {
    backgroundColor?: string;
    normalizeAudio?: boolean;
    burnSubtitles?: boolean;
    outputFormat?: "mp4" | "mov" | "webm";
  };
  status: "draft" | "ready" | "rendering" | "rendered" | "failed";
};
```

## 6. API 草案

建议 API 以项目为中心组织。

```text
POST   /api/projects
GET    /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId

POST   /api/projects/:projectId/videos/sample
GET    /api/projects/:projectId/videos
GET    /api/videos/:videoId

POST   /api/videos/:videoId/analyze
GET    /api/videos/:videoId/analysis

POST   /api/projects/:projectId/structures
GET    /api/projects/:projectId/structures
GET    /api/structures/:structureId
PATCH  /api/structures/:structureId

POST   /api/projects/:projectId/generations
GET    /api/projects/:projectId/generated-scripts
PATCH  /api/generated-scripts/:scriptId

POST   /api/projects/:projectId/storyboards
GET    /api/storyboards/:storyboardId
PATCH  /api/storyboards/:storyboardId

POST   /api/projects/:projectId/assets
GET    /api/projects/:projectId/assets
POST   /api/assets/:assetId/index

POST   /api/storyboards/:storyboardId/match-assets
GET    /api/storyboards/:storyboardId/asset-matches

POST   /api/projects/:projectId/timelines
GET    /api/timelines/:timelineId
PATCH  /api/timelines/:timelineId

POST   /api/timelines/:timelineId/render
GET    /api/render-jobs/:jobId
POST   /api/render-jobs/:jobId/cancel
```

## 7. 任务队列

### 7.1 analyze_sample_video

输入：

```json
{
  "projectId": "uuid",
  "videoId": "uuid",
  "storageKey": "uploads/sample.mp4"
}
```

输出写入：

- `video_analysis`
- `viral_structures`
- `projects.status = editing`

### 7.2 generate_migrated_script

输入：

```json
{
  "projectId": "uuid",
  "structureId": "uuid",
  "generationInputId": "uuid",
  "variantCount": 3
}
```

输出写入：

- `generated_scripts`

### 7.3 index_asset

输入：

```json
{
  "projectId": "uuid",
  "assetId": "uuid",
  "storageKey": "uploads/assets/demo.mp4"
}
```

输出写入：

- `assets.tags`
- `assets.description`
- `asset_embeddings`

### 7.4 match_assets_to_storyboard

输入：

```json
{
  "projectId": "uuid",
  "storyboardId": "uuid"
}
```

输出写入：

- `asset_matches`
- `storyboards.scenes[].assetMatches`

### 7.5 render_timeline

输入：

```json
{
  "projectId": "uuid",
  "timelineId": "uuid",
  "renderJobId": "uuid"
}
```

输出写入：

- `render_jobs.output_storage_key`
- `render_jobs.output_url`
- `timelines.status = rendered`

## 8. 核心业务流程

### 8.1 样例拆解

```text
用户上传样例视频
  -> 创建 project
  -> 创建 videos(role=sample)
  -> 投递 analyze_sample_video
  -> Worker 执行 ASR/OCR/镜头切分/画面理解
  -> 写入 video_analysis
  -> LLM 生成 viral_structures
  -> 前端展示爆款结构报告
```

### 8.2 结构迁移

```text
用户填写新主题、产品、受众、平台和风格
  -> 写入 generation_inputs
  -> 投递 generate_migrated_script
  -> LLM 基于 ViralStructure 生成 3 个脚本版本
  -> 写入 generated_scripts
  -> 用户选择一个版本
  -> 生成 storyboards
```

### 8.3 素材匹配

```text
用户上传素材
  -> 创建 assets
  -> 投递 index_asset
  -> 素材标签与 embedding 入库
  -> 投递 match_assets_to_storyboard
  -> 生成 asset_matches
  -> 用户确认每个分镜使用的素材
```

### 8.4 时间线与导出

```text
分镜和素材确认
  -> 生成 timelines
  -> 前端时间线编辑
  -> 用户点击导出
  -> 创建 render_jobs
  -> 投递 render_timeline
  -> Worker 使用 FFmpeg/Remotion 合成
  -> 输出 MP4 到对象存储
```

## 9. MVP 范围

### MVP 1

- 项目创建
- 样例视频上传
- ASR
- OCR，可先选做
- 镜头切分
- 爆款结构报告
- 结构迁移生成 3 个脚本版本
- 分镜展示与编辑

暂不做：

- 自动成片
- 复杂时间线
- 模板市场
- 团队协作

### MVP 2

- 素材上传
- 素材标签
- 素材向量检索
- 分镜素材匹配
- 简版 timeline JSON

### MVP 3

- 时间线编辑器
- 字幕轨
- 音频轨
- 视频预览
- FFmpeg 导出

## 10. Prompt 输入输出约束

### 10.1 结构识别 Prompt 输出格式

```json
{
  "platform": "douyin",
  "genre": "pain_solution_conversion",
  "duration": 45,
  "aspectRatio": "9:16",
  "hookType": "pain_point_question",
  "rhythmPattern": "fast_cut_with_text_emphasis",
  "emotionCurve": [
    {
      "time": 0,
      "emotion": "curiosity",
      "intensity": 0.8
    }
  ],
  "beats": [
    {
      "id": "beat_001",
      "start": 0,
      "end": 3,
      "duration": 3,
      "role": "hook",
      "intent": "用强痛点问题吸引目标用户停留",
      "copyPattern": "你是不是也遇到过...",
      "visualPattern": "人物焦虑表情 + 大字标题",
      "editingPattern": "快速推近 + 音效强调",
      "pacing": "fast"
    }
  ],
  "confidenceScore": 0.86
}
```

### 10.2 结构迁移 Prompt 输出格式

```json
{
  "title": "你的视频剪了3小时，播放量还不过500？",
  "coverText": "剪辑慢不是你的问题",
  "summary": "以短视频创作者剪辑低效为痛点，引出 AI 视频编辑工具。",
  "fullScript": "你的视频剪了3小时，播放量还不过500？...",
  "scenes": [
    {
      "id": "scene_001",
      "beatId": "beat_001",
      "start": 0,
      "end": 3,
      "role": "hook",
      "voiceover": "你的视频剪了3小时，播放量还不过500？",
      "subtitle": "剪了3小时，播放量还不过500？",
      "visualDirection": "创作者盯着复杂时间线，表情焦虑",
      "shotDirection": "正面近景，快速推近",
      "editingDirection": "0.5秒内出现大字标题，配合冲击音效",
      "assetRequirements": [
        {
          "id": "asset_req_001",
          "type": "video",
          "description": "人物使用剪辑软件时焦虑的画面",
          "tags": ["creator", "editing", "anxiety", "screen"],
          "idealDuration": 3,
          "priority": "required"
        }
      ]
    }
  ],
  "cta": "上传你的样例视频，直接生成同结构脚本。",
  "estimatedDuration": 45,
  "similarityScore": 0.18,
  "originalityScore": 0.92,
  "qualityScore": 0.84
}
```

## 11. 状态枚举汇总

```ts
export const Status = {
  project: ["draft", "analyzing", "generating", "editing", "rendering", "completed", "failed"],
  video: ["uploaded", "processing", "ready", "failed"],
  analysis: ["pending", "running", "completed", "failed"],
  script: ["draft", "selected", "archived"],
  storyboard: ["draft", "ready", "locked"],
  asset: ["uploaded", "indexing", "ready", "failed"],
  timeline: ["draft", "ready", "rendering", "rendered", "failed"],
  renderJob: ["pending", "queued", "running", "completed", "failed", "canceled"]
} as const;
```

## 12. 模块完成顺序

个人开发建议按下面顺序推进。每个阶段都要形成一个可运行、可验收的小闭环，避免同时铺太多复杂能力。

### 12.1 第 0 阶段：工程基座

目标：让项目可以稳定启动、构建、连接基础服务。

交付物：

- pnpm workspace。
- `apps/web` Vite React 前端。
- `apps/api` NestJS 后端。
- `packages/shared` 共享类型、枚举、Zod Schema。
- Prisma schema。
- `.env.example`。
- README 启动说明。

验收标准：

- `pnpm install` 成功。
- `pnpm dev:web` 能打开前端。
- `pnpm dev:api` 能启动后端。
- `pnpm --filter @ai-editor/web build` 成功。

当前状态：已完成基础骨架。

### 12.2 第 1 阶段：本地基础设施

目标：让后端拥有真实数据库、队列和文件存储配置。

交付物：

- PostgreSQL 连接。
- Redis 连接。
- Prisma Client 生成。
- 基础数据库迁移。
- BullMQ 队列健康检查。
- R2/S3 storage service 基础封装。
- API health endpoint。

建议先做：

- `GET /health`
- `GET /health/db`
- `GET /health/queue`

验收标准：

- 后端启动时能连接数据库。
- 可以创建并查询项目。
- 队列可以投递一个测试 job。
- storage service 可以生成对象访问 URL。

### 12.3 第 2 阶段：项目与样例视频管理

目标：跑通“创建项目 -> 上传样例视频 -> 保存视频记录”。

交付物：

- 项目创建、查询、更新接口。
- 样例视频上传接口。
- 视频元信息保存。
- 前端项目列表页。
- 前端项目详情页。
- 前端样例视频上传组件。

核心接口：

```text
POST  /projects
GET   /projects
GET   /projects/:projectId
PATCH /projects/:projectId

POST  /projects/:projectId/videos/sample
GET   /projects/:projectId/videos
```

验收标准：

- 用户可以在前端创建项目。
- 用户可以上传一个样例视频。
- 数据库中写入 `projects` 和 `videos`。
- 视频文件写入本地临时存储或 R2。

### 12.4 第 3 阶段：视频分析最小链路

目标：从样例视频中提取最基础的可分析信息。

交付物：

- `analyze_sample_video` 队列任务。
- FFmpeg 抽取音频。
- FFmpeg 获取视频时长、分辨率、帧率。
- ASR 转字幕。
- 简单镜头切分。
- `video_analysis` 写入。
- 前端分析进度展示。

核心接口：

```text
POST /videos/:videoId/analyze
GET  /videos/:videoId/analysis
```

验收标准：

- 上传视频后可以发起分析任务。
- 前端能看到任务状态。
- 数据库中能看到 transcript、shots、audioAnalysis。
- 分析失败时有 errorMessage。

### 12.5 第 4 阶段：爆款结构识别

目标：把视频分析结果抽象成可复用的爆款结构。

交付物：

- 结构识别 Prompt。
- LLM 调用封装。
- JSON 输出校验。
- `viral_structures` 写入。
- 前端结构报告页。

核心能力：

- 自动识别 hook、problem、conflict、solution、proof、comparison、cta。
- 输出 beats。
- 输出 emotionCurve。
- 输出 copyPattern、visualPattern、editingPattern。
- 输出 confidenceScore。

验收标准：

- 一个样例视频能生成结构报告。
- 前端可以按时间轴展示每个 beat。
- 结构 JSON 通过 Zod 或自定义校验。
- 不合格 JSON 可以自动重试或进入失败状态。

### 12.6 第 5 阶段：结构迁移与脚本生成

目标：输入新主题，生成同结构但原创的新脚本和分镜草案。

交付物：

- generation input 表单。
- 结构迁移 Prompt。
- 生成 3 个候选脚本。
- `generation_inputs` 写入。
- `generated_scripts` 写入。
- 前端脚本对比与选择界面。

核心接口：

```text
POST /projects/:projectId/generations
GET  /projects/:projectId/generated-scripts
PATCH /generated-scripts/:scriptId
```

验收标准：

- 用户选择一个 `viral_structure` 后，可以输入新主题生成脚本。
- 每个脚本包含 title、coverText、fullScript、scenes、cta。
- 输出 `similarityScore`、`originalityScore`、`qualityScore`。
- 可以选择一个脚本进入分镜阶段。

这是 MVP 的第一个核心价值闭环。

### 12.7 第 6 阶段：分镜编辑器

目标：把生成脚本转成可编辑的分镜工作台。

交付物：

- `storyboards` 创建接口。
- 分镜列表。
- 分镜详情页。
- 分镜片段编辑。
- 字幕、口播、画面指令、镜头指令编辑。
- 分镜状态：draft / ready / locked。

核心接口：

```text
POST  /projects/:projectId/storyboards
GET   /storyboards/:storyboardId
PATCH /storyboards/:storyboardId
```

验收标准：

- 用户可以从选中的脚本生成 storyboard。
- 用户可以编辑每个 scene。
- 用户可以保存修改。
- storyboard 可作为后续素材匹配和时间线生成的输入。

### 12.8 第 7 阶段：素材库与素材索引

目标：让用户上传自己的素材，并让系统理解素材可用于哪些分镜。

交付物：

- 素材上传。
- 素材列表。
- 素材详情。
- 图片/视频基础元数据提取。
- 素材标签生成。
- 可选 embedding 入库。
- `assets` 写入。

核心接口：

```text
POST /projects/:projectId/assets
GET  /projects/:projectId/assets
POST /assets/:assetId/index
```

验收标准：

- 用户可以上传图片、视频、音频、logo。
- 每个素材有 type、duration、width、height、tags、description。
- 素材状态可以从 uploaded 变成 indexing，再变成 ready。

### 12.9 第 8 阶段：分镜素材匹配

目标：根据分镜需求自动推荐素材。

交付物：

- `match_assets_to_storyboard` 队列任务。
- 素材匹配接口。
- `asset_matches` 写入。
- 前端展示每个分镜的候选素材。
- 用户手动确认素材。

核心接口：

```text
POST /storyboards/:storyboardId/match-assets
GET  /storyboards/:storyboardId/asset-matches
```

验收标准：

- 每个分镜至少返回 0 到 5 个素材候选。
- 每个候选包含 matchReason、confidenceScore、rank。
- 用户可以替换系统推荐素材。
- 素材不足时显示缺失素材需求。

### 12.10 第 9 阶段：简版时间线

目标：把分镜、字幕、素材组合成一个可编辑 timeline JSON。

交付物：

- timeline 创建接口。
- 简版时间线页面。
- 视频轨。
- 字幕轨。
- 音频轨占位。
- timeline JSON 保存。

核心接口：

```text
POST  /projects/:projectId/timelines
GET   /timelines/:timelineId
PATCH /timelines/:timelineId
```

验收标准：

- 可以从 storyboard 生成 timeline。
- 每个 scene 对应至少一个视频/图片 clip 和一个 subtitle clip。
- 用户可以调整字幕文本和片段顺序。
- timeline JSON 可以被渲染模块读取。

### 12.11 第 10 阶段：视频导出

目标：把 timeline JSON 合成为可下载的视频。

交付物：

- `render_timeline` 队列任务。
- FFmpeg 合成。
- 字幕烧录。
- 基础音频混合。
- `render_jobs` 状态管理。
- 导出结果上传 R2。
- 前端导出进度和下载入口。

核心接口：

```text
POST /timelines/:timelineId/render
GET  /render-jobs/:jobId
POST /render-jobs/:jobId/cancel
```

验收标准：

- 用户点击导出后创建 render job。
- 前端能看到 pending、running、completed、failed 状态。
- 成功后能预览或下载 MP4。
- 失败时保留 errorMessage。

### 12.12 第 11 阶段：质量、安全与商业化

目标：让产品从“能用”变成“可靠、可收费、可增长”。

交付物：

- 登录和用户权限。
- 额度系统。
- 项目归属校验。
- 原创度检查。
- 敏感词和合规检查。
- 任务失败重试。
- 日志和监控。
- 支付和订阅。

验收标准：

- 用户只能访问自己的项目和素材。
- 生成内容能输出原创度风险。
- 任务失败可追踪、可重试。
- 可以按用户限制使用次数或并发。

### 12.13 推荐里程碑

```text
里程碑 A：工程能稳定启动
第 0 阶段 + 第 1 阶段

里程碑 B：能上传和分析样例
第 2 阶段 + 第 3 阶段

里程碑 C：MVP 核心闭环
第 4 阶段 + 第 5 阶段 + 第 6 阶段

里程碑 D：从脚本走向剪辑方案
第 7 阶段 + 第 8 阶段 + 第 9 阶段

里程碑 E：自动成片
第 10 阶段

里程碑 F：可商业化
第 11 阶段
```

## 13. 合规与原创化要求

- 只能迁移抽象结构，不能复刻样例原文案。
- 不保留样例视频中的独特表达、商标、人物形象或原创镜头设计。
- 生成结果必须输出 `similarityScore` 和 `originalityScore`。
- 当文案相似度过高时，必须自动重写。
- 当用户素材不足以支持某个分镜时，前端应展示缺失素材需求，而不是强行匹配低质量素材。
