import { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Feed', icon: '△' },
  { id: 'ai', label: 'AI', icon: '◇' },
  { id: 'roadmap', label: 'Path', icon: '⋮⋮' },
  { id: 'library', label: 'Library', icon: '◈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 bg-app-bg border-t border-app-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-300 ${
                isActive
                  ? 'text-chalk-yellow'
                  : 'text-app-text-muted hover:text-app-text-secondary'
              }`}
            >
              <span className={`text-lg leading-none transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[11px] leading-none font-hand font-semibold ${isActive ? 'text-chalk-yellow' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 w-8 h-0.5 rounded-b-full"
                  style={{
                    background: 'var(--chalk-yellow)',
                    animation: 'chalk-pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
