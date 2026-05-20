# video-worker

MVP 阶段视频分析任务先放在 `apps/api/src/modules/jobs` 中处理。

当 FFmpeg、OpenCV、PySceneDetect 或 OCR 任务需要独立扩缩容时，再把相关 processor 迁移到该目录。
