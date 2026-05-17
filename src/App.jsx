import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import './App.css';
import { Settings, FileText, FolderClosed, Calculator as CalculatorIcon, Globe, Activity, Crosshair, Monitor, Printer, MemoryStick, File as FileIcon } from 'lucide-react';
import Window from './components/Window';
import ContextMenu, { WALLPAPERS, COLOR_SCHEMES, ICON_SIZES } from './components/ContextMenu';

const WindowsIcon = ({ size = 24, color = "#fff" }) => (
  <svg viewBox="0 0 88 88" width={size} height={size}>
    <rect x="0" y="0" width="40" height="40" fill={color} />
    <rect x="44" y="0" width="40" height="40" fill={color} />
    <rect x="0" y="44" width="40" height="40" fill={color} />
    <rect x="44" y="44" width="40" height="40" fill={color} />
  </svg>
);

import Notepad from './apps/Notepad';
import FileManager from './apps/FileManager';
import Calculator from './apps/Calculator';
import Browser from './apps/Browser';
import TaskManager from './apps/TaskManager';
import Valorant from './apps/Valorant';
import PerformanceMonitor from './apps/PerformanceMonitor';
import PrinterSimulator from './apps/PrinterSimulator';
import MemoryManager from './apps/MemoryManager';

const APPS = [
  { id: 'notepad', name: 'Notepad', icon: FileText, color: '#3b82f6', component: Notepad },
  { id: 'filemanager', name: 'File Manager', icon: FolderClosed, color: '#eab308', component: FileManager },
  { id: 'valorant', name: 'VALORANT', icon: Crosshair, color: '#ff4655', component: Valorant },
  { id: 'calculator', name: 'Calculator', icon: CalculatorIcon, color: '#10b981', component: Calculator },
  { id: 'browser', name: 'Browser', icon: Globe, color: '#6366f1', component: Browser },
  { id: 'taskmanager', name: 'CPU Scheduling', icon: Activity, color: '#ef4444', component: TaskManager },
  { id: 'perfmonitor', name: 'Task Manager', icon: Monitor, color: '#c471ed', component: PerformanceMonitor },
  { id: 'printer', name: 'Print Spooler', icon: Printer, color: '#a78bfa', component: PrinterSimulator },
  { id: 'memmanager', name: 'Memory Manager', icon: MemoryStick, color: '#ec4899', component: MemoryManager },
];

const PINNED_APPS = ['browser', 'filemanager', 'notepad', 'perfmonitor', 'memmanager'];

import { useOS } from './context/OSContext';

// ===== Color Scheme CSS Variables =====
const SCHEME_VARS = {
  rose: {
    '--accent-purple': '#f43f5e',
    '--accent-pink': '#fda4af',
    '--taskbar-bg': 'linear-gradient(90deg, rgba(159, 18, 57, 0.95) 0%, rgba(120, 10, 60, 0.95) 100%)',
  },
  purple: {
    '--accent-purple': '#a855f7',
    '--accent-pink': '#d8b4fe',
    '--taskbar-bg': 'linear-gradient(90deg, rgba(100, 12, 50, 0.95) 0%, rgba(50, 10, 80, 0.95) 100%)',
  },
  blue: {
    '--accent-purple': '#3b82f6',
    '--accent-pink': '#93c5fd',
    '--taskbar-bg': 'linear-gradient(90deg, rgba(30, 58, 138, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)',
  },
  teal: {
    '--accent-purple': '#14b8a6',
    '--accent-pink': '#99f6e4',
    '--taskbar-bg': 'linear-gradient(90deg, rgba(15, 80, 72, 0.95) 0%, rgba(13, 148, 136, 0.95) 100%)',
  },
  amber: {
    '--accent-purple': '#f59e0b',
    '--accent-pink': '#fde68a',
    '--taskbar-bg': 'linear-gradient(90deg, rgba(146, 64, 14, 0.95) 0%, rgba(180, 83, 9, 0.95) 100%)',
  },
  emerald: {
    '--accent-purple': '#10b981',
    '--accent-pink': '#6ee7b7',
    '--taskbar-bg': 'linear-gradient(90deg, rgba(6, 78, 59, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
  },
};

