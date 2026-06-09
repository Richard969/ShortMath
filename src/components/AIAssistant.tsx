import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Video, Roadmap } from '../types';

interface AIAssistantProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
  onViewVideo: (video: Video) => void;
  onViewRoadmap: (roadmap: Roadmap) => void;
}

export default function AIAssistant({
  messages,
  isThinking,
  onSend,
  onClear,
  onViewVideo,
  onViewRoadmap,
}: AIAssistantProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput('');
  };

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-chalk-yellow">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const quickPrompts = [
    { icon: '∫', text: 'Teach me calculus from scratch' },
    { icon: 'P', text: 'Explain Bayes theorem simply' },
    { icon: 'A', text: 'Show linear algebra videos' },
    { icon: 'σ', text: 'Statistics for beginners' },
    { icon: 'π', text: 'Create a probability study plan' },
    { icon: 'i', text: 'What is e^(iπ) + 1 = 0?' },
  ];

  return (
    <div className="flex flex-col h-full bg-app-bg pb-14">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 border-b border-app-border bg-app-bg/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-chalk-yellow">◇</span>
          <div>
            <h2 className="text-base font-display font-bold italic text-app-text">Math AI</h2>
            <p className="text-xs text-app-text-muted font-hand font-medium">Find videos · Build paths</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-[10px] text-app-text-muted hover:text-chalk-pink px-3 py-1 rounded-full border border-app-border hover:border-chalk-pink/40 transition-all duration-300 font-hand font-semibold"
        >
          CLEAR
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-lg mt-1 flex-shrink-0 text-chalk-yellow">◇</span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'glass-card text-app-text rounded-bl-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{renderMarkdown(msg.content)}</div>

              {/* Video cards embedded in chat */}
              {msg.videos && msg.videos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.videos.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onViewVideo(v)}
                      className="flex gap-3 glass-card rounded-xl p-2 border-app-border hover:border-chalk-yellow/30 transition-colors cursor-pointer text-left w-full"
                    >
                      <div className="w-14 h-20 rounded-lg bg-app-surface flex-shrink-0 flex items-center justify-center text-lg text-chalk-yellow">
                        ▶
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-app-text truncate">{v.title}</p>
                        <p className="text-[10px] text-app-text-secondary mt-0.5 line-clamp-2">{v.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-app-elevated/50 text-app-text-secondary">
                            {v.topic}
                          </span>
                          <span className="text-[9px] text-app-text-muted">{v.duration}s</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Roadmap card embedded in chat */}
              {msg.roadmap && (
                <button
                  onClick={() => onViewRoadmap(msg.roadmap!)}
                  className="mt-3 w-full text-left glass-card rounded-xl p-3 border-chalk-yellow/20 hover:border-chalk-yellow/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-chalk-yellow">◎</span>
                    <span className="text-sm font-semibold text-app-text">{msg.roadmap.title}</span>
                  </div>
                  <p className="text-[10px] text-app-text-secondary mb-2">{msg.roadmap.description}</p>
                  <div className="flex items-center gap-1">
                    {msg.roadmap.steps.map((step, i) => (
                      <span key={step.id} className="flex items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-chalk-yellow/20 text-[9px] text-chalk-yellow flex items-center justify-center font-bold font-mono">
                          {i + 1}
                        </span>
                        {i < msg.roadmap!.steps.length - 1 && (
                          <span className="w-3 h-px bg-chalk-yellow/30" />
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="text-[9px] text-chalk-yellow mt-2 font-hand font-semibold">Tap to view full roadmap →</p>
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <span className="text-lg mt-1 flex-shrink-0 text-app-text-secondary">●</span>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-2 justify-start">
            <span className="text-lg mt-1 text-chalk-yellow">◇</span>
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full typing-dot" />
                <span className="w-2 h-2 rounded-full typing-dot" />
                <span className="w-2 h-2 rounded-full typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts (only when few messages) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-app-text-muted mb-2 font-hand font-semibold">Try asking</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp) => (
              <button
                key={qp.text}
                onClick={() => { setInput(qp.text); }}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full glass-card text-app-text-secondary hover:text-chalk-yellow hover:border-chalk-yellow/30 transition-all duration-300 font-hand font-medium"
              >
                <span>{qp.icon}</span>
                <span className="truncate max-w-[140px]">{qp.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-6 pt-2 border-t border-app-border">
        <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2 border-app-border focus-within:border-brand-400/40 transition-all duration-300">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about math..."
            className="flex-1 bg-transparent text-sm text-app-text placeholder-app-text-muted outline-none font-light"
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="w-8 h-8 rounded-full bg-chalk-yellow text-app-bg flex items-center justify-center disabled:opacity-30 disabled:bg-gray-700 transition-all active:scale-90 hover:glow-chalk-yellow"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
