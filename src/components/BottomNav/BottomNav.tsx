import { LayoutGrid, Compass, Folder, Settings } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export function BottomNav({ currentTab, onChangeTab }: BottomNavProps) {
  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onChangeTab('home')}
      >
        <LayoutGrid size={24} />
        <span>Home</span>
      </button>
      
      <button 
        className={`nav-item ${currentTab === 'explore' ? 'active' : ''}`}
        onClick={() => onChangeTab('explore')}
      >
        <Compass size={24} />
        <span>Explore</span>
      </button>
      
      <button 
        className={`nav-item ${currentTab === 'library' ? 'active' : ''}`}
        onClick={() => onChangeTab('library')}
      >
        <Folder size={24} />
        <span>Library</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
        onClick={() => onChangeTab('settings')}
      >
        <Settings size={24} />
        <span>Settings</span>
      </button>
    </div>
  );
}
