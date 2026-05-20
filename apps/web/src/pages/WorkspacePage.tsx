import { useMemo } from "react";
import { ProjectStatus, TargetPlatform } from "@ai-editor/shared";

const workflow = [
  { title: "样例上传", description: "上传爆款样例视频，建立拆解任务。" },
  { title: "结构拆解", description: "抽取字幕、镜头、节奏与叙事片段。" },
  { title: "结构迁移", description: "输入新主题，生成原创脚本和分镜。" },
  { title: "素材匹配", description: "把用户素材匹配到每个分镜需求。" },
  { title: "时间线导出", description: "生成可编辑时间线，后续合成成片。" },
];

export function WorkspacePage() {
  const defaults = useMemo(
    () => ({
      platform: TargetPlatform.Douyin,
      status: ProjectStatus.Draft,
    }),
    [],
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-[#dedbd2] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#706b60]">MVP 工作流</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">从样例拆解到视频重组</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5b52]">
            当前骨架已按轻量 monorepo 组织。下一步可以从项目创建、视频上传、ASR 和结构识别开始实现。
          </p>
        </div>
        <button className="h-10 rounded-md bg-[#20201e] px-4 text-sm font-semibold text-white hover:bg-[#34332f]">
          新建项目
        </button>
      </header>

      <section className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-5">
        {workflow.map((item, index) => (
          <article key={item.title} className="rounded-md border border-[#dedbd2] bg-white p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e8efe6] text-sm font-semibold">
              {index + 1}
            </div>
            <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#625e56]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-[#dedbd2] bg-white p-5">
          <h3 className="text-lg font-semibold">当前默认项目配置</h3>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[#767166]">目标平台</dt>
              <dd className="mt-1 font-medium">{defaults.platform}</dd>
            </div>
            <div>
              <dt className="text-[#767166]">项目状态</dt>
              <dd className="mt-1 font-medium">{defaults.status}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-md border border-[#dedbd2] bg-white p-5">
          <h3 className="text-lg font-semibold">后端连接</h3>
          <p className="mt-3 text-sm leading-6 text-[#625e56]">
            API 基础地址由 <code>VITE_API_BASE_URL</code> 控制，默认指向本地 NestJS 服务。
          </p>
        </div>
      </section>
    </div>
  );
}
