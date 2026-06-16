/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { Users, FileText, Trash2, Shield, Copy, Eye, LayoutDashboard, ChevronRight } from 'lucide-react';
import { api, type PromptWithAuthor, type Profile } from '../../lib/api';
import { DeleteConfirmationModal } from '../../components/Modal/DeleteConfirmationModal';
import './AdminScreen.css';

interface AdminScreenProps {
  user: User | null;
}

export function AdminScreen({ user }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<'prompts' | 'users' | 'analytics'>('analytics');
  const [prompts, setPrompts] = useState<PromptWithAuthor[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded check based on the spec
  const isAdmin = user?.email === 'sunnykiran715@gmail.com';

  const loadData = useCallback(async () => {
    setLoading(true);
    if (activeTab === 'prompts' || activeTab === 'analytics') {
      const p = await api.getAllPromptsAdmin();
      setPrompts(p);
    }
    if (activeTab === 'users' || activeTab === 'analytics') {
      const u = await api.getAllUsersAdmin();
      setUsers(u);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setPromptToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promptToDelete) return;
    setIsDeleting(true);
    try {
      await api.deletePrompt(promptToDelete);
      setPrompts(prev => prev.filter(p => p.id !== promptToDelete));
      setDeleteModalOpen(false);
      setPromptToDelete(null);
    } catch (err) {
      console.error('Failed to delete prompt', err);
      alert('Failed to delete prompt.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Analytics Aggregation
  const totalViews = prompts.reduce((sum, p) => sum + (p.views_count || 0), 0);
  const totalCopies = prompts.reduce((sum, p) => sum + (p.copies_count || 0), 0);
  const totalPrompts = prompts.length;
  const totalUsers = users.length;

  return (
    <div className="admin-screen">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <Shield size={24} className="admin-icon" />
          <h2>Admin Portal</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <LayoutDashboard size={18} />
            Analytics
            <ChevronRight size={16} className="chevron" />
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            <FileText size={18} />
            Prompt Management
            <ChevronRight size={16} className="chevron" />
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            User Management
            <ChevronRight size={16} className="chevron" />
          </button>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="admin-profile">
            <span className="admin-badge">Admin</span>
            <span className="admin-email">{user?.email}</span>
          </div>
        </div>

        <div className="admin-main">
          {loading ? (
            <div className="admin-loading">Loading data...</div>
          ) : (
            <>
              {activeTab === 'analytics' && (
                <div className="analytics-grid">
                  <div className="stat-card">
                    <div className="stat-icon bg-blue"><FileText size={20} /></div>
                    <div className="stat-details">
                      <h3>Total Prompts</h3>
                      <p>{totalPrompts}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon bg-green"><Users size={20} /></div>
                    <div className="stat-details">
                      <h3>Total Users</h3>
                      <p>{totalUsers}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon bg-purple"><Eye size={20} /></div>
                    <div className="stat-details">
                      <h3>Total Views</h3>
                      <p>{totalViews}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon bg-orange"><Copy size={20} /></div>
                    <div className="stat-details">
                      <h3>Total Copies</h3>
                      <p>{totalCopies}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prompts' && (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Prompt</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Stats</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prompts.map(prompt => (
                        <tr key={prompt.id}>
                          <td>
                            <div className="td-prompt">
                              {prompt.image_url && <img src={prompt.image_url} alt="" />}
                              <div className="td-prompt-text">
                                <strong>{prompt.title}</strong>
                                <span>{prompt.categories?.[0]?.name || 'Uncategorized'}</span>
                              </div>
                            </div>
                          </td>
                          <td>{prompt.author?.username ? `@${prompt.author.username}` : prompt.author?.full_name}</td>
                          <td>
                            <span className={`status-badge ${prompt.status}`}>
                              {prompt.status}
                            </span>
                          </td>
                          <td>
                            <div className="td-stats">
                              <span><Eye size={14} /> {prompt.views_count}</span>
                              <span><Copy size={14} /> {prompt.copies_count}</span>
                            </div>
                          </td>
                          <td>
                            <button className="btn-icon danger" onClick={() => handleDeleteClick(prompt.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email / ID</th>
                        <th>Joined</th>
                        <th>Subscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="td-user">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" />
                              ) : (
                                <div className="avatar-placeholder">{u.full_name?.[0] || 'U'}</div>
                              )}
                              <div className="td-user-text">
                                <strong>{u.full_name || 'Anonymous'}</strong>
                                <span>@{u.username || 'unknown'}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.id.substring(0, 8)}...</span></td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${u.subscription_tier}`}>
                              {u.subscription_tier?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setPromptToDelete(null);
          }
        }}
      />
    </div>
  );
}
