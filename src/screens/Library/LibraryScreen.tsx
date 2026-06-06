import { Folder, Bookmark, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PromptCard } from '../../components/Card/PromptCard';
import './LibraryScreen.css';

interface LibraryScreenProps {
  onCardClick: (id: string) => void;
  isAdmin?: boolean;
}

export function LibraryScreen({ onCardClick, isAdmin }: LibraryScreenProps) {
  const navigate = useNavigate();
  return (
    <div className="library-screen">
      <div className="library-header">
        <h1 className="screen-title">Your Library</h1>
        
        <div className="library-tabs">
          <button className="library-tab active">
            <Bookmark size={16} />
            <span>Saved</span>
          </button>
          <button className="library-tab">
            <Folder size={16} />
            <span>Collections</span>
          </button>
          <button className="library-tab">
            <History size={16} />
            <span>Recent</span>
          </button>
        </div>
      </div>

      <div className="library-content">
        <div className="explore-grid">
          <PromptCard 
            image="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80"
            title="Brutalist Zen"
            statValue="842"
            statIcon="copy"
            statPosition="bottom-left"
            onClick={() => onCardClick('mock-id-2')}
            showEdit={isAdmin}
            onEdit={() => navigate('/edit/mock-id-2')}
          />
          <PromptCard 
            image="https://images.unsplash.com/photo-1620121478247-ec786b9be2fa?auto=format&fit=crop&w=600&q=80"
            title="Iridescent Cyber Wave"
            author="nexus_ai"
            statValue="2.4k"
            statIcon="heart"
            statPosition="top-right"
            onClick={() => onCardClick('mock-id-3')}
            showEdit={isAdmin}
            onEdit={() => navigate('/edit/mock-id-3')}
          />
        </div>
      </div>
    </div>
  );
}
