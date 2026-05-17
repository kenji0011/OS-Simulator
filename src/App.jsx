import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import './App.css';
import { Settings, FileText, FolderClosed, Calculator as CalculatorIcon, Globe, Activity, Crosshair, Monitor, Printer, MemoryStick, File as FileIcon, Music, HardDrive } from 'lucide-react';
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
import SettingsApp from './apps/SettingsApp';
import Spotify from './apps/Spotify';
import DiskManagement from './apps/DiskManagement';
import CalendarFlyout from './components/CalendarFlyout';
import StartMenu from './components/StartMenu';

const APPS = [
  { id: 'notepad', name: 'Notepad', icon: FileText, color: '#3b82f6', component: Notepad, width: 700, height: 680 },
  { id: 'filemanager', name: 'File Manager', icon: FolderClosed, color: '#eab308', component: FileManager, width: 950, height: 750 },
  { id: 'valorant', name: 'VALORANT', icon: Crosshair, color: '#ff4655', component: Valorant, width: 1050, height: 750 },
  { id: 'calculator', name: 'Calculator', icon: CalculatorIcon, color: '#10b981', component: Calculator, width: 350, height: 580 },
  { id: 'browser', name: 'Browser', icon: Globe, color: '#6366f1', component: Browser, width: 1000, height: 780 },
  { id: 'taskmanager', name: 'CPU Scheduling', icon: Activity, color: '#ef4444', component: TaskManager, width: 1000, height: 780 },
  { id: 'perfmonitor', name: 'Task Manager', icon: Monitor, color: '#c471ed', component: PerformanceMonitor, width: 900, height: 720 },
  { id: 'printer', name: 'Print Spooler', icon: Printer, color: '#a78bfa', component: PrinterSimulator, width: 850, height: 720 },
  { id: 'memmanager', name: 'Memory Manager', icon: MemoryStick, color: '#ec4899', component: MemoryManager, width: 950, height: 750 },
  { id: 'settings', name: 'Settings', icon: Settings, color: '#64748b', component: SettingsApp, width: 850, height: 700 },
  { id: 'spotify', name: 'SpotiFly', icon: Music, color: '#1DB954', component: Spotify, width: 980, height: 720 },
  { id: 'diskmgmt', name: 'Disk Management', icon: HardDrive, color: '#a855f7', component: DiskManagement, width: 960, height: 720 },
];

