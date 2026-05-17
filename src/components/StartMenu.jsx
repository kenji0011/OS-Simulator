import React, { useState, useEffect, useRef } from 'react';
import { Search, Power, Lock, Moon, RefreshCw, Clock } from 'lucide-react';
import './StartMenu.css';

const StartMenu = ({ isOpen, apps, onLaunchApp, onClose, onPowerAction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  // Focus input when menu opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      const timer = setTimeout(() => {
        setSearchQuery('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter apps based on search query
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`start-menu ${isOpen ? 'open' : ''}`}>
      {/* Top Search Bar */}
      <div className="start-search-container">
        <Search className="start-search-icon" size={16} />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search for apps, settings, and documents" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="start-search-input"
        />
      </div>

      {/* Pinned Apps Header */}
      <div className="start-pinned-header">
        <span className="start-pinned-title">Pinned</span>
        <button className="start-all-btn">
          <span>All</span>
          <svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" strokeWidth="3" fill="none" style={{ marginLeft: '4px' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Main Grid: Pinned Apps */}
      <div className="start-apps-container scrollbar-hidden">
        {filteredApps.length > 0 ? (
          <div className="start-apps-grid">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              return (
                <button 
                  key={app.id} 
                  className="start-app-item"
                  onClick={() => {
                    onLaunchApp(app.id);
                    onClose();
                  }}
                >
                  <div className="start-app-icon-wrapper">
                    <Icon size={26} color={app.color} strokeWidth={1.5} />
                  </div>
                  <span className="start-app-name">{app.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="start-no-results">
            No matching apps found. Try searching for "Notepad" or "Browser".
          </div>
        )}
      </div>

      {/* Footer Block: User Profile and Power Actions */}
      <div className="start-footer">
        <div className="start-user-profile">
          <div className="start-avatar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="start-user-name">Justine</span>
        </div>
        
        <div className="start-actions-row">
          <button className="start-action-btn" title="Lock" onClick={() => onPowerAction('lock')}>
            <Lock size={16} />
          </button>
          <button className="start-action-btn" title="Sleep" onClick={() => onPowerAction('sleep')}>
            <Moon size={16} />
          </button>
          <button className="start-action-btn" title="Restart" onClick={() => onPowerAction('restart')}>
            <RefreshCw size={16} />
          </button>
          <button className="start-action-btn" title="Sleep Schedule">
            <Clock size={16} />
          </button>
          <button className="start-action-btn start-power-btn" title="Power Options" onClick={() => onPowerAction('sleep')}>
            <Power size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
