import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Copy } from 'lucide-react';
import './Window.css';

const Window = ({ app, onClose, isActive, bringToFront, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Store the normal (pre-maximize) geometry
  const savedGeo = useRef({
    x: Math.max(50, window.innerWidth / 2 - 300),
    y: Math.max(30, window.innerHeight / 2 - 250),
    width: 600,
    height: 400,
  });

  const [pos, setPos] = useState({ x: savedGeo.current.x, y: savedGeo.current.y });
  const [size, setSize] = useState({ width: savedGeo.current.width, height: savedGeo.current.height });

  const toggleMaximize = (e) => {
    e.stopPropagation();
    if (isMaximized) {
      // Restore
      setPos({ x: savedGeo.current.x, y: savedGeo.current.y });
      setSize({ width: savedGeo.current.width, height: savedGeo.current.height });
      setIsMaximized(false);
    } else {
      // Save current geometry then maximize
      savedGeo.current = { x: pos.x, y: pos.y, width: size.width, height: size.height };
      setPos({ x: 0, y: 0 });
      // Fill the desktop-area
      const desktopArea = document.querySelector('.desktop-area');
      if (desktopArea) {
        setSize({ width: desktopArea.clientWidth, height: desktopArea.clientHeight });
      } else {
        setSize({ width: window.innerWidth, height: window.innerHeight - 60 });
      }
      setIsMaximized(true);
    }
    bringToFront();
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return null; // hidden when minimized, taskbar click will restore
  }

  return (
    <Rnd
      position={pos}
      size={size}
      onDragStop={(e, d) => {
        if (!isMaximized) {
          setPos({ x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, dir, ref, delta, position) => {
        if (!isMaximized) {
          setSize({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) });
          setPos(position);
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
      className={`glass-panel window-container ${isMaximized ? 'maximized' : ''}`}
    >
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
          <button className="ctrl-btn close" onClick={(e) => { e.stopPropagation(); onClose(); }}><X size={14} /></button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </Rnd>
  );
};

export default Window;