const DARK_THEME_VARS = {
  '--bg-gradient': 'radial-gradient(circle at 15% 15%, #1a1625 0%, transparent 50%), radial-gradient(circle at 85% 85%, #0f172a 0%, transparent 50%), linear-gradient(135deg, #0f0f1a 0%, #1a1025 100%)',
  '--glass-bg': 'rgba(25, 25, 35, 0.65)',
  '--glass-border': 'rgba(255, 255, 255, 0.08)',
  '--glass-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
  '--window-bg': 'rgba(25, 25, 40, 0.85)',
  '--window-header': 'rgba(30, 30, 45, 0.9)',
  '--text-dark': '#e2e8f0',
  '--text-muted': '#94a3b8',
};

const LIGHT_THEME_VARS = {
  '--bg-gradient': 'radial-gradient(circle at 15% 15%, #fce7f3 0%, transparent 50%), radial-gradient(circle at 85% 85%, #ede9fe 0%, transparent 50%), linear-gradient(135deg, #f8fafc 0%, #f3e8ff 100%)',
  '--glass-bg': 'rgba(255, 255, 255, 0.45)',
  '--glass-border': 'rgba(255, 255, 255, 0.6)',
  '--glass-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  '--window-bg': 'rgba(255, 255, 255, 0.7)',
  '--window-header': 'rgba(255, 255, 255, 0.85)',
  '--text-dark': '#2d3748',
  '--text-muted': '#4a5568',
};

