import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { Save, Printer, Plus, X, ChevronDown, Settings, Bold, Italic, List, Link, Table, Eye, HelpCircle, FileText } from 'lucide-react';
import './Notepad.css';

const Notepad = () => {
  const {
    files, createFile, updateFile, addToPrinterQueue,
    activeNotepadFile, setNotepadFile, dispatchSystemAction, setPrinterTargetFileId,
    theme
  } = useOS();

  const [text, setText] = useState('');
  const [openTabIds, setOpenTabIds] = useState([]);
  
  // Menu dropdown toggles
  const [activeDropdown, setActiveDropdown] = useState(null); // 'file', 'edit', 'view', or null
  
  // Custom font size zoom
  const [fontSize, setFontSize] = useState(14);
  
  // Cursor Tracking
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef(null);

  // Sync open tabs: ensure activeNotepadFile is always in the tab list
  useEffect(() => {
    if (activeNotepadFile && !openTabIds.includes(activeNotepadFile)) {
      setOpenTabIds(prev => [...prev, activeNotepadFile]);
    }
  }, [activeNotepadFile, openTabIds]);

  // Fallback initial tabs if list is empty
  useEffect(() => {
    if (openTabIds.length === 0 && files.length > 0) {
      // Find all text files in the filesystem
      const textFiles = files.filter(f => f.name.endsWith('.txt'));
      if (textFiles.length > 0) {
        setOpenTabIds(textFiles.map(f => f.id));
        setNotepadFile(textFiles[0].id);
      } else {
        // Fallback to first available file
        setOpenTabIds([files[0].id]);
        setNotepadFile(files[0].id);
      }
    }
  }, [files, openTabIds, setNotepadFile]);

  // Sync text when activeNotepadFile changes
  useEffect(() => {
    const file = files.find(f => f.id === activeNotepadFile);
    if (file) {
      setText(file.content || '');
    } else {
      setText('');
    }
  }, [activeNotepadFile, files]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSave = () => {
    if (activeNotepadFile) {
      updateFile(activeNotepadFile, text);
      // Brief feedback
      dispatchSystemAction({
        action: 'NOTIFICATION',
        notification: { title: 'File Saved', message: `Saved changes to ${files.find(f => f.id === activeNotepadFile)?.name || 'file'}.`, type: 'success' }
      });
    }
  };

  const handlePrint = () => {
    const file = files.find(f => f.id === activeNotepadFile);
    if (file) {
      updateFile(activeNotepadFile, text);
      setPrinterTargetFileId(activeNotepadFile);
      addToPrinterQueue({
        fileId: activeNotepadFile,
        name: file.name,
        content: text,
      });
      dispatchSystemAction({ action: 'OPEN_APP', appId: 'printer' });
    }
  };

  // Create a brand new file/tab
  const handleNewTab = () => {
    const tempId = `f_${Date.now()}`;
    const name = `untitled_${Math.floor(Math.random() * 900 + 100)}.txt`;
    
    // Create in filesystem root or default docs folder
    createFile('docs', name, '');
    
    // In next tick, find the created file and open it
    setTimeout(() => {
      const allFiles = files; // reference to sync
      const latestFile = allFiles.find(f => f.name === name);
      if (latestFile) {
        setOpenTabIds(prev => [...prev, latestFile.id]);
        setNotepadFile(latestFile.id);
      }
    }, 100);
  };

  const handleCloseTab = (id, e) => {
    e.stopPropagation();
    const remaining = openTabIds.filter(tid => tid !== id);
    setOpenTabIds(remaining);
    
    if (activeNotepadFile === id) {
      if (remaining.length > 0) {
        setNotepadFile(remaining[remaining.length - 1]);
      } else {
        setNotepadFile(null);
        setText('');
      }
    }
  };

  // Cursor and line/column number calculation
  const updateCursorInfo = () => {
    if (textareaRef.current) {
      const selStart = textareaRef.current.selectionStart;
      const val = textareaRef.current.value;
      const textUpToCursor = val.substring(0, selStart);
      const lines = textUpToCursor.split('\n');
      setCursorPos({
        line: lines.length,
        col: lines[lines.length - 1].length + 1
      });
    }
  };

  // Formatting helpers (Markdown)
  const insertFormatting = (prefix, suffix = '') => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const val = textareaRef.current.value;
      
      const selected = val.substring(start, end);
      const replacement = prefix + selected + suffix;
      
      const newText = val.substring(0, start) + replacement + val.substring(end);
      setText(newText);
      
      // Focus back and set selection
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }, 0);
    }
  };

  // Toolbar Rich insert handlers
  const handleFormatChange = (e) => {
    const val = e.target.value;
    if (val === 'h1') insertFormatting('# ');
    if (val === 'h2') insertFormatting('## ');
    if (val === 'p') insertFormatting('');
    e.target.value = 'default'; // Reset selector
  };

  const isDark = theme === 'dark';
  const activeFile = files.find(f => f.id === activeNotepadFile);

  return (
    <div className={`notepad-window ${isDark ? 'dark' : 'light'}`}>
      
      {/* ===== WINDOW 11 TABS BAR ===== */}
      <div className="notepad-tabbar">
        {openTabIds.map(tid => {
          const file = files.find(f => f.id === tid);
          if (!file) return null;
          const isActive = tid === activeNotepadFile;
          return (
            <div 
              key={tid} 
              className={`notepad-tab ${isActive ? 'active' : ''}`}
              onClick={() => setNotepadFile(tid)}
            >
              <FileText size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <span className="notepad-tab-name">{file.name}</span>
              <button 
                className="notepad-tab-close" 
                onClick={(e) => handleCloseTab(tid, e)}
                title="Close Tab"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
        <button 
          className="notepad-add-tab-btn" 
          onClick={handleNewTab}
          title="New Tab (Ctrl+N)"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* ===== WINDOW 11 MENU BAR ===== */}
      <div className="notepad-menubar">
        <div className="notepad-menu-left">
          {/* File Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              className="notepad-menu-btn"
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'file' ? null : 'file'); }}
            >
              File
            </button>
            {activeDropdown === 'file' && (
              <div className="notepad-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="notepad-dropdown-item" onClick={() => { handleNewTab(); setActiveDropdown(null); }}>
                  <Plus size={14} /> New Tab
                </button>
                <button className="notepad-dropdown-item" onClick={() => { handleSave(); setActiveDropdown(null); }} disabled={!activeNotepadFile}>
                  <Save size={14} /> Save (Ctrl+S)
                </button>
                <button className="notepad-dropdown-item" onClick={() => { handlePrint(); setActiveDropdown(null); }} disabled={!activeNotepadFile}>
                  <Printer size={14} /> Print (I/O)
                </button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                <button className="notepad-dropdown-item" onClick={() => { if (activeNotepadFile) handleCloseTab(activeNotepadFile, { stopPropagation: () => {} }); setActiveDropdown(null); }} disabled={!activeNotepadFile}>
                  <X size={14} /> Close Tab
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              className="notepad-menu-btn"
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'edit' ? null : 'edit'); }}
            >
              Edit
            </button>
            {activeDropdown === 'edit' && (
              <div className="notepad-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="notepad-dropdown-item" onClick={() => { setText(''); setActiveDropdown(null); }} disabled={!activeNotepadFile}>
                  Clear All
                </button>
                <button className="notepad-dropdown-item" onClick={() => { setText(t => t.toUpperCase()); setActiveDropdown(null); }} disabled={!activeNotepadFile}>
                  Make Uppercase
                </button>
                <button className="notepad-dropdown-item" onClick={() => { setText(t => t.toLowerCase()); setActiveDropdown(null); }} disabled={!activeNotepadFile}>
                  Make Lowercase
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              className="notepad-menu-btn"
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'view' ? null : 'view'); }}
            >
              View
            </button>
            {activeDropdown === 'view' && (
              <div className="notepad-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="notepad-dropdown-item" onClick={() => { setFontSize(f => Math.min(32, f + 2)); setActiveDropdown(null); }}>
                  Zoom In (+)
                </button>
                <button className="notepad-dropdown-item" onClick={() => { setFontSize(f => Math.max(10, f - 2)); setActiveDropdown(null); }}>
                  Zoom Out (-)
                </button>
                <button className="notepad-dropdown-item" onClick={() => { setFontSize(14); setActiveDropdown(null); }}>
                  Reset Zoom (100%)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Settings App Bridge */}
        <button 
          className="notepad-menu-btn" 
          onClick={() => dispatchSystemAction({ action: 'OPEN_APP', appId: 'settings' })}
          title="Personalization Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* ===== WINDOW 11 TOOLBARROW ===== */}
      <div className="notepad-toolbar">
        {/* Style Dropdown */}
        <select 
          className="notepad-toolbar-select" 
          defaultValue="default"
          onChange={handleFormatChange}
          disabled={!activeNotepadFile}
        >
          <option value="default" disabled>Heading Style</option>
          <option value="p">Paragraph</option>
          <option value="h1">Header 1 (#)</option>
          <option value="h2">Header 2 (##)</option>
        </select>

        <div className="notepad-toolbar-divider" />

        {/* Formatting Buttons */}
        <button 
          className="notepad-toolbar-btn" 
          onClick={() => insertFormatting('**', '**')} 
          title="Bold (**)"
          disabled={!activeNotepadFile}
        >
          <Bold size={13} />
        </button>
        <button 
          className="notepad-toolbar-btn" 
          onClick={() => insertFormatting('*', '*')} 
          title="Italic (*)"
          disabled={!activeNotepadFile}
        >
          <Italic size={13} />
        </button>
        <button 
          className="notepad-toolbar-btn" 
          onClick={() => insertFormatting('- ')} 
          title="Bullet List (-)"
          disabled={!activeNotepadFile}
        >
          <List size={13} />
        </button>
        <button 
          className="notepad-toolbar-btn" 
          onClick={() => insertFormatting('[', '](url)')} 
          title="Hyperlink"
          disabled={!activeNotepadFile}
        >
          <Link size={13} />
        </button>
        <button 
          className="notepad-toolbar-btn" 
          onClick={() => insertFormatting('| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n')} 
          title="Insert Table"
          disabled={!activeNotepadFile}
        >
          <Table size={13} />
        </button>

        <div className="notepad-toolbar-divider" style={{ marginLeft: 'auto' }} />

        {/* Printing Quick-Spooler */}
        <button 
          className="notepad-toolbar-btn" 
          onClick={handlePrint}
          title="Print to System Spooler"
          disabled={!activeNotepadFile}
          style={{ color: '#a78bfa' }}
        >
          <Printer size={14} />
        </button>
      </div>

      {/* ===== MAIN WORKSPACE ===== */}
      <textarea 
        ref={textareaRef}
        value={text} 
        onChange={(e) => setText(e.target.value)}
        onKeyDown={updateCursorInfo}
        onKeyUp={updateCursorInfo}
        onMouseDown={updateCursorInfo}
        onFocus={updateCursorInfo}
        disabled={!activeNotepadFile}
        placeholder={activeNotepadFile ? "Start typing..." : "Please select or open a file tab to begin editing."}
        className="notepad-editor"
        style={{ 
          fontSize: `${fontSize}px`,
        }}
        spellCheck="false"
      />

      {/* ===== WINDOW 11 STATUS BAR ===== */}
      <div className="notepad-statusbar">
        <div className="notepad-status-item">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </div>
        <div className="notepad-status-item">
          {text.length} characters
        </div>
        <div className="notepad-status-item">
          Plain text
        </div>
        <div className="notepad-status-item">
          {Math.round((fontSize / 14) * 100)}%
        </div>
        <div className="notepad-status-item">
          Windows (CRLF)
        </div>
        <div className="notepad-status-item">
          UTF-8
        </div>
      </div>
    </div>
  );
};

export default Notepad;
