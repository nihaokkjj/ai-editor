import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { TargetPlatform } from "@ai-editor/shared";
import {
  createProject,
  getAnalysis,
  startVideoAnalysis,
  type AnalysisResult,
  type AnalysisStatus,
} from "../lib/api/analysis";

type ApiErrorBody = {
  message?: string | string[];
};

const terminalStatuses: AnalysisStatus[] = ["completed", "failed"];

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    const message = body?.message;

    if (Array.isArray(message)) {
      return message.join("；");
    }

    if (message) {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请检查后端服务是否运行。";
}

function formatNumber(value: number | undefined, digits = 2) {
  if (typeof value !== "number") {
    return "-";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export function WorkspacePage() {
  const [projectName, setProjectName] = useState("视频拆解测试");
  const [targetPlatform, setTargetPlatform] = useState<string>(TargetPlatform.Douyin);
  const [localPath, setLocalPath] = useState("sample.mp4");
  const [originalFilename, setOriginalFilename] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const analysisQuery = useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: () => getAnalysis(analysisId!),
    enabled: Boolean(analysisId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && terminalStatuses.includes(status) ? false : 2000;
    },
  });

  const createAndStartMutation = useMutation({
    mutationFn: async () => {
      const project = await createProject({
        name: projectName,
        targetPlatform,
      });

      return startVideoAnalysis({
        projectId: project.id,
        localPath,
        originalFilename: originalFilename || undefined,
        mimeType: "video/mp4",
        role: "source",
      });
    },
    onSuccess: (result) => {
      setAnalysisId(result.analysisId);
    },
  });

  const analysis = analysisQuery.data;
  const errorMessage = useMemo(() => {
    if (createAndStartMutation.error) {
      return getErrorMessage(createAndStartMutation.error);
    }

    if (analysisQuery.error) {
      return getErrorMessage(analysisQuery.error);
    }

    return analysis?.errorMessage ?? null;
  }, [analysis?.errorMessage, analysisQuery.error, createAndStartMutation.error]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysisId(null);
    createAndStartMutation.mutate();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <header className="border-b border-[#dedbd2] pb-6">
        <p className="text-sm font-medium text-[#706b60]">视频结构拆解 MVP</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">发起样例视频分析</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5b52]">
          当前版本使用后端服务器本地路径，不是浏览器文件上传。视频必须位于后端 <code>VIDEO_INPUT_ROOT</code> 目录下，表单里填写相对路径，例如 <code>sample.mp4</code>。
        </p>
      </header>

      <section className="grid gap-5 py-8 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-md border border-[#dedbd2] bg-white p-5">
          <h3 className="text-lg font-semibold">创建项目并开始分析</h3>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-[#3d3a35]">
              项目名称
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-[#d6d2c8] px-3 text-sm outline-none focus:border-[#20201e]"
                maxLength={80}
                required
              />
            </label>

            <label className="block text-sm font-medium text-[#3d3a35]">
              目标平台
              <select
                value={targetPlatform}
                onChange={(event) => setTargetPlatform(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-[#d6d2c8] bg-white px-3 text-sm outline-none focus:border-[#20201e]"
              >
                <option value={TargetPlatform.Douyin}>抖音 Douyin</option>
                <option value={TargetPlatform.Kuaishou}>快手 Kuaishou</option>
                <option value={TargetPlatform.Xiaohongshu}>小红书 Xiaohongshu</option>
                <option value={TargetPlatform.Bilibili}>Bilibili</option>
                <option value={TargetPlatform.Tiktok}>TikTok</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-[#3d3a35]">
              本地路径 localPath
              <input
                value={localPath}
                onChange={(event) => setLocalPath(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-[#d6d2c8] px-3 text-sm outline-none focus:border-[#20201e]"
                placeholder="sample.mp4"
                maxLength={1000}
                required
              />
              <span className="mt-2 block text-xs leading-5 text-[#706b60]">
                请填写相对 <code>VIDEO_INPUT_ROOT</code> 的路径，不要填写绝对路径。
              </span>
            </label>

            <label className="block text-sm font-medium text-[#3d3a35]">
              原始文件名（可选）
              <input
                value={originalFilename}
                onChange={(event) => setOriginalFilename(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-[#d6d2c8] px-3 text-sm outline-none focus:border-[#20201e]"
                placeholder="sample.mp4"
                maxLength={255}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={createAndStartMutation.isPending || !projectName || !localPath}
            className="mt-6 h-10 rounded-md bg-[#20201e] px-4 text-sm font-semibold text-white hover:bg-[#34332f] disabled:cursor-not-allowed disabled:bg-[#a9a59b]"
          >
            {createAndStartMutation.isPending ? "正在提交..." : "开始视频拆解"}
          </button>

          {analysisId ? <p className="mt-4 text-sm text-[#5f5b52]">analysisId：{analysisId}</p> : null}
          {errorMessage ? <p className="mt-4 rounded-md bg-[#fff1f1] p-3 text-sm text-[#a33a3a]">{errorMessage}</p> : null}
        </form>

        <AnalysisStatusPanel analysis={analysis} isLoading={analysisQuery.isFetching} />
      </section>

      <AnalysisResults analysis={analysis} />
    </div>
  );
}

function AnalysisStatusPanel({ analysis, isLoading }: { analysis?: AnalysisResult; isLoading: boolean }) {
  const progress = analysis?.progress ?? 0;

  return (
    <section className="rounded-md border border-[#dedbd2] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">分析状态</h3>
          <p className="mt-2 text-sm text-[#625e56]">提交后会自动轮询后端任务状态。</p>
        </div>
        <span className="rounded-full bg-[#e8efe6] px-3 py-1 text-xs font-semibold text-[#2f5b35]">
          {analysis?.status ?? "未开始"}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-[#625e56]">
          <span>进度</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#ece9e2]">
          <div className="h-2 rounded-full bg-[#20201e]" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[#767166]">队列状态</dt>
          <dd className="mt-1 font-medium">{analysis?.queueState ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-[#767166]">轮询</dt>
          <dd className="mt-1 font-medium">{isLoading ? "刷新中" : "空闲"}</dd>
        </div>
      </dl>
    </section>
  );
}

function AnalysisResults({ analysis }: { analysis?: AnalysisResult }) {
  if (!analysis) {
    return (
      <section className="rounded-md border border-dashed border-[#c9c4b8] p-6 text-sm text-[#625e56]">
        发起分析后，这里会展示视频摘要、镜头列表和字幕时间线。
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-8">
      <div className="rounded-md border border-[#dedbd2] bg-white p-5">
        <h3 className="text-lg font-semibold">结构摘要</h3>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem label="时长" value={`${formatNumber(analysis.visualSummary?.duration)}s`} />
          <SummaryItem label="尺寸" value={`${formatNumber(analysis.visualSummary?.width, 0)} × ${formatNumber(analysis.visualSummary?.height, 0)}`} />
          <SummaryItem label="FPS" value={formatNumber(analysis.visualSummary?.fps)} />
          <SummaryItem label="镜头数" value={formatNumber(analysis.visualSummary?.shotCount, 0)} />
          <SummaryItem label="字幕段数" value={formatNumber(analysis.visualSummary?.transcriptSegmentCount, 0)} />
          <SummaryItem label="码率" value={formatNumber(analysis.visualSummary?.bitrate, 0)} />
        </dl>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-md border border-[#dedbd2] bg-white p-5">
          <h3 className="text-lg font-semibold">镜头列表</h3>
          <div className="mt-4 max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-[#767166]">
                <tr>
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">开始</th>
                  <th className="py-2 pr-3">结束</th>
                  <th className="py-2 pr-3">时长</th>
                  <th className="py-2 pr-3">类型</th>
                </tr>
              </thead>
              <tbody>
                {(analysis.shots ?? []).map((shot, index) => (
                  <tr key={shot.id} className="border-t border-[#eeeae2]">
                    <td className="py-2 pr-3">{index + 1}</td>
                    <td className="py-2 pr-3">{formatNumber(shot.start)}s</td>
                    <td className="py-2 pr-3">{formatNumber(shot.end)}s</td>
                    <td className="py-2 pr-3">{formatNumber(shot.duration)}s</td>
                    <td className="py-2 pr-3">{shot.shotType ?? "unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analysis.shots?.length ? null : <p className="py-6 text-sm text-[#706b60]">暂无镜头数据。</p>}
          </div>
        </div>

        <div className="rounded-md border border-[#dedbd2] bg-white p-5">
          <h3 className="text-lg font-semibold">字幕时间线</h3>
          <div className="mt-4 max-h-[420px] space-y-3 overflow-auto">
            {(analysis.transcript ?? []).map((segment) => (
              <article key={segment.id} className="rounded-md bg-[#f7f7f5] p-3 text-sm">
                <p className="text-xs font-medium text-[#767166]">
                  {formatNumber(segment.start)}s - {formatNumber(segment.end)}s
                </p>
                <p className="mt-2 leading-6 text-[#34332f]">{segment.text}</p>
              </article>
            ))}
            {analysis.transcript?.length ? null : <p className="py-6 text-sm text-[#706b60]">暂无字幕数据。</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[#767166]">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
