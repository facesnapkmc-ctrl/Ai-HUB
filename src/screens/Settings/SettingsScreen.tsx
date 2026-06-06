import { ChevronRight, LogOut } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import './SettingsScreen.css';

interface SettingsScreenProps {
  onNavigate: (screenId: string) => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { theme } = useTheme();
  return (
    <div className="settings-screen">
      
      <div className="settings-section">
        <h3 className="section-label">ACCOUNT</h3>
        <div className="settings-card">
          <button className="settings-item" onClick={() => onNavigate('edit-profile')}>
            <span>Edit Profile</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
          <div className="divider"></div>
          <button className="settings-item" onClick={() => onNavigate('subscription')}>
            <span>Subscription</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
          <div className="divider"></div>
          <button className="settings-item" onClick={() => onNavigate('billing')}>
            <span>Billing Details</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-label">APPEARANCE</h3>
        <div className="settings-card">
          <button className="settings-item" onClick={() => onNavigate('theme')}>
            <span>Theme</span>
            <div className="item-value">
              <span className="value-text" style={{ textTransform: 'capitalize' }}>{theme}</span>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-label">SUPPORT</h3>
        <div className="settings-card">
          <button className="settings-item" onClick={() => onNavigate('help-center')}>
            <span>Help Center</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-label">LEGAL</h3>
        <div className="settings-card">
          <button className="settings-item" onClick={() => onNavigate('privacy-policy')}>
            <span>Privacy Policy</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
          <div className="divider"></div>
          <button className="settings-item" onClick={() => onNavigate('terms-of-service')}>
            <span>Terms of Service</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-label">ACCOUNT ACTIONS</h3>
        <div className="settings-card">
          <button className="settings-item text-danger" onClick={() => onNavigate('sign-out')}>
            <div className="settings-icon-wrapper danger">
              <LogOut size={20} />
            </div>
            <span>Log out</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>
      
      <div className="app-version">
        <p>Version 1.0.0</p>
        <p>AI Creator Hub</p>
      </div>
    </div>
  );
}
