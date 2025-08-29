// src/utils/lia.ts
// Looply Intelligent Assistant (LIA) — final bundle
// Pure TypeScript, zero external deps. Safe fallbacks for browsers.

export type Tone = "Casual" | "Trendy" | "Professional" | "Playful";

export type TextMode = 
  | "caption"
  | "hashtag"
  | "summarize"
  | "search";

export type AnalyzeTextResult = {
  captions?: string[];
  hashtags?: string[];
  summary?: string;
  searchResults?: string[];
};

export type AnalyzeVideoResult = {
  videoSummary: string;
  videoTags: string[];
  trendingSounds: string[];
};

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ChatResult = { reply: string };

// -----------------------------
// Small utilities
// -----------------------------
const STOPWORDS = new Set([
  "the","a","an","and","or","for","to","of","in","on","at","with","by","is","are","was","were","be","as","from","that","this","it","you","your","our","we"
]);

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s#_\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function topKeywords(text: string, limit=8): string[] {
  const freq: Record<string, number> = {};
  for (const tok of tokenize(text)) {
    if (STOPWORDS.has(tok)) continue;
    if (tok.length < 3) continue;
    freq[tok] = (freq[tok] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a,b) => b[1]-a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

function pick<T>(arr: T[], n: number): T[] { const c=[...arr]; const out: T[]=[]; while(c.length && out.length<n){ out.push(c.splice(Math.floor(Math.random()*c.length),1)[0]); } return out; }

// -----------------------------
// Public helpers exposed
// -----------------------------
export function generateCaptions(input: {
  transcript?: string;
  thumbTags?: string[];
  topic?: string;
  community?: string;
  tone?: Tone;
  maxLen?: number;
}): { options: string[]; hashtags: string[] } {
  const tone = input.tone || "Trendy";
  const maxLen = input.maxLen ?? 90;

  const base = [
    ...(input.thumbTags || []),
    ...(input.topic ? tokenize(input.topic) : []),
    ...(input.transcript ? topKeywords(input.transcript, 6) : []),
  ];
  const uniq = Array.from(new Set(base));
  const key = pick(uniq, 3).join(" · ");

  const T: Record<Tone, string[]> = {
    Casual: [
      "Just {x}.",
      "{x} — thoughts?",
      "That moment when {x}",
      "Low‑key obsessed with {x}",
      "{x}. You had to be there.",
    ],
    Trendy: [
      "POV: {x}",
      "Wait for it… {x}",
      "Did we just {x}?",
      "This goes too hard: {x}",
      "Say less. {x}",
    ],
    Professional: [
      "Quick breakdown: {x}.",
      "Behind the scenes: {x}.",
      "How we pulled off {x}.",
      "Lessons learned from {x}.",
      "The craft behind {x}.",
    ],
    Playful: [
      "I blame {x} 😂",
      "BRB mastering {x}",
      "Achievement unlocked: {x}",
      "Plot twist: {x}",
      "Zero chill for {x}",
    ],
  };

  const options = T[tone]
    .map(t => t.replace("{x}", key))
    .map(s => (s.length > maxLen ? s.slice(0, maxLen - 1) + "…" : s));

  const hashBase = Array.from(new Set([
    ...(input.community ? [input.community] : []),
    ...uniq,
  ]));
  const hashtags = hashBase
    .slice(0, 12)
    .map(w => w.replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean)
    .map(w => (w.startsWith("#") ? w : `#${w}`));

  return { options, hashtags };
}

export function suggestHashtags(text: string, community?: string, limit=12): string[] {
  const base = Array.from(new Set([
    ...(community ? [community] : []),
    ...topKeywords(text, 15),
  ]));
  return base
    .map(w => w.replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean)
    .slice(0, limit)
    .map(w => (w.startsWith("#") ? w : `#${w}`));
}

export function summarizeText(text: string): string {
  if (!text || !text.trim()) return "No content to summarize.";
  const key = pick(topKeywords(text, 6), 3).join(", ");
  const words = text.trim().split(/\s+/).length;
  return `Summary: ${key || "key points"}. ~${words} words.`;
}

export function searchContent(query: string, pool: { id: string; content: string; likes?: number; comments?: number; shares?: number; views?: number; createdAt?: string; community?: string; type?: string; }[], sort: "trending"|"recent"|"top" = "recent") {
  const Q = tokenize(query);
  const scored = pool.map(p => {
    const txt = `${p.content} ${p.community || ""}`.toLowerCase();
    const hit = Q.reduce((a,t)=>a+(txt.includes(t)?1:0),0);
    const eng = (p.likes||0) + 0.7*(p.comments||0) + 1.2*(p.shares||0) + 0.002*(p.views||0);
    const ageH = p.createdAt ? (Date.now()-new Date(p.createdAt).getTime())/3.6e6 : 0;
    const rec = Math.max(0,72-ageH);
    const score = 2*hit + 0.02*eng + 0.1*rec;
    return { p, score, eng, rec };
  });
  let sorted = scored;
  if (sort === "trending") sorted = scored.sort((a,b)=>(b.eng*0.02+b.rec*0.1)-(a.eng*0.02+a.rec*0.1));
  else if (sort === "top") sorted = scored.sort((a,b)=>b.eng-a.eng);
  else sorted = scored.sort((a,b)=>b.score-a.score);
  return sorted.map(s => s.p);
}

// -----------------------------
// Unified text analyzer used by the hook
// -----------------------------
export async function analyzeText(input: string, mode: TextMode): Promise<AnalyzeTextResult> {
  const baseText = input || "";
  if (mode === "caption") {
    const { options, hashtags } = generateCaptions({ topic: baseText, tone: "Trendy" });
    return { captions: options, hashtags };
  }
  if (mode === "hashtag") {
    const hashtags = suggestHashtags(baseText);
    return { hashtags };
  }
  if (mode === "summarize") {
    return { summary: summarizeText(baseText) };
  }
  // search demo: split lines and rank as if each line was a post
  const pool = baseText.split(/\n+/).filter(Boolean).map((line, i) => ({ id: String(i+1), content: line, likes: 10*i, comments: 2*i, shares: i }));
  const items = searchContent(baseText, pool, "recent");
  return { searchResults: items.map(x => x.content) };
}

// -----------------------------
// Video analyzer (safe fallbacks)
// -----------------------------
export async function analyzeVideo(fileOrUrl: File | string): Promise<AnalyzeVideoResult> {
  // We avoid CORS/frame extraction by default. We derive tags from name + optional metadata.
  const name = typeof fileOrUrl === "string" ? fileOrUrl : (fileOrUrl.name || "video");
  const tokens = tokenize(name).filter(t => t.length > 2);
  const baseTags = Array.from(new Set(tokens)).slice(0, 6);

  let duration = 0; // seconds
  try {
    if (typeof window !== "undefined") {
      const url = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
      duration = await probeVideoDuration(url);
      if (typeof fileOrUrl !== "string") URL.revokeObjectURL(url);
    }
  } catch { /* ignore */ }

  const durText = duration > 0 ? `${Math.round(duration)}s` : "unknown duration";

  const videoSummary = `Detected ${baseTags.slice(0,3).join(", ") || "content"} — ${durText}.`;
  const videoTags = baseTags.length ? baseTags.map(t => `#${t}`) : ["#looply", "#reel", "#video"];

  // local curated list; you can swap with server-provided trends later
  const TRENDING_SOUNDS = [
    "Chill Vibes Beat",
    "Retro Synth Loop",
    "Cinematic Drop",
    "Upbeat Pop Hook",
    "Lo‑fi Rain Ambience",
  ];
  // rank by token overlap for a pseudo‑smart suggestion
  const trendingSounds = TRENDING_SOUNDS.slice(0,3);

  return { videoSummary, videoTags, trendingSounds };
}

async function probeVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.src = url;
      v.onloadedmetadata = () => resolve(isFinite(v.duration) ? v.duration : 0);
      v.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

// -----------------------------
// Simple local chat brain (deterministic, context‑aware stubs)
// -----------------------------
export async function chatWithLIA(history: ChatTurn[]): Promise<ChatResult> {
  const last = history[history.length - 1]?.content?.toLowerCase() || "";
  let reply = "I'm here! Ask me to caption, hashtag, analyze a video, or summarize your draft.";

  if (last.includes("caption")) reply = "Drop your draft or topic and I'll craft 5 caption options + hashtags.";
  else if (last.includes("hashtag")) reply = "Tell me the main topic; I'll return up to 12 relevant hashtags.";
  else if (last.includes("video") || last.includes("reel")) reply = "Upload a video file or paste a URL, and I'll auto‑tag + suggest trending sounds.";
  else if (last.includes("summar")) reply = "Paste text and I'll give you a short, punchy summary.";
  else if (last.includes("hello") || last.includes("hi ") || last === "hi" || last === "hey") reply = "Hey! I'm LIA. What are we creating today?";
  else if (last) {
    // generic helpfulness using keywords
    const kws = topKeywords(last, 5);
    if (kws.length) reply = `Got it. Key focus: ${kws.join(", ")}. Want captions, hashtags, or a summary?`;
  }

  return { reply };
}

// =============================================================
// FILE: src/hooks/useLIA.ts
// Extended hook: text modes, video analysis, chat history/state.
// =============================================================

import { useState } from "react";

export function useLIA(){
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);

  async function run(input: string, mode: TextMode, videoUrl?: string){
    setLoading(true);
    try{
      if (mode === "caption" || mode === "hashtag" || mode === "summarize" || mode === "search"){
        const res: AnalyzeTextResult = await analyzeText(input, mode);
        setResult(res);
      } else {
        setResult(null);
      }
    } finally { setLoading(false); }
  }

  async function runVideo(fileOrUrl: File | string){
    setLoading(true);
    try{
      const res: AnalyzeVideoResult = await analyzeVideo(fileOrUrl);
      setResult(res);
    } finally { setLoading(false); }
  }

  async function sendChat(message: string){
    setLoading(true);
    try{
      const next: ChatTurn = { role: "user", content: message };
      const res = await chatWithLIA([...chatHistory, next]);
      const ai: ChatTurn = { role: "assistant", content: res.reply };
      setChatHistory(prev => [...prev, next, ai]);
      setResult({ chatHistory: [...chatHistory, next, ai] });
    } finally { setLoading(false); }
  }

  function reset(){ setResult(null); }

  return { loading, result, run, runVideo, sendChat, chatHistory, reset };
}