import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import { Settings, FileText, FolderClosed, Calculator as CalculatorIcon, Globe, Activity, Crosshair, Monitor } from 'lucide-react';
import Window from './components/Window';

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

const APPS = [
  { id: 'notepad', name: 'Notepad', icon: FileText, color: '#3b82f6', component: Notepad },
  { id: 'filemanager', name: 'File Manager', icon: FolderClosed, color: '#eab308', component: FileManager },
  { id: 'valorant', name: 'VALORANT', icon: Crosshair, color: '#ff4655', component: Valorant },
  { id: 'calculator', name: 'Calculator', icon: CalculatorIcon, color: '#10b981', component: Calculator },
  { id: 'browser', name: 'Browser', icon: Globe, color: '#6366f1', component: Browser },
  { id: 'taskmanager', name: 'CPU Scheduling', icon: Activity, color: '#ef4444', component: TaskManager },
  { id: 'perfmonitor', name: 'Task Manager', icon: Monitor, color: '#c471ed', component: PerformanceMonitor },
];

const PINNED_APPS = ['browser', 'filemanager', 'notepad', 'perfmonitor'];

import { useOS } from './context/OSContext';

function App() {
  const { systemAction, dispatchSystemAction } = useOS();
  const [openApps, setOpenApps] = useState([]);
  const [activeApp, setActiveApp] = useState(null);

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
        // Minimize
        setActiveApp(null);
      } else {
        // Bring to front
        setActiveApp(appId);
      }
    } else {
      // Open
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
  const GRID_W = 100;
  const GRID_H = 110;
  const GRID_PAD = 10; // padding from edges

  const snapToGrid = (x, y) => ({
    x: Math.max(GRID_PAD, Math.round((x - GRID_PAD) / GRID_W) * GRID_W + GRID_PAD),
    y: Math.max(GRID_PAD, Math.round((y - GRID_PAD) / GRID_H) * GRID_H + GRID_PAD),
  });

  // --- Draggable Icon Positions ---
  const [iconPositions, setIconPositions] = useState(() => {
    const positions = {};
    const rows = Math.floor((window.innerHeight - 80) / GRID_H); // icons per column
    APPS.forEach((app, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      positions[app.id] = { x: GRID_PAD + col * GRID_W, y: GRID_PAD + row * GRID_H };
    });
    return positions;
  });

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
      // Snap to nearest grid cell on drop
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

  return (
    <div className="desktop-container">
      {/* Background Aesthetic Curves */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}
        viewBox="0 0 1440 800" preserveAspectRatio="none"
      >
        <path fill="rgba(196, 113, 237, 0.15)" d="M0,400 C300,600 600,200 1440,500 L1440,800 L0,800 Z" />
        <path fill="rgba(236, 72, 153, 0.15)" d="M0,600 C400,300 800,800 1440,600 L1440,800 L0,800 Z" />
        <path fill="rgba(166, 193, 238, 0.2)" d="M0,200 C500,400 900,100 1440,300 L1440,0 L0,0 Z" />
      </svg>

      {/* Desktop Area */}
      <div className="desktop-area">
        {APPS.map((app) => (
          <div 
            key={app.id} 
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions[app.id]?.x ?? 20, top: iconPositions[app.id]?.y ?? 20 }}
            onMouseDown={(e) => onIconMouseDown(e, app.id)}
            onDoubleClick={() => onIconDoubleClick(app.id)}
          >
            <app.icon size={36} color={app.color} strokeWidth={1.5} />
            <span>{app.name}</span>
          </div>
        ))}
        
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
    </div>
  );
}

export default App;
