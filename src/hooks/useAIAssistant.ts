import { useState, useCallback, useRef } from 'react';
import { ChatMessage, Video, Roadmap } from '../types';
import { mockVideos } from '../data/videos';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Search videos by natural language query.
 * Mock: matches against title, topic, description, difficulty.
 */
function searchVideos(query: string): Video[] {
  const lower = query.toLowerCase();

  // Check for difficulty hints
  const difficultyHints = {
    beginner: /\b(beginner|basic|intro|start|beginning|simple|easy|new to)\b/i,
    intermediate: /\b(intermediate|middle|some experience|know.*basics)\b/i,
    advanced: /\b(advanced|deep|rigorous|proof|hard|complex)\b/i,
  };

  let targetDifficulty: Video['difficulty'] | null = null;
  if (difficultyHints.beginner.test(lower)) targetDifficulty = 'beginner';
  else if (difficultyHints.advanced.test(lower)) targetDifficulty = 'advanced';
  else if (difficultyHints.intermediate.test(lower)) targetDifficulty = 'intermediate';

  // Score each video
  const scored = mockVideos.map((v) => {
    let score = 0;
    const haystack = `${v.title} ${v.description} ${v.topic}`.toLowerCase();

    // Keyword match
    const words = lower.split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue;
      if (haystack.includes(word)) score += 2;
      if (v.topic.toLowerCase().includes(word)) score += 3;
      if (v.title.toLowerCase().includes(word)) score += 4;
    }

    // Difficulty boost
    if (targetDifficulty && v.difficulty === targetDifficulty) score += 3;

    return { video: v, score };
  });

  return scored
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.video);
}

/**
 * Generate a personalized learning roadmap based on user goal.
 */
function generateRoadmap(goal: string): Roadmap {
  const lower = goal.toLowerCase();

  const calculusRoadmap: Roadmap = {
    id: generateId(),
    title: 'Calculus Mastery Path',
    description: 'From limits to multivariable calculus — a structured path to mastering calculus.',
    goal,
    steps: [
      {
        id: generateId(),
        title: 'Limits & Continuity',
        description: 'Understand what a limit means intuitively and formally (ε-δ).',
        videoIds: ['v5', 'v3'],
        estimatedHours: 3,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Derivatives',
        description: 'Master the derivative as rate of change and tangent slope. Chain rule, product rule, implicit differentiation.',
        videoIds: ['v3'],
        estimatedHours: 5,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Integrals',
        description: 'Riemann sums, definite integrals, Fundamental Theorem of Calculus.',
        videoIds: ['v10'],
        estimatedHours: 5,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Series & Sequences',
        description: 'Taylor series, convergence tests, power series.',
        videoIds: ['v9'],
        estimatedHours: 4,
        completed: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const linearAlgebraRoadmap: Roadmap = {
    id: generateId(),
    title: 'Linear Algebra Path',
    description: 'From vectors to eigenvalues — master the language of modern ML and graphics.',
    goal,
    steps: [
      {
        id: generateId(),
        title: 'Vectors & Spaces',
        description: 'Vector operations, linear combinations, span, basis.',
        videoIds: ['v4'],
        estimatedHours: 3,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Matrices & Transformations',
        description: 'Matrix as linear transformation, multiplication as composition.',
        videoIds: ['v4'],
        estimatedHours: 4,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Determinants & Eigenvalues',
        description: 'Determinant as scaling factor, eigenvectors and eigenvalues.',
        videoIds: [],
        estimatedHours: 5,
        completed: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const statsRoadmap: Roadmap = {
    id: generateId(),
    title: 'Probability & Statistics Path',
    description: 'From basic probability to statistical inference — learn to reason with uncertainty.',
    goal,
    steps: [
      {
        id: generateId(),
        title: 'Basic Probability',
        description: 'Sample spaces, events, conditional probability, independence.',
        videoIds: ['v7'],
        estimatedHours: 3,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Random Variables & Distributions',
        description: 'Discrete and continuous distributions, expectation, variance.',
        videoIds: ['v6'],
        estimatedHours: 4,
        completed: false,
      },
      {
        id: generateId(),
        title: 'The Central Limit Theorem',
        description: 'Understanding why everything tends toward normal.',
        videoIds: ['v6'],
        estimatedHours: 2,
        completed: false,
      },
      {
        id: generateId(),
        title: 'Bayesian Inference',
        description: 'Update beliefs with evidence. Prior, likelihood, posterior.',
        videoIds: ['v7'],
        estimatedHours: 4,
        completed: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  if (lower.includes('calculus') || lower.includes('derivative') || lower.includes('integral') || lower.includes('limit')) {
    return calculusRoadmap;
  }
  if (lower.includes('linear') || lower.includes('matrix') || lower.includes('vector') || lower.includes('algebra')) {
    return linearAlgebraRoadmap;
  }
  if (lower.includes('stat') || lower.includes('prob') || lower.includes('bayes') || lower.includes('distribution')) {
    return statsRoadmap;
  }

  // Default: return most relevant based on keywords
  return statsRoadmap;
}

export function useAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your math learning assistant. △\n\nTell me what you want to learn, and I'll:\n• Find the best short videos for you\n• Design a personalized learning roadmap\n\nTry: *\"I want to learn calculus from scratch\"* or *\"Show me videos about Bayes theorem\"*",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // Cancel any in-flight AI response
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Simulate AI processing delay
      await delay(1200 + Math.random() * 800);

      if (controller.signal.aborted) return;

      const lower = text.toLowerCase();
      const wantsVideos = /video|show|find|search|watch|recommend/i.test(lower);
      const wantsRoadmap = /roadmap|plan|path|curriculum|learn.*from|study.*plan|guide/i.test(lower);
      const wantsBoth = /both|all|everything|and.*roadmap|and.*plan|roadmap.*and|plan.*and/i.test(lower);

      const videos = (wantsVideos || wantsBoth || !wantsRoadmap) ? searchVideos(text) : undefined;
      const roadmap = (wantsRoadmap || wantsBoth) ? generateRoadmap(text) : undefined;

      const responseParts: string[] = [];

      if (videos && videos.length > 0) {
        responseParts.push(`Found **${videos.length} videos** matching your request:\n`);
        videos.forEach((v, i) => {
          responseParts.push(`**${i + 1}.** ${v.title} — ${v.difficulty} • ${v.duration}s`);
          responseParts.push(`   ${v.description.substring(0, 80)}...`);
          responseParts.push('');
        });
      } else if (videos && videos.length === 0) {
        responseParts.push("I couldn't find videos exactly matching that query. Try broader terms like \"calculus basics\" or \"probability\".");
      }

      if (roadmap) {
        responseParts.push(`\n📋 **${roadmap.title}**\n`);
        responseParts.push(`${roadmap.description}\n`);
        roadmap.steps.forEach((step, i) => {
          responseParts.push(`**Step ${i + 1}:** ${step.title} (~${step.estimatedHours}h)`);
          responseParts.push(`  ${step.description}`);
        });
      }

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseParts.join('\n') || "Tell me what math topic you're interested in, and I'll help you find the right content!",
        videos,
        roadmap,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Aborted — do nothing
    } finally {
      if (!controller.signal.aborted) {
        setIsThinking(false);
      }
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your math learning assistant. △\n\nTell me what you want to learn, and I'll:\n• Find the best short videos for you\n• Design a personalized learning roadmap\n\nTry: *\"I want to learn calculus from scratch\"* or *\"Show me videos about Bayes theorem\"*",
      },
    ]);
  }, []);

  return { messages, isThinking, sendMessage, clearChat };
}
