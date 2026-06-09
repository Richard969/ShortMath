import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { TabId } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-deep">
      <div className="phone-frame">
        {/* Content area — fills entire phone frame, nav overlays on top */}
        <div className="absolute inset-0 overflow-hidden">
          {children}
        </div>

        {/* Bottom navigation */}
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
