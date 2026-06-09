export interface VideoAuthor {
  name: string;
}

export interface VideoChapter {
  time: number; // seconds
  label: string;
}

export interface Video {
  id: string;
  youtubeId: string; // YouTube video ID for iframe embed
  thumbnail: string;
  title: string;
  description: string;
  author: VideoAuthor;
  duration: number; // seconds
  likes: number;
  hasLiked: boolean;
  saved: boolean;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  chapters: VideoChapter[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  estimatedHours: number;
  completed: boolean;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: RoadmapStep[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  videos?: Video[];
  roadmap?: Roadmap;
}

export type TabId = 'home' | 'ai' | 'roadmap' | 'library' | 'settings';