function App() {
  const {
    systemAction, dispatchSystemAction, createFile, createFolder,
    getFolder, setNotepadFile, setFileManagerTargetFolderId
  } = useOS();
  const [openApps, setOpenApps] = useState([]);
  const [activeApp, setActiveApp] = useState(null);

  // ===== Desktop Personalization =====
  const [theme, setTheme] = useState('light');
  const [colorScheme, setColorScheme] = useState('purple');
  const [wallpaper, setWallpaper] = useState('none');
  const [iconSizeId, setIconSizeId] = useState('medium');
  const [contextMenu, setContextMenu] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Apply theme & color scheme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const themeVars = theme === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
    const schemeVars = SCHEME_VARS[colorScheme] || SCHEME_VARS.purple;

    Object.entries({ ...themeVars, ...schemeVars }).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also set the taskbar bg
    root.style.setProperty('--taskbar-bg', schemeVars['--taskbar-bg']);

    // Set body class for dark mode
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, [theme, colorScheme]);

  // Get active icon size config
  const iconCfg = useMemo(() => ICON_SIZES.find(s => s.id === iconSizeId) || ICON_SIZES[1], [iconSizeId]);

  // Find wallpaper URL
  const wallpaperUrl = useMemo(() => {
    const wp = WALLPAPERS.find(w => w.id === wallpaper);
    return wp?.thumbnail || null;
  }, [wallpaper]);
  const desktopItems = getFolder('desktop')?.children || [];

  React.useEffect(() => {
    if (systemAction?.action === 'OPEN_APP') {
      if (!openApps.includes(systemAction.appId)) {
        setOpenApps(prev => [...prev, systemAction.appId]);
      }
      setActiveApp(systemAction.appId);
      dispatchSystemAction(null);
    }
  }, [systemAction, openApps, dispatchSystemAction]);

  const toggleApp = (appId) => {
    if (openApps.includes(appId)) {
      if (activeApp === appId) {
        setActiveApp(null);
      } else {
        setActiveApp(appId);
      }
    } else {
      setOpenApps([...openApps, appId]);
      setActiveApp(appId);
    }
  };

  const closeApp = (appId) => {
    setOpenApps(openApps.filter(id => id !== appId));
    if (activeApp === appId) {
      setActiveApp(null);
    }
  };

  // Quick clock for taskbar
  const [time, setTime] = useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Snap-to-Grid Settings ---
  const GRID_W = iconCfg.boxW + 20;
  const GRID_H = iconCfg.boxH + 20;
  const GRID_PAD = 10;

  const snapToGrid = (x, y) => ({
    x: Math.max(GRID_PAD, Math.round((x - GRID_PAD) / GRID_W) * GRID_W + GRID_PAD),
    y: Math.max(GRID_PAD, Math.round((y - GRID_PAD) / GRID_H) * GRID_H + GRID_PAD),
  });

  // --- Draggable Icon Positions ---
  const [iconPositions, setIconPositions] = useState(() => {
    const positions = {};
    const rows = Math.floor((window.innerHeight - 80) / GRID_H);
    APPS.forEach((app, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      positions[app.id] = { x: GRID_PAD + col * GRID_W, y: GRID_PAD + row * GRID_H };
    });
    return positions;
  });

  // Recalculate icon positions when icon size changes
  useEffect(() => {
    const gridW = iconCfg.boxW + 20;
    const gridH = iconCfg.boxH + 20;
    const rows = Math.floor((window.innerHeight - 80) / gridH);
    const positions = {};
    APPS.forEach((app, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      positions[app.id] = { x: GRID_PAD + col * gridW, y: GRID_PAD + row * gridH };
    });
    setIconPositions(positions);
  }, [iconSizeId]);

  const dragRef = useRef({ isDragging: false, appId: null, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const onIconMouseDown = useCallback((e, appId) => {
    e.preventDefault();
    const pos = iconPositions[appId];
    dragRef.current = { isDragging: true, appId, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };

    const onMouseMove = (ev) => {
      const d = dragRef.current;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
      if (!d.moved) return;
      setIconPositions(prev => ({ ...prev, [d.appId]: { x: d.origX + dx, y: d.origY + dy } }));
    };

    const onMouseUp = () => {
      dragRef.current.isDragging = false;
      setIconPositions(prev => {
        const raw = prev[dragRef.current.appId];
        if (!raw) return prev;
        return { ...prev, [dragRef.current.appId]: snapToGrid(raw.x, raw.y) };
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [iconPositions]);

  const onIconDoubleClick = useCallback((appId) => {
    if (!dragRef.current.moved) {
      toggleApp(appId);
    }
  }, []);

  const openDesktopItem = useCallback((item) => {
    if (dragRef.current.moved) return;

    if (item.type === 'file') {
      setNotepadFile(item.id);
      dispatchSystemAction({ action: 'OPEN_APP', appId: 'notepad' });
    } else {
      setFileManagerTargetFolderId(item.id);
      dispatchSystemAction({ action: 'OPEN_APP', appId: 'filemanager' });
    }
  }, [dispatchSystemAction, setFileManagerTargetFolderId, setNotepadFile]);

  // ===== Right-Click Context Menu =====
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    // Only show when clicking the desktop area, not on icons or windows
    if (e.target.closest('.desktop-icon') || e.target.closest('.window-container') || e.target.closest('.taskbar')) return;
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    // Recalculate positions
    const gridW = iconCfg.boxW + 20;
    const gridH = iconCfg.boxH + 20;
    const rows = Math.floor((window.innerHeight - 80) / gridH);
    const positions = {};
    APPS.forEach((app, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      positions[app.id] = { x: GRID_PAD + col * gridW, y: GRID_PAD + row * gridH };
    });
    setIconPositions(positions);
  }, [iconCfg]);

  const handleNewFolder = useCallback(() => {
    createFolder('desktop', `New Folder`);
  }, [createFolder]);

  const handleNewFile = useCallback(() => {
    createFile('desktop', `New File.txt`, '');
  }, [createFile]);

  // F5 keyboard shortcut for refresh
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleRefresh();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRefresh]);

  // Background wave colors adapt to theme
  const waveColors = theme === 'dark'
    ? {
        wave1: 'rgba(196, 113, 237, 0.08)',
        wave2: 'rgba(236, 72, 153, 0.06)',
        wave3: 'rgba(166, 193, 238, 0.08)',
      }
    : {
        wave1: 'rgba(196, 113, 237, 0.15)',
        wave2: 'rgba(236, 72, 153, 0.15)',
        wave3: 'rgba(166, 193, 238, 0.2)',
      };

  return (
    <div className="desktop-container" onContextMenu={handleContextMenu}>
      {/* Background Wallpaper or Gradient Curves */}
      {wallpaperUrl ? (
        <div
          className="desktop-wallpaper"
          style={{
            backgroundImage: `url(${wallpaperUrl})`,
          }}
        />
      ) : (
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}
          viewBox="0 0 1440 800" preserveAspectRatio="none"
        >
          <path fill={waveColors.wave1} d="M0,400 C300,600 600,200 1440,500 L1440,800 L0,800 Z" />
          <path fill={waveColors.wave2} d="M0,600 C400,300 800,800 1440,600 L1440,800 L0,800 Z" />
          <path fill={waveColors.wave3} d="M0,200 C500,400 900,100 1440,300 L1440,0 L0,0 Z" />
        </svg>
      )}

      {/* Desktop Area */}
      <div className="desktop-area" key={refreshKey}>
        {APPS.map((app) => (
          <div 
            key={app.id} 
            className="desktop-icon"
            style={{
              position: 'absolute',
              left: iconPositions[app.id]?.x ?? 20,
              top: iconPositions[app.id]?.y ?? 20,
              width: iconCfg.boxW,
              height: iconCfg.boxH,
            }}
            onMouseDown={(e) => onIconMouseDown(e, app.id)}
            onDoubleClick={() => onIconDoubleClick(app.id)}
          >
            <app.icon size={iconCfg.iconPx} color={app.color} strokeWidth={1.5} />
            <span style={{ fontSize: iconCfg.labelPx }}>{app.name}</span>
          </div>
        ))}

        {desktopItems.map((item, i) => {
          const rowOffset = APPS.length + i;
          const rows = Math.max(1, Math.floor((window.innerHeight - 80) / GRID_H));
          const col = Math.floor(rowOffset / rows);
          const row = rowOffset % rows;
          const left = GRID_PAD + col * GRID_W;
          const top = GRID_PAD + row * GRID_H;
          const Icon = item.type === 'folder' ? FolderClosed : FileIcon;
          const color = item.type === 'folder' ? '#eab308' : '#3b82f6';

          return (
            <div
              key={item.id}
              className="desktop-icon"
              style={{
                position: 'absolute',
                left,
                top,
                width: iconCfg.boxW,
                height: iconCfg.boxH,
              }}
              onDoubleClick={() => openDesktopItem(item)}
            >
              <Icon size={iconCfg.iconPx} color={color} strokeWidth={1.5} />
              <span style={{ fontSize: iconCfg.labelPx }}>{item.name}</span>
            </div>
          );
        })}
        
        {/* Render open windows */}
        {openApps.map(appId => {
          const app = APPS.find(a => a.id === appId);
          const AppContent = app.component;
          return (
            <Window 
              key={app.id}
              app={app} 
              onClose={() => closeApp(app.id)}
              isActive={activeApp === app.id}
              bringToFront={() => setActiveApp(app.id)}
            >
              <AppContent />
            </Window>
          );
        })}
      </div>

      {/* Taskbar */}
      <div className="taskbar glass-panel">
        <div className="taskbar-center">
          <button className="taskbar-icon start-btn" onClick={() => toggleApp('taskmanager')}>
            <WindowsIcon size={24} color="#fff" />
          </button>
          
          {APPS.filter(app => PINNED_APPS.includes(app.id) || openApps.includes(app.id)).map((app) => (
              <button 
                key={`taskbar-${app.id}`}
                className={`taskbar-icon ${openApps.includes(app.id) ? 'opened' : ''} ${activeApp === app.id ? 'active' : ''}`}
                title={app.name}
                onClick={() => toggleApp(app.id)}
              >
                <app.icon size={22} color={app.color} />
              </button>
          ))}
        </div>
        
        <div className="taskbar-right">
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <Settings size={18} />
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRefresh={handleRefresh}
          onNewFolder={handleNewFolder}
          onNewFile={handleNewFile}
          theme={theme}
          setTheme={setTheme}
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          wallpaper={wallpaper}
          setWallpaper={setWallpaper}
          iconSize={iconSizeId}
          setIconSize={setIconSizeId}
        />
      )}
    </div>
  );
}

export default App;
