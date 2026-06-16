/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { Settings, Image as ImageIcon, Heart, User as UserIcon, Edit3, Trash2, Copy, BookOpen } from 'lucide-react';
import { api, type PromptWithAuthor } from '../../lib/api';
import { DeleteConfirmationModal } from '../../components/Modal/DeleteConfirmationModal';
import './DashboardScreen.css';

interface DashboardScreenProps {
  user: User | null;
  onNavigate: (screen: string) => void;
}

export function DashboardScreen({ user, onNavigate }: DashboardScreenProps) {
  const navigate = useNavigate();
  const isAdmin = user?.email === 'sunnykiran715@gmail.com';
  const [activeTab, setActiveTab] = useState<'published' | 'saved' | 'copied'>(isAdmin ? 'published' : 'saved');
  const [prompts, setPrompts] = useState<PromptWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      if (activeTab === 'published') {
        api.getUserPrompts(user.id).then(data => {
          setPrompts(data);
          setLoading(false);
        });
      } else if (activeTab === 'saved') {
        api.getSavedPrompts(user.id).then(data => {
          setPrompts(data);
          setLoading(false);
        });
      } else if (activeTab === 'copied') {
        api.getCopiedPrompts(user.id).then(data => {
          setPrompts(data);
          setLoading(false);
        });
      }
    }
  }, [user, activeTab]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.deletePrompt(deletingId);
      setPrompts(prev => prev.filter(p => p.id !== deletingId));
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      alert('Failed to delete prompt.');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const publishedCount = prompts.filter(p => p.status === 'published').length;
  const draftCount = prompts.filter(p => p.status === 'draft').length;

  return (
    <div className="dashboard-screen" style={{ overflowY: 'auto' }}>
      <div className="dashboard-header">
        <div className="profile-info">
          <div className="avatar-large">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-text">
            <h1>{user?.user_metadata?.full_name || 'Creator'}</h1>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <ImageIcon size={20} className="text-purple" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{publishedCount}</span>
            <span className="stat-label">Published</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Edit3 size={20} className="text-pink" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{draftCount}</span>
            <span className="stat-label">Drafts</span>
          </div>
        </div>
      </div>

      <div className="dashboard-menu mb-6" style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {isAdmin && (
          <button className={`menu-item ${activeTab === 'published' ? 'active' : ''}`} onClick={() => setActiveTab('published')} style={{ minWidth: '120px', justifyContent: 'center', background: activeTab === 'published' ? 'var(--bg-secondary)' : 'transparent' }}>
            <div className="menu-icon"><BookOpen size={18} /></div>
            <span>Published</span>
          </button>
        )}
        <button className={`menu-item ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')} style={{ minWidth: '120px', justifyContent: 'center', background: activeTab === 'saved' ? 'var(--bg-secondary)' : 'transparent' }}>
          <div className="menu-icon"><Heart size={18} /></div>
          <span>Saved</span>
        </button>
        <button className={`menu-item ${activeTab === 'copied' ? 'active' : ''}`} onClick={() => setActiveTab('copied')} style={{ minWidth: '120px', justifyContent: 'center', background: activeTab === 'copied' ? 'var(--bg-secondary)' : 'transparent' }}>
          <div className="menu-icon"><Copy size={18} /></div>
          <span>Copied</span>
        </button>
      </div>

      <div className="dashboard-menu mb-6" style={{ display: 'flex', gap: '12px' }}>
        <button className="menu-item" onClick={() => onNavigate('edit-profile')} style={{ flex: 1, justifyContent: 'center' }}>
          <div className="menu-icon"><UserIcon size={18} /></div>
          <span>Profile</span>
        </button>
        <button className="menu-item" onClick={() => onNavigate('settings')} style={{ flex: 1, justifyContent: 'center' }}>
          <div className="menu-icon"><Settings size={18} /></div>
          <span>Settings</span>
        </button>
      </div>

      <div className="my-prompts-section" style={{ padding: '0 20px 100px 20px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          {activeTab === 'published' ? 'My Published Prompts' : activeTab === 'saved' ? 'My Saved Prompts' : 'My Copied Prompts'}
        </h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : prompts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nothing to show here yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {prompts.map(prompt => (
              <div key={prompt.id} style={{ display: 'flex', alignItems: 'center', padding: 12, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', gap: 12 }}>
                {prompt.image_url ? (
                  <img src={prompt.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={20} color="var(--text-muted)" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prompt.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {activeTab === 'published' ? (prompt.status === 'published' ? 'Published' : 'Draft') : (prompt.author?.username ? `@${prompt.author.username}` : (prompt.author?.full_name || 'Anonymous'))}
                  </p>
                </div>
                {activeTab === 'published' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => navigate(`/edit/${prompt.id}`)}
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeletingId(prompt.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => navigate(`/details/${prompt.id}`)}
                      style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: 'white', fontWeight: 600, fontSize: 14 }}
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!deletingId}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
}
