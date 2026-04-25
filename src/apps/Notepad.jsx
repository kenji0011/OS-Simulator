import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { Save, Printer } from 'lucide-react';

const Notepad = () => {
  const { files, updateFile, addToPrinterQueue, activeNotepadFile, setNotepadFile } = useOS();
  const [text, setText] = useState('');

  // Sync state when active file changes
  useEffect(() => {
    // If no active file is selected globally, select the first one if available
    if (!activeNotepadFile && files.length > 0) {
      setNotepadFile(files[0].id);
    }
    const file = files.find(f => f.id === activeNotepadFile);
    if (file) {
      setText(file.content || '');
    } else {
      setText('');
    }
  }, [activeNotepadFile, files, setNotepadFile]);

  const handleSave = () => {
    if (activeNotepadFile) {
      updateFile(activeNotepadFile, text);
    }
  };

  const handlePrint = () => {
    const file = files.find(f => f.id === activeNotepadFile);
    if (file) {
      addToPrinterQueue(file.name);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #ccc', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Open:</span>
            <select 
                value={activeNotepadFile || ''} 
                onChange={e => setNotepadFile(e.target.value)}
                style={{ padding: '2px 4px', border: '1px solid #ccc', borderRadius: '4px', maxWidth: '200px' }}
            >
                <option value="">-- Select File --</option>
                {files.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} style={{ border: '1px solid #ccc', background: 'white', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Save size={14} /> Save
            </button>
            <button onClick={handlePrint} style={{ border: '1px solid #ccc', background: 'white', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Printer size={14} /> Print (I/O)
            </button>
        </div>
      </div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        disabled={!activeNotepadFile}
        placeholder={activeNotepadFile ? "Type here..." : "Select a file to begin editing."}
        style={{ 
          flex: 1, 
          width: '100%', 
          padding: '10px', 
          border: 'none', 
          resize: 'none',
          outline: 'none',
          fontFamily: 'Consolas, monospace',
          fontSize: '14px',
          background: activeNotepadFile ? 'white' : '#eee'
        }}
        spellCheck="false"
      />
    </div>
  );
};

export default Notepad;
