import React, { useState, useEffect, useRef } from 'react';
import { Printer, RotateCcw, Check, Minus, Plus, CheckCircle } from 'lucide-react';
import { useOS } from '../context/OSContext';

const PAPER_SIZES = {
  'A4': { name: 'A4', width: 210, height: 297, label: '210 × 297 mm' },
  'Letter': { name: 'US Letter', width: 216, height: 279, label: '8.5 × 11 in' },
  'Legal': { name: 'US Legal', width: 216, height: 356, label: '8.5 × 14 in' },
  'A3': { name: 'A3', width: 297, height: 420, label: '297 × 420 mm' },
};

const CustomDropdown = ({ value, onChange, options, isDark, placeholder = "Select option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 9999 : 1 }}>
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        type="button"
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '6px',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ccc',
          background: isDark ? 'rgba(0,0,0,0.3)' : '#fff',
          color: isDark ? '#fff' : '#000',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          boxShadow: isDark ? '0 2px 5px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            opacity: 0.7,
            stroke: 'currentColor',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }}
        >
          <path d="M1 1L5 5L9 1" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: isDark ? 'rgba(30, 30, 45, 0.98)' : '#fff',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            maxHeight: '200px',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            padding: '4px',
            zIndex: 999999
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: option.value === value 
                  ? (isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.1)')
                  : 'transparent',
                color: option.value === value
                  ? (isDark ? '#a5b4fc' : '#4f46e5')
                  : (isDark ? '#e2e8f0' : '#374151'),
                fontSize: '13px',
                textAlign: 'left',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
              {option.value === value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="10 3 4.5 8.5 2 6" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PrinterSimulator = () => {
  const {
    files, printerQueue, addToPrinterQueue, completePrintJob,
    printHistory, clearPrintHistory, activeNotepadFile, lastSavedFileId,
    printerTargetFileId, setPrinterTargetFileId, lastQueuedFileId, lastQueuedJobId,
    theme
  } = useOS();

  const [selectedFileId, setSelectedFileId] = useState('');
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('bw');
  const [margins, setMargins] = useState('normal');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printPhase, setPrintPhase] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const lastPreferredFileId = useRef(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const printerTargetFile = files.find(f => f.id === printerTargetFileId);
    if (printerTargetFile && selectedFileId !== printerTargetFile.id) {
      setSelectedFileId(printerTargetFile.id);
      return;
    }

    const preferredFileId = printerTargetFileId || lastQueuedFileId || activeNotepadFile || lastSavedFileId;
    const preferredMarker = lastQueuedJobId || preferredFileId;
    const preferredFile = files.find(f => f.id === preferredFileId);
    const selectedFileExists = files.some(f => f.id === selectedFileId);

    if (preferredFile && preferredMarker !== lastPreferredFileId.current) {
      setSelectedFileId(preferredFile.id);
      lastPreferredFileId.current = preferredMarker;
    } else if ((!selectedFileId || !selectedFileExists) && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  }, [activeNotepadFile, files, lastQueuedFileId, lastQueuedJobId, lastSavedFileId, printerTargetFileId, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId);
  const fileContent = selectedFile?.content || '';
  const fileName = selectedFile?.name || 'No file selected';

  const paper = PAPER_SIZES[paperSize];
  const isLandscape = orientation === 'landscape';
  const marginPx = margins === 'narrow' ? 12 : margins === 'wide' ? 32 : 20;

  const fileOptions = [
    { value: '', label: '-- Select File --' },
    ...files.map(f => ({ value: f.id, label: f.name }))
  ];

  const paperOptions = Object.entries(PAPER_SIZES).map(([key, p]) => ({
    value: key,
    label: `${p.name} (${p.label})`
  }));

  const marginOptions = [
    { value: 'narrow', label: 'Narrow' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Wide' }
  ];

  const handlePrint = () => {
    if (!selectedFile || isPrinting) return;
    setIsPrinting(true);
    setPrintProgress(0);
    setPrintPhase('feeding');
    setShowSuccess(false);
    const queuedJob = addToPrinterQueue({
      fileId: selectedFile.id,
      name: fileName,
      content: fileContent,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setPrintProgress(progress);
      if (progress <= 15) setPrintPhase('feeding');
      else if (progress <= 85) setPrintPhase('printing');
      else if (progress <= 95) setPrintPhase('ejecting');
      if (progress >= 100) {
        clearInterval(interval);
        setPrintPhase('done');
        setIsPrinting(false);
        setShowSuccess(true);
        completePrintJob(queuedJob.id);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 80);
  };

  // Calculate preview paper dimensions to fit the available space dynamically
  const ratio = isLandscape ? paper.width / paper.height : paper.height / paper.width;
  const previewH = Math.min(viewportHeight - 220, 680);
  const previewW = previewH / ratio;

  // --- Dynamic Styled Components ---
  const Section = ({ title, extra, children }) => (
    <div style={{ 
      background: isDark ? 'rgba(0,0,0,0.2)' : '#f9fafb', 
      borderRadius: '8px', 
      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e5e7eb' 
    }}>
      <div style={{ 
        padding: '8px 12px', fontSize: '11px', fontWeight: 700, 
        textTransform: 'uppercase', letterSpacing: '0.5px', 
        color: isDark ? '#888' : '#64748b', 
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <span>{title}</span>
        {extra}
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </div>
    </div>
  );

  const Label = ({ children }) => (
    <span style={{ fontSize: '11px', color: isDark ? '#aaa' : '#475569', display: 'block' }}>{children}</span>
  );

  const ToggleBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '7px', border: 'none', cursor: 'pointer',
      fontSize: '12px', fontWeight: 600, textAlign: 'center',
      background: active 
        ? (isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)') 
        : (isDark ? 'rgba(0,0,0,0.2)' : '#f3f4f6'),
      color: active ? (isDark ? '#a5b4fc' : '#4f46e5') : (isDark ? '#888' : '#4b5563'), 
      transition: 'all 0.2s',
      borderRadius: '4px',
      margin: '2px'
    }}>
      {children}
    </button>
  );

  const selectStyle = {
    width: '100%', padding: '7px 10px', borderRadius: '6px',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ccc', 
    background: isDark ? 'rgba(0,0,0,0.3)' : '#fff',
    color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none', cursor: 'pointer'
  };

  const counterBtn = {
    width: '28px', height: '28px', borderRadius: '6px', border: 'none',
    background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', 
    color: isDark ? '#fff' : '#1e293b', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  };

  return (
    <div style={{ height: '100%', display: 'flex', background: isDark ? '#1a1a2e' : '#f3f4f6', color: isDark ? '#e0e0e0' : '#1e293b', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* ===== LEFT: Print Settings ===== */}
      <div style={{ width: '280px', minWidth: '280px', borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: isDark ? '#1a1a2e' : '#fff' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Printer size={20} color="#a78bfa" />
          <span style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#fff' : '#000' }}>Print</span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Document */}
          <Section title="Document">
            <Label>Select File</Label>
            <CustomDropdown
              value={selectedFileId}
              onChange={val => {
                setSelectedFileId(val);
                setPrinterTargetFileId(null);
              }}
              options={fileOptions}
              isDark={isDark}
              placeholder="-- Select File --"
            />
            {selectedFile && (
              <div style={{ fontSize: '11px', color: isDark ? '#666' : '#64748b', display: 'flex', gap: '10px', marginTop: '2px' }}>
                <span>{selectedFile.size || fileContent.length} bytes</span>
                <span>{fileContent.split('\n').length} lines</span>
              </div>
            )}
          </Section>

          {/* Paper Size */}
          <Section title="Paper Size">
            <CustomDropdown
              value={paperSize}
              onChange={val => setPaperSize(val)}
              options={paperOptions}
              isDark={isDark}
            />
          </Section>

          {/* Orientation */}
          <Section title="Orientation">
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', background: isDark ? 'transparent' : '#f3f4f6' }}>
              <ToggleBtn active={orientation === 'portrait'} onClick={() => setOrientation('portrait')}>
                <span style={{ display: 'inline-block', width: '10px', height: '14px', border: '2px solid currentColor', borderRadius: '1px', marginRight: '6px', verticalAlign: 'middle' }} />
                Portrait
              </ToggleBtn>
              <ToggleBtn active={orientation === 'landscape'} onClick={() => setOrientation('landscape')}>
                <span style={{ display: 'inline-block', width: '14px', height: '10px', border: '2px solid currentColor', borderRadius: '1px', marginRight: '6px', verticalAlign: 'middle' }} />
                Landscape
              </ToggleBtn>
            </div>
          </Section>

          {/* Color / Margins / Copies */}
          <Section title="Options">
            <Label>Color</Label>
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb', background: isDark ? 'transparent' : '#f3f4f6' }}>
              <ToggleBtn active={colorMode === 'bw'} onClick={() => setColorMode('bw')}>B&W</ToggleBtn>
              <ToggleBtn active={colorMode === 'color'} onClick={() => setColorMode('color')}>Color</ToggleBtn>
            </div>
            <Label>Margins</Label>
            <CustomDropdown
              value={margins}
              onChange={val => setMargins(val)}
              options={marginOptions}
              isDark={isDark}
            />
            <Label style={{ marginTop: '4px' }}>Copies</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button style={counterBtn} onClick={() => setCopies(Math.max(1, copies - 1))}><Minus size={14} /></button>
              <span style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#fff' : '#000', minWidth: '24px', textAlign: 'center' }}>{copies}</span>
              <button style={counterBtn} onClick={() => setCopies(Math.min(99, copies + 1))}><Plus size={14} /></button>
            </div>
          </Section>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={isPrinting || !selectedFile}
            style={{
              padding: '12px', borderRadius: '10px', border: 'none',
              cursor: (isPrinting || !selectedFile) ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: 700, width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: (isPrinting || !selectedFile) ? (isDark ? 'rgba(99,102,241,0.2)' : '#e5e7eb') : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: (isPrinting || !selectedFile) ? (isDark ? '#666' : '#9ca3af') : '#fff',
              boxShadow: (isPrinting || !selectedFile) ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
            }}
          >
            {isPrinting ? (
              <><RotateCcw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Printing... {printProgress}%</>
            ) : showSuccess ? (
              <><Check size={16} /> Printed!</>
            ) : (
              <><Printer size={16} /> Print Document</>
            )}
          </button>

          {/* Queued Jobs */}
          <Section title={`Queue (${printerQueue.length})`}>
            {printerQueue.length === 0 ? (
              <div style={{ fontSize: '12px', color: isDark ? '#666' : '#64748b', padding: '4px 0' }}>No documents waiting.</div>
            ) : (
              printerQueue.map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '6px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb' }}>
                  <Printer size={13} color="#a78bfa" />
                  <span style={{ flex: 1, color: isDark ? '#ddd' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                  <span style={{ color: isDark ? '#666' : '#64748b', flexShrink: 0 }}>{doc.addedAt}</span>
                </div>
              ))
            )}
          </Section>

          {/* Recent Prints */}
          {printHistory.length > 0 && (
            <Section title={`Recent Prints (${printHistory.length})`} extra={
              <button onClick={clearPrintHistory} style={{ background: 'none', border: 'none', color: isDark ? '#666' : '#64748b', cursor: 'pointer', fontSize: '10px' }}>Clear</button>
            }>
              {printHistory.slice(0, 5).map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '4px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #e5e7eb' }}>
                  <CheckCircle size={12} color="#10b981" />
                  <span style={{ flex: 1, color: isDark ? '#ccc' : '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                  <span style={{ color: isDark ? '#555' : '#9ca3af', flexShrink: 0 }}>{doc.completedAt}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>

      {/* ===== RIGHT: Print Preview ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Preview Header */}
        <div style={{ padding: '10px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: isDark ? '#1a1a2e' : '#fff' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#fff' : '#000' }}>Print Preview</span>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: isDark ? '#888' : '#64748b' }}>
            <span>{PAPER_SIZES[paperSize].name}</span>
            <span>{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
            <span>{copies} {copies > 1 ? 'copies' : 'copy'}</span>
          </div>
        </div>

        {/* Paper Preview */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(0,0,0,0.15)' : '#e2e8f0', padding: '20px', overflow: 'auto' }}>
          <div style={{
            width: `${previewW}px`, height: `${previewH}px`,
            background: '#fff', borderRadius: '3px', position: 'relative',
            boxShadow: isDark 
              ? '0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' 
              : '0 8px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            transition: 'width 0.4s, height 0.4s',
          }}>
            {/* Paper content */}
            <div style={{ padding: `${marginPx}px`, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ fontSize: '8px', color: '#999', marginBottom: '6px', paddingBottom: '4px', borderBottom: '0.5px solid #ddd', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
                <span>{fileName}</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              {/* Content */}
              <div style={{
                flex: 1, fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: '10px', lineHeight: '1.7', color: '#222',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'hidden'
              }}>
                {fileContent || <span style={{ color: '#ccc', fontStyle: 'italic' }}>No content to preview</span>}
              </div>
              {/* Footer */}
              <div style={{ fontSize: '7px', color: '#bbb', marginTop: '6px', paddingTop: '4px', borderTop: '0.5px solid #ddd', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
                <span>Page 1 of 1</span>
                <span>{PAPER_SIZES[paperSize].name} · {orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
              </div>
            </div>

            {/* Print animation overlay */}
            {isPrinting && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '3px', overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: `${printProgress}%`,
                  background: 'rgba(99,102,241,0.08)',
                  borderBottom: printPhase === 'printing' ? '2px solid rgba(99,102,241,0.6)' : 'none',
                  transition: 'height 0.08s linear'
                }} />
                <div style={{
                  position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                  padding: '3px 10px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.9)', color: '#fff',
                  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.5px', whiteSpace: 'nowrap'
                }}>
                  {printPhase === 'feeding' && '📄 Loading Paper...'}
                  {printPhase === 'printing' && '🖨️ Printing...'}
                  {printPhase === 'ejecting' && '📤 Ejecting...'}
                  {printPhase === 'done' && '✅ Complete'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div style={{ padding: '8px 20px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: isDark ? '#888' : '#4b5563', flexShrink: 0, background: isDark ? '#1a1a2e' : '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isPrinting ? '#f59e0b' : '#10b981',
              animation: isPrinting ? 'pulse 1s infinite' : 'none'
            }} />
            <span>{isPrinting ? `Printing — ${printPhase}` : 'Printer Ready'}</span>
          </div>
          {isPrinting && (
            <div style={{ flex: 1, maxWidth: '200px', height: '4px', borderRadius: '2px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${printProgress}%`, height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', transition: 'width 0.08s linear' }} />
            </div>
          )}
          <div style={{ flex: 1 }} />
          <span>Printer: OS-Sim Virtual Printer</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default PrinterSimulator;
