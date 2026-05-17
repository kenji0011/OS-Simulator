import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Copy } from 'lucide-react';
import './Window.css';

const Window = ({ app, onClose, onMinimize, isMinimized, isActive, bringToFront, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const defaultWidth = app.width || 800;
  const defaultHeight = app.height || 500;

  // Store the normal (pre-maximize) geometry (rounded to prevent subpixel blur)
  const savedGeo = useRef({
    x: Math.round(Math.max(50, window.innerWidth / 2 - defaultWidth / 2)),
    y: Math.round(Math.max(30, window.innerHeight / 2 - defaultHeight / 2)),
    width: Math.round(defaultWidth),
    height: Math.round(defaultHeight),
  });

  const [pos, setPos] = useState({ x: savedGeo.current.x, y: savedGeo.current.y });
  const [size, setSize] = useState({ width: savedGeo.current.width, height: savedGeo.current.height });

  useEffect(() => {
    const windowDom = document.querySelector(`[data-window-app-id="${app.id}"]`);
    if (!windowDom) return;

    const taskbarIcon = document.getElementById(`taskbar-${app.id}`);
    
    if (isMinimized) {
      if (taskbarIcon) {
        const iconRect = taskbarIcon.getBoundingClientRect();
        const windowRect = windowDom.getBoundingClientRect();
        const iconCenterX = iconRect.left + iconRect.width / 2;
        const iconCenterY = iconRect.top + iconRect.height / 2;
        const relativeX = iconCenterX - windowRect.left;
        const relativeY = iconCenterY - windowRect.top;
        
        windowDom.style.transformOrigin = `${relativeX}px ${relativeY}px`;
      } else {
        windowDom.style.transformOrigin = '50% 100%';
      }
    } else {
      // When restoring, keep the already-calculated transform-origin (which is anchored at the taskbar icon)
      // so the window scales out smoothly from the taskbar icon. Reset to center only after animation finishes.
      const timer = setTimeout(() => {
        windowDom.style.transformOrigin = 'center center';
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isMinimized, app.id]);

  const toggleMaximize = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    if (isMaximized) {
      // Restore
      setPos({ x: savedGeo.current.x, y: savedGeo.current.y });
      setSize({ width: savedGeo.current.width, height: savedGeo.current.height });
      setIsMaximized(false);
    } else {
      // Save current geometry then maximize
      savedGeo.current = { x: Math.round(pos.x), y: Math.round(pos.y), width: Math.round(size.width), height: Math.round(size.height) };
      setPos({ x: 0, y: 0 });
      // Fill the desktop-area
      const desktopArea = document.querySelector('.desktop-area');
      if (desktopArea) {
        setSize({ width: Math.round(desktopArea.clientWidth), height: Math.round(desktopArea.clientHeight) });
      } else {
        setSize({ width: Math.round(window.innerWidth), height: Math.round(window.innerHeight - 60) });
      }
      setIsMaximized(true);
    }
    bringToFront();
    setTimeout(() => {
      setIsTransitioning(false);
    }, 350);
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    onMinimize();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsClosing(true);
  };

  const handleAnimationEnd = (e) => {
    // Only trigger actual unmount when the fade-out/closing animation ends
    if (isClosing) {
      onClose();
    }
  };

  return (
    <Rnd
      position={pos}
      size={size}
      onDragStart={() => setIsDraggingOrResizing(true)}
      onDragStop={(e, d) => {
        setIsDraggingOrResizing(false);
        if (!isMaximized) {
          setPos({ x: Math.round(d.x), y: Math.round(d.y) });
        }
      }}
      onResizeStart={() => setIsDraggingOrResizing(true)}
      onResizeStop={(e, dir, ref, delta, position) => {
        setIsDraggingOrResizing(false);
        if (!isMaximized) {
          setSize({ width: Math.round(parseInt(ref.style.width)), height: Math.round(parseInt(ref.style.height)) });
          setPos({ x: Math.round(position.x), y: Math.round(position.y) });
        }
      }}
      minWidth={300}
      minHeight={200}
      bounds=".desktop-area"
      dragHandleClassName="window-titlebar"
      onMouseDown={bringToFront}
      onContextMenu={(e) => {
        e.stopPropagation();
        bringToFront();
      }}
      style={{
        zIndex: isActive ? 1000 : 100,
        display: 'flex',
        flexDirection: 'column',
      }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      className={`glass-panel window-container ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''} ${isClosing ? 'closing' : ''} ${isTransitioning ? 'transition-active' : ''} ${isDraggingOrResizing ? 'dragging' : 'allow-transitions'}`}
      data-window-app-id={app.id}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="window-inner">
        <div className="window-titlebar" onDoubleClick={toggleMaximize}>
          <div className="titlebar-left">
            <app.icon size={16} color={app.color} />
            <span>{app.name}</span>
          </div>
          <div className="titlebar-controls">
            <button className="ctrl-btn minimize" onClick={toggleMinimize}><Minus size={14} /></button>
            <button className="ctrl-btn maximize" onClick={toggleMaximize}>
                {isMaximized ? <Copy size={12} /> : <Square size={12} />}
            </button>
            <button className="ctrl-btn close" onClick={handleClose}><X size={14} /></button>
          </div>
        </div>
        <div className="window-content">
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export default Window;

