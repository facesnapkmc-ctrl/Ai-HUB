import { useState } from 'react';
import { Heart, Copy, Eye, Share2, Trash2, Link2, Check, Edit2 } from 'lucide-react';
import './PromptCard.css';

export interface PromptCardProps {
  image: string;
  title: string;
  author?: string;
  statValue: string | number;
  statIcon: 'heart' | 'copy' | 'eye';
  statPosition: 'top-right' | 'bottom-left' | 'top-left';
  onClick?: () => void;
  className?: string;
  showDelete?: boolean;
  showEdit?: boolean;
  shareUrl?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function PromptCard({
  image,
  title,
  author,
  statValue,
  statIcon,
  statPosition,
  onClick,
  className = '',
  showDelete,
  showEdit,
  shareUrl,
  onDelete,
  onEdit
}: PromptCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const renderIcon = () => {
    switch (statIcon) {
      case 'heart': return <Heart size={12} />;
      case 'copy': return <Copy size={12} />;
      case 'eye': return <Eye size={12} />;
    }
  };

  return (
    <div className={`prompt-card ${className}`} onClick={onClick}>
      <div className="card-image-container">
        {image ? (
          <img src={image} alt={title} className="card-image" loading="lazy" />
        ) : (
          <div className="card-image" style={{ backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No Image
          </div>
        )}
        <div className={`stat-badge ${statPosition} ${statIcon === 'copy' ? 'cyan-bg' : ''}`}>
          {renderIcon()}
          <span>{statValue}</span>
        </div>

        <div className="pc-top-right-actions">
          <div style={{ position: 'relative' }}>
            <button 
              className="pc-action-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!shareUrl) return;
                setShowShareMenu(!showShareMenu); 
              }}
              title="Share"
            >
              <Share2 size={14} className="pc-action-icon" />
            </button>
            {showShareMenu && shareUrl && (
              <div className="pc-share-menu" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="pc-share-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                      setShowShareMenu(false);
                    }, 2000);
                  }}
                >
                  {copied ? <Check size={14} /> : <Link2 size={14} />}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
          {showEdit && (
            <button 
              className="pc-action-btn" 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              title="Edit"
            >
              <Edit2 size={14} className="pc-action-icon" />
            </button>
          )}
          {showDelete && (
            <button 
              className="pc-action-btn" 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              title="Delete"
            >
              <Trash2 size={14} className="pc-action-icon" />
            </button>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        {author && <p className="card-author">@{author}</p>}
      </div>
    </div>
  );
}
