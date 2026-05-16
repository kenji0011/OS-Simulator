import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw, Maximize2, FolderPlus, FilePlus, Image, Palette,
  Sun, Moon, ChevronRight, Check, Monitor
} from 'lucide-react';
import './ContextMenu.css';

const WALLPAPERS = [
  { id: 'none', name: 'Default (Gradient)', thumbnail: null },
  { id: 'ocean', name: 'Deep Ocean', thumbnail: '/wallpapers/ocean.png' },
  { id: 'aurora', name: 'Aurora Borealis', thumbnail: '/wallpapers/aurora.png' },
  { id: 'sunset', name: 'Golden Sunset', thumbnail: '/wallpapers/sunset.png' },
  { id: 'forest', name: 'Misty Forest', thumbnail: '/wallpapers/forest.png' },
  { id: 'minimal', name: 'Pastel Minimal', thumbnail: '/wallpapers/minimal.png' },
];

const COLOR_SCHEMES = [
  { id: 'rose',    name: 'Rose',    accent: '#f43f5e', preview: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  { id: 'purple',  name: 'Purple',  accent: '#a855f7', preview: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
  { id: 'blue',    name: 'Blue',    accent: '#3b82f6', preview: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'teal',    name: 'Teal',    accent: '#14b8a6', preview: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
  { id: 'amber',   name: 'Amber',   accent: '#f59e0b', preview: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'emerald', name: 'Emerald', accent: '#10b981', preview: 'linear-gradient(135deg, #10b981, #059669)' },
];

const ICON_SIZES = [
  { id: 'small',  name: 'Small',  iconPx: 28, labelPx: 11, boxW: 64, boxH: 72 },
  { id: 'medium', name: 'Medium', iconPx: 36, labelPx: 13, boxW: 80, boxH: 90 },
  { id: 'large',  name: 'Large',  iconPx: 48, labelPx: 14, boxW: 100, boxH: 110 },
];

export default function ContextMenu({
  x, y, onClose,
  // Desktop actions
  onRefresh,
  onNewFolder,
  onNewFile,
  // Theme
  theme, setTheme,
  colorScheme, setColorScheme,
  wallpaper, setWallpaper,
  iconSize, setIconSize,
}) {
  const [submenu, setSubmenu] = useState(null); // 'iconSize' | 'wallpaper' | 'theme'
  const menuRef = useRef(null);
  const submenuTimerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Adjust position so menu stays within viewport
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let nx = x, ny = y;
      if (x + rect.width > window.innerWidth) nx = window.innerWidth - rect.width - 8;
      if (y + rect.height > window.innerHeight - 60) ny = window.innerHeight - 60 - rect.height - 8;
      if (nx !== x || ny !== y) setPos({ x: nx, y: ny });
    }
  }, [x, y]);

  const handleSubmenuEnter = (name) => {
    clearTimeout(submenuTimerRef.current);
    setSubmenu(name);
  };
  const handleSubmenuLeave = () => {
    submenuTimerRef.current = setTimeout(() => setSubmenu(null), 200);
  };

  return (
    <div className="ctx-menu-backdrop" onContextMenu={(e) => e.preventDefault()}>
      <div
        ref={menuRef}
        className={`ctx-menu glass-panel ${theme === 'dark' ? 'ctx-dark' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      >
        {/* Refresh */}
        <button className="ctx-item" onClick={() => { onRefresh(); onClose(); }}>
          <RefreshCw size={15} />
          <span>Refresh</span>
          <span className="ctx-shortcut">F5</span>
        </button>

        <div className="ctx-separator" />

        {/* Icon Size */}
        <div
          className={`ctx-item ctx-has-sub ${submenu === 'iconSize' ? 'ctx-sub-open' : ''}`}
          onMouseEnter={() => handleSubmenuEnter('iconSize')}
          onMouseLeave={handleSubmenuLeave}
        >
          <Maximize2 size={15} />
          <span>Icon Size</span>
          <ChevronRight size={14} className="ctx-chevron" />

          {submenu === 'iconSize' && (
            <div className={`ctx-submenu glass-panel ${theme === 'dark' ? 'ctx-dark' : ''}`}
                 onMouseEnter={() => handleSubmenuEnter('iconSize')}
                 onMouseLeave={handleSubmenuLeave}>
              {ICON_SIZES.map(s => (
                <button key={s.id} className="ctx-item" onClick={() => { setIconSize(s.id); onClose(); }}>
                  {iconSize === s.id && <Check size={14} className="ctx-check" />}
                  <span style={{ marginLeft: iconSize === s.id ? 0 : 22 }}>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ctx-separator" />

        {/* New Folder */}
        <button className="ctx-item" onClick={() => { onNewFolder(); onClose(); }}>
          <FolderPlus size={15} />
          <span>New Folder</span>
        </button>

        {/* New File */}
        <button className="ctx-item" onClick={() => { onNewFile(); onClose(); }}>
          <FilePlus size={15} />
          <span>New File</span>
        </button>

        <div className="ctx-separator" />

        {/* Wallpaper */}
        <div
          className={`ctx-item ctx-has-sub ${submenu === 'wallpaper' ? 'ctx-sub-open' : ''}`}
          onMouseEnter={() => handleSubmenuEnter('wallpaper')}
          onMouseLeave={handleSubmenuLeave}
        >
          <Image size={15} />
          <span>Wallpaper</span>
          <ChevronRight size={14} className="ctx-chevron" />

          {submenu === 'wallpaper' && (
            <div className={`ctx-submenu ctx-wallpaper-grid glass-panel ${theme === 'dark' ? 'ctx-dark' : ''}`}
                 onMouseEnter={() => handleSubmenuEnter('wallpaper')}
                 onMouseLeave={handleSubmenuLeave}>
              <div className="ctx-wp-label">Choose Wallpaper</div>
              <div className="ctx-wp-grid">
                {WALLPAPERS.map(wp => (
                  <button
                    key={wp.id}
                    className={`ctx-wp-thumb ${wallpaper === wp.id ? 'ctx-wp-active' : ''}`}
                    onClick={() => { setWallpaper(wp.id); onClose(); }}
                    title={wp.name}
                  >
                    {wp.thumbnail ? (
                      <img src={wp.thumbnail} alt={wp.name} />
                    ) : (
                      <div className="ctx-wp-default-preview" />
                    )}
                    {wallpaper === wp.id && <div className="ctx-wp-check"><Check size={16} /></div>}
                    <span>{wp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme */}
        <div
          className={`ctx-item ctx-has-sub ${submenu === 'theme' ? 'ctx-sub-open' : ''}`}
          onMouseEnter={() => handleSubmenuEnter('theme')}
          onMouseLeave={handleSubmenuLeave}
        >
          <Palette size={15} />
          <span>Theme</span>
          <ChevronRight size={14} className="ctx-chevron" />

          {submenu === 'theme' && (
            <div className={`ctx-submenu ctx-theme-panel glass-panel ${theme === 'dark' ? 'ctx-dark' : ''}`}
                 onMouseEnter={() => handleSubmenuEnter('theme')}
                 onMouseLeave={handleSubmenuLeave}>
              <div className="ctx-wp-label">Mode</div>
              <div className="ctx-theme-modes">
                <button
                  className={`ctx-mode-btn ${theme === 'light' ? 'ctx-mode-active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={18} />
                  <span>Light</span>
                </button>
                <button
                  className={`ctx-mode-btn ${theme === 'dark' ? 'ctx-mode-active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={18} />
                  <span>Dark</span>
                </button>
              </div>
              <div className="ctx-wp-label" style={{ marginTop: 8 }}>Color Scheme</div>
              <div className="ctx-color-grid">
                {COLOR_SCHEMES.map(cs => (
                  <button
                    key={cs.id}
                    className={`ctx-color-swatch ${colorScheme === cs.id ? 'ctx-color-active' : ''}`}
                    style={{ background: cs.preview }}
                    title={cs.name}
                    onClick={() => { setColorScheme(cs.id); }}
                  >
                    {colorScheme === cs.id && <Check size={14} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { WALLPAPERS, COLOR_SCHEMES, ICON_SIZES };