const PINNED_APPS = ['browser', 'filemanager', 'notepad', 'perfmonitor', 'memmanager', 'spotify', 'diskmgmt', 'settings'];

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
    getFolder, setNotepadFile, setFileManagerTargetFolderId,
    theme, setTheme,
    colorScheme, setColorScheme,
    wallpaper, setWallpaper,
    iconSizeId, setIconSizeId,
    deleteItem, renameItem
  } = useOS();
  const [openApps, setOpenApps] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [minimizedApps, setMinimizedApps] = useState([]);
  const [hoveredAppId, setHoveredAppId] = useState(null);

  // ===== Desktop Personalization =====
  const [contextMenu, setContextMenu] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCalendarFlyout, setShowCalendarFlyout] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isAsleep, setIsAsleep] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [renamingItemId, setRenamingItemId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

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

  // Close Start Menu and Calendar Flyout on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.start-menu') && !e.target.closest('.start-btn')) {
        setShowStartMenu(false);
      }
      if (!e.target.closest('.calendar-flyout') && !e.target.closest('.taskbar-clock-btn')) {
        setShowCalendarFlyout(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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
      const appId = systemAction.appId;
      if (!openApps.includes(appId)) {
        setOpenApps(prev => [...prev, appId]);
      }
      setMinimizedApps(prev => prev.filter(id => id !== appId));
      setActiveApp(appId);
      dispatchSystemAction(null);
    }
  }, [systemAction, openApps, dispatchSystemAction]);

  const toggleApp = (appId) => {
    const isOpen = openApps.includes(appId);
    const isMinimized = minimizedApps.includes(appId);
    const isActive = activeApp === appId;

    if (isOpen) {
      if (isMinimized) {
        setMinimizedApps(prev => prev.filter(id => id !== appId));
        setActiveApp(appId);
      } else if (isActive) {
        setMinimizedApps(prev => [...prev, appId]);
        setActiveApp(null);
      } else {
        setActiveApp(appId);
      }
    } else {
      setOpenApps(prev => [...prev, appId]);
      setMinimizedApps(prev => prev.filter(id => id !== appId));
      setActiveApp(appId);
    }
  };

  const minimizeApp = (appId) => {
    if (!minimizedApps.includes(appId)) {
      setMinimizedApps(prev => [...prev, appId]);
    }
    if (activeApp === appId) {
      const remainingOpen = openApps.filter(id => id !== appId && !minimizedApps.includes(id));
      if (remainingOpen.length > 0) {
        setActiveApp(remainingOpen[remainingOpen.length - 1]);
      } else {
        setActiveApp(null);
      }
    }
  };

  const closeApp = (appId) => {
    setOpenApps(prev => prev.filter(id => id !== appId));
    setMinimizedApps(prev => prev.filter(id => id !== appId));
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

  const getIconPosition = useCallback((appId) => {
    if (iconPositions[appId]) return iconPositions[appId];
    
    // Dynamic calculation fallback
    const idx = APPS.findIndex(a => a.id === appId);
    const gridW = iconCfg.boxW + 20;
    const gridH = iconCfg.boxH + 20;
    const rows = Math.max(1, Math.floor((window.innerHeight - 80) / gridH));
    const col = Math.floor(idx / rows);
    const row = idx % rows;
    return { x: GRID_PAD + col * gridW, y: GRID_PAD + row * gridH };
  }, [iconPositions, iconCfg]);

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
    const pos = getIconPosition(appId);
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
        const raw = prev[dragRef.current.appId] || getIconPosition(dragRef.current.appId);
        if (!raw) return prev;
        return { ...prev, [dragRef.current.appId]: snapToGrid(raw.x, raw.y) };
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [iconPositions, getIconPosition]);

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
    // Shift + Right-Click bypasses custom context menu to allow native 'Inspect Element'
    if (e.shiftKey) return;
    
    e.preventDefault();
    
    // Check if right-clicking a desktop icon
    const iconEl = e.target.closest('.desktop-icon');
    if (iconEl) {
      const appId = iconEl.getAttribute('data-app-id');
      const itemId = iconEl.getAttribute('data-item-id');
      
      if (itemId) {
        const item = desktopItems.find(i => i.id === itemId);
        if (item) {
          setContextMenu({ x: e.clientX, y: e.clientY, item });
        }
      } else if (appId) {
        const app = APPS.find(a => a.id === appId);
        if (app) {
          setContextMenu({ x: e.clientX, y: e.clientY, app });
        }
      }
      return;
    }
    
    if (e.target.closest('.window-container') || e.target.closest('.taskbar')) return;
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, [desktopItems]);

  const handleFinishRename = (itemId) => {
    if (renameValue.trim()) {
      renameItem(itemId, renameValue.trim());
    }
    setRenamingItemId(null);
  };

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

  const renderPreviewMockup = (appId) => {
    switch (appId) {
      case 'notepad':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', height: '100%' }}>
            <div style={{ height: '7px', width: '75%', background: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.3)', borderRadius: '2px' }} />
            <div style={{ height: '5px', width: '90%', background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: '2px' }} />
            <div style={{ height: '5px', width: '80%', background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: '2px' }} />
            <div style={{ height: '5px', width: '45%', background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: '2px' }} />
          </div>
        );
      case 'browser':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px', height: '100%' }}>
            <div style={{ height: '12px', width: '100%', background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: '6px', color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
              https://google.com
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)', letterSpacing: '0.5px' }}>Google</div>
            </div>
          </div>
        );
      case 'spotify':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', height: '100%', background: 'rgba(29, 185, 84, 0.12)' }}>
            <div style={{ width: '32px', height: '32px', background: '#191414', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #1DB954' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
              <div style={{ height: '6px', width: '80%', background: theme === 'dark' ? '#fff' : '#111827', borderRadius: '2px' }} />
              <div style={{ height: '4px', width: '50%', background: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', borderRadius: '2px' }} />
              <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: theme === 'dark' ? '#fff' : '#1f2937' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: theme === 'dark' ? '#fff' : '#1f2937' }} />
              </div>
            </div>
          </div>
        );
      case 'calculator':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', padding: '6px', height: '100%' }}>
            <div style={{ gridColumn: 'span 4', height: '12px', background: theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)', borderRadius: '2px' }} />
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '1.5px', height: '6px' }} />
            ))}
          </div>
        );
      case 'settings':
        return (
          <div style={{ display: 'flex', gap: '8px', padding: '6px', height: '100%' }}>
            <div style={{ width: '22px', background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '3px', padding: '3px' }}>
              <div style={{ height: '3px', background: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)', borderRadius: '1px' }} />
              <div style={{ height: '3px', background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: '1px' }} />
              <div style={{ height: '3px', background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: '1px' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', padding: '2px' }}>
              <div style={{ height: '7px', width: '55%', background: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.25)', borderRadius: '2px' }} />
              <div style={{ height: '5px', width: '85%', background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '2px' }} />
              <div style={{ height: '5px', width: '75%', background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '2px' }} />
            </div>
          </div>
        );
      case 'perfmonitor':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', height: '100%' }}>
            <div style={{ height: '7px', width: '60%', background: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', borderRadius: '2px' }} />
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)' }}>
              <svg viewBox="0 0 100 30" style={{ width: '100%', height: '100%', fill: 'none' }}>
                <path d="M0 20 L20 15 L40 25 L60 8 L80 18 L100 5" stroke="#a855f7" strokeWidth="2" />
              </svg>
            </div>
          </div>
        );
      case 'memmanager':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', height: '100%' }}>
            <div style={{ height: '6px', width: '70%', background: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)', borderRadius: '2px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', flex: 1 }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.3)', borderRadius: '2px' }} />
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', borderRadius: '2px' }} />
              <div style={{ background: 'rgba(236, 72, 153, 0.3)', borderRadius: '2px' }} />
              <div style={{ background: 'rgba(236, 72, 153, 0.15)', borderRadius: '2px' }} />
            </div>
          </div>
        );
      case 'diskmgmt':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px', height: '100%' }}>
            <div style={{ height: '6px', width: '65%', background: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.3)', borderRadius: '2.5px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Disk 0 Mockup */}
              <div style={{ height: '14px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderRadius: '3px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: '15px', background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />
                <div style={{ width: '10px', background: 'rgba(168, 85, 247, 0.2)', borderRight: '1px solid rgba(168, 85, 247, 0.4)' }} />
                <div style={{ flex: 1, background: 'rgba(168, 85, 247, 0.1)', borderRight: '1px solid rgba(168, 85, 247, 0.4)' }} />
                <div style={{ width: '12px', background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px)' }} />
              </div>
              {/* Disk 1 Mockup */}
              <div style={{ height: '14px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderRadius: '3px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: '15px', background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />
                <div style={{ flex: 1, background: 'rgba(168, 85, 247, 0.1)' }} />
              </div>
            </div>
          </div>
        );
      default:
        const appInfo = APPS.find(a => a.id === appId) || {};
        const AppIcon = appInfo.icon;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '6px' }}>
            {AppIcon && <AppIcon size={20} color={appInfo.color || '#fff'} style={{ opacity: 0.65 }} />}
            <div style={{ height: '4px', width: '42px', background: theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)', borderRadius: '2px' }} />
          </div>
        );
    }
  };

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
      {/* Windows 11 Power Overlays */}
      {isRestarting && (
        <div className="restart-screen">
          <div className="restart-spinner"></div>
          <div className="restart-text">Restarting...</div>
        </div>
      )}
      
      {isAsleep && (
        <div className="sleep-screen" onClick={() => setIsAsleep(false)}>
          <div className="sleep-led"></div>
          <div className="sleep-text">Click anywhere to wake up</div>
        </div>
      )}
      
      {isLocked && (
        <div className="lockscreen">
          <div className="lockscreen-content">
            <div className="lockscreen-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="lockscreen-date">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <button className="lockscreen-unlock-btn" onClick={() => setIsLocked(false)}>Sign In</button>
          </div>
        </div>
      )}

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
            data-app-id={app.id}
            style={{
              position: 'absolute',
              left: getIconPosition(app.id).x,
              top: getIconPosition(app.id).y,
              width: iconCfg.boxW,
              height: iconCfg.boxH,
            }}
            onMouseDown={(e) => onIconMouseDown(e, app.id)}
            onDoubleClick={(e) => onIconDoubleClick(app.id)}
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
              data-item-id={item.id}
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
              {renamingItemId === item.id ? (
                <input
                  className="desktop-icon-rename-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFinishRename(item.id);
                    } else if (e.key === 'Escape') {
                      setRenamingItemId(null);
                    }
                  }}
                  onBlur={() => handleFinishRename(item.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  style={{
                    width: '90%',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid var(--accent-purple)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    textAlign: 'center',
                    outline: 'none',
                    padding: '2px 4px',
                    marginTop: '4px',
                    zIndex: 10
                  }}
                />
              ) : (
                <span style={{ fontSize: iconCfg.labelPx }}>{item.name}</span>
              )}
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
              onMinimize={() => minimizeApp(app.id)}
              isMinimized={minimizedApps.includes(app.id)}
              isActive={activeApp === app.id}
              bringToFront={() => {
                setMinimizedApps(prev => prev.filter(id => id !== app.id));
                setActiveApp(app.id);
              }}
            >
              <AppContent />
            </Window>
          );
        })}
      </div>

      {/* Taskbar */}
      <div className="taskbar glass-panel">
        <div className="taskbar-center">
          <button 
            className={`taskbar-icon start-btn ${showStartMenu ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowStartMenu(!showStartMenu);
            }}
          >
            <WindowsIcon size={24} color="#00a2ed" />
          </button>
          
          {APPS.filter(app => PINNED_APPS.includes(app.id) || openApps.includes(app.id)).map((app) => {
            const isOpened = openApps.includes(app.id);
            const isMinimized = minimizedApps.includes(app.id);
            return (
              <div 
                key={`taskbar-item-${app.id}`}
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  if (isOpened) setHoveredAppId(app.id);
                }}
                onMouseLeave={() => setHoveredAppId(null)}
              >
                <button 
                  id={`taskbar-${app.id}`}
                  className={`taskbar-icon ${isOpened ? 'opened' : ''} ${activeApp === app.id ? 'active' : ''}`}
                  onClick={() => {
                    toggleApp(app.id);
                    setHoveredAppId(null);
                  }}
                >
                  <app.icon size={22} color={app.color} />
                </button>
                
                {/* Taskbar Window Preview Card */}
                {hoveredAppId === app.id && isOpened && (
                  <div className="taskbar-preview-card glass-panel">
                    <div className="taskbar-preview-header">
                      <app.icon size={12} color={app.color} />
                      <span>{app.name}</span>
                      {isMinimized && <span className="preview-status-badge">minimized</span>}
                    </div>
                    <div className="taskbar-preview-content">
                      {renderPreviewMockup(app.id)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="taskbar-right">
          <div 
            className="taskbar-clock-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowCalendarFlyout(!showCalendarFlyout);
            }}
          >
            <span style={{ fontWeight: 500 }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{time.toLocaleDateString()}</span>
          </div>
          <button 
            onClick={() => toggleApp('settings')}
            className="taskbar-right-settings-btn"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Start Menu */}
      <StartMenu 
        isOpen={showStartMenu}
        apps={APPS}
        onLaunchApp={(appId, recommendedFileId) => {
          if (recommendedFileId) {
            setNotepadFile(recommendedFileId);
          }
          toggleApp(appId);
        }}
        onClose={() => setShowStartMenu(false)}
        onPowerAction={(action) => {
          if (action === 'lock') {
            setIsLocked(true);
          } else if (action === 'sleep') {
            setIsAsleep(true);
          } else if (action === 'restart') {
            setIsRestarting(true);
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }}
      />

      {/* Calendar Flyout */}
      {showCalendarFlyout && (
        <CalendarFlyout onClose={() => setShowCalendarFlyout(false)} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          app={contextMenu.app}
          onClose={() => setContextMenu(null)}
          onRefresh={handleRefresh}
          onNewFolder={handleNewFolder}
          onNewFile={handleNewFile}
          onOpenItem={(item) => openDesktopItem(item)}
          onOpenApp={(appId) => toggleApp(appId)}
          onRenameItem={(item) => {
            setRenamingItemId(item.id);
            setRenameValue(item.name);
          }}
          onDeleteItem={(item) => deleteItem(item.id)}
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
