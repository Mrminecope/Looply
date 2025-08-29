// src/components/LIAAssistButton.tsx

import React, { useRef, useState } from "react";
import { useLIA } from "../utils/lia_hooks_utils";

interface Props {
  text: string;               // the current draft text
  onApply: (output: string) => void; // apply chosen output back to composer
}

export default function LIAAssistButton({ text, onApply }: Props){
  const { loading, result, run, runVideo, sendChat, chatHistory } = useLIA();
  const [mode, setMode] = useState<"caption"|"hashtag"|"summarize"|"search"|"analyzeVideo"|"chat">("caption");
  const [chatInput, setChatInput] = useState("");
  const fileRef = useRef<HTMLInputElement|null>(null);

  async function handleRun(){
    if (mode === "analyzeVideo"){
      if (fileRef.current?.files && fileRef.current.files[0]){
        await runVideo(fileRef.current.files[0]);
      } else {
        // no file selected; show a friendly result
        await runVideo("video_placeholder.mp4");
      }
    } else if (mode === "chat"){
      if (chatInput.trim()){
        await sendChat(chatInput.trim());
        setChatInput("");
      }
    } else {
      await run(text, mode);
    }
  }

  function Pill({active, label, onClick}:{active:boolean; label:string; onClick:()=>void}){
    return (
      <button onClick={onClick} className={`px-3 py-1 rounded-full border text-sm transition-all duration-200 ${active?"bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md":"bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-sm"}`}>{label}</button>
    );
  }

  return (
    <div className="inline-block bg-white rounded-2xl p-4 shadow-lg border border-gray-200 max-w-md">
      <div className="flex flex-wrap gap-2 mb-3">
        <Pill active={mode==="caption"} label="Captions" onClick={()=>setMode("caption")} />
        <Pill active={mode==="hashtag"} label="Hashtags" onClick={()=>setMode("hashtag")} />
        <Pill active={mode==="summarize"} label="Summarize" onClick={()=>setMode("summarize")} />
        <Pill active={mode==="search"} label="Smart Search" onClick={()=>setMode("search")} />
        <Pill active={mode==="analyzeVideo"} label="Analyze Video" onClick={()=>setMode("analyzeVideo")} />
        <Pill active={mode==="chat"} label="Chat with LIA" onClick={()=>setMode("chat")} />
      </div>

      {mode === "analyzeVideo" && (
        <div className="mb-3 flex items-center gap-2">
          <input ref={fileRef} type="file" accept="video/*" className="text-sm border border-gray-300 rounded-md px-2 py-1" />
          <span className="text-xs text-gray-500">(optional — select a video file)</span>
        </div>
      )}

      {mode === "chat" && (
        <div className="mb-3 flex items-center gap-2">
          <input
            value={chatInput}
            onChange={e=>setChatInput(e.target.value)}
            placeholder="Ask LIA anything…"
            className="px-3 py-2 border border-gray-300 rounded-md flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={e => e.key === 'Enter' && handleRun()}
          />
        </div>
      )}

      <button 
        onClick={handleRun} 
        disabled={loading} 
        className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${loading?"bg-gray-200 text-gray-500 cursor-not-allowed":"bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg"}`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Thinking…
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">✨</span>
            Ask LIA
          </div>
        )}
      </button>

      {/* Results panel */}
      {result && (
        <div className="mt-4 p-3 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 max-w-xl">
          {mode === "caption" && (result.captions || result.hashtags) && (
            <div className="space-y-3">
              {Array.isArray(result.captions) && (
                <div>
                  <div className="font-semibold mb-2 text-purple-800">Generated Captions</div>
                  <ul className="space-y-2">
                    {result.captions.map((c: string, i: number) => (
                      <li key={i} className="bg-white rounded-lg p-2 border border-purple-200">
                        <button 
                          className="text-left w-full text-sm hover:text-purple-600 transition-colors cursor-pointer" 
                          onClick={()=>onApply(c)}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(result.hashtags) && (
                <div>
                  <div className="font-semibold mb-2 text-purple-800">Hashtags</div>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((h: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 rounded-md bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all" 
                        onClick={()=>onApply(text + (text?" \n\n":"") + h)}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "hashtag" && Array.isArray(result.hashtags) && (
            <div>
              <div className="font-semibold mb-2 text-purple-800">Suggested Hashtags</div>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((h: string, i: number) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 rounded-md bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all" 
                    onClick={()=>onApply(text + (text?" \n\n":"") + h)}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mode === "summarize" && result.summary && (
            <div>
              <div className="font-semibold mb-2 text-purple-800">Summary</div>
              <p className="italic text-sm mb-3 text-gray-700 bg-white rounded-lg p-2 border border-purple-200">{result.summary}</p>
              <button 
                className="px-3 py-1 border border-purple-300 rounded-md text-sm hover:bg-purple-50 transition-colors" 
                onClick={()=>onApply(result.summary)}
              >
                Apply Summary
              </button>
            </div>
          )}

          {mode === "search" && Array.isArray(result.searchResults) && (
            <div>
              <div className="font-semibold mb-2 text-purple-800">Smart Search Results</div>
              <ul className="space-y-2">
                {result.searchResults.map((s: string, i: number) => (
                  <li key={i} className="bg-white rounded-lg p-2 border border-purple-200 text-sm">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {mode === "analyzeVideo" && result.videoSummary && (
            <div className="space-y-3">
              <div className="font-semibold mb-2 text-purple-800">Video Analysis</div>
              <p className="text-sm bg-white rounded-lg p-2 border border-purple-200">{result.videoSummary}</p>
              {Array.isArray(result.videoTags) && (
                <div>
                  <div className="font-semibold mb-1 text-purple-800">Auto‑Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {result.videoTags.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(result.trendingSounds) && (
                <div>
                  <div className="font-semibold mb-1 text-purple-800">Trending Sounds</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {result.trendingSounds.map((s: string, i: number) => (
                      <li key={i} className="text-gray-700">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {mode === "chat" && Array.isArray(chatHistory) && chatHistory.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold mb-2 text-purple-800">LIA Chat</div>
              <div className="max-h-60 overflow-auto border border-purple-200 rounded-lg p-2 bg-white space-y-2">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg ${m.role==='assistant' ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200' : 'bg-gray-100 border border-gray-200'}`}>
                    <span className="font-medium text-xs text-purple-600 mr-2">{m.role === 'assistant' ? 'LIA' : 'You'}:</span>
                    <span className="text-sm text-gray-700">{m.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}