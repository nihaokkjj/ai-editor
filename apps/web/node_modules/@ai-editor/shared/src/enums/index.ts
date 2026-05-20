export enum TargetPlatform {
  Douyin = "douyin",
  Xiaohongshu = "xiaohongshu",
  Tiktok = "tiktok",
  Bilibili = "bilibili",
  Kuaishou = "kuaishou",
  YoutubeShorts = "youtube_shorts",
}

export enum AspectRatio {
  Portrait = "9:16",
  Landscape = "16:9",
  Square = "1:1",
}

export enum ProjectStatus {
  Draft = "draft",
  Analyzing = "analyzing",
  Generating = "generating",
  Editing = "editing",
  Rendering = "rendering",
  Completed = "completed",
  Failed = "failed",
}

export enum VideoStatus {
  Uploaded = "uploaded",
  Processing = "processing",
  Ready = "ready",
  Failed = "failed",
}

export enum StructureBeatRole {
  Hook = "hook",
  Problem = "problem",
  Conflict = "conflict",
  Solution = "solution",
  Proof = "proof",
  Comparison = "comparison",
  Transition = "transition",
  Cta = "cta",
}

export enum StructureGenre {
  PainSolutionConversion = "pain_solution_conversion",
  BeforeAfterComparison = "before_after_comparison",
  ProductReview = "product_review",
  CounterintuitiveEducation = "counterintuitive_education",
  StoryReversal = "story_reversal",
  Listicle = "listicle",
  ChallengeExperiment = "challenge_experiment",
  PersonaStory = "persona_story",
  Tutorial = "tutorial",
  EmotionalResonance = "emotional_resonance",
}

export enum JobStatus {
  Pending = "pending",
  Queued = "queued",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
  Canceled = "canceled",
}
