import React, { useState, useEffect } from 'react';
import { Printer, RotateCcw, Check, Minus, Plus, CheckCircle } from 'lucide-react';
import { useOS } from '../context/OSContext';

const PAPER_SIZES = {
  'A4': { name: 'A4', width: 210, height: 297, label: '210 × 297 mm' },
  'Letter': { name: 'US Letter', width: 216, height: 279, label: '8.5 × 11 in' },
  'Legal': { name: 'US Legal', width: 216, height: 356, label: '8.5 × 14 in' },
  'A3': { name: 'A3', width: 297, height: 420, label: '297 × 420 mm' },
};

const PrinterSimulator = () => {
  const {
    files, printerQueue, addToPrinterQueue, completePrintJob,
    printHistory, clearPrintHistory
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

  useEffect(() => {
    if (!selectedFileId && files.length > 0) setSelectedFileId(files[0].id);
  }, [files, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId);
  const fileContent = selectedFile?.content || '';
  const fileName = selectedFile?.name || 'No file selected';

  const paper = PAPER_SIZES[paperSize];
  const isLandscape = orientation === 'landscape';
  const marginPx = margins === 'narrow' ? 12 : margins === 'wide' ? 32 : 20;

  const handlePrint = () => {
    if (!selectedFile || isPrinting) return;
    setIsPrinting(true);
    setPrintProgress(0);
    setPrintPhase('feeding');
    setShowSuccess(false);
    addToPrinterQueue(fileName);

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
        const job = printerQueue.find(j => j.status === 'queued' || j.status === 'printing');
        if (job) completePrintJob(job.id);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 80);
  };

  // Calculate preview paper dimensions to fit the available space
  const PREVIEW_MAX_H = 420;
  const ratio = isLandscape ? paper.width / paper.height : paper.height / paper.width;
  const previewH = Math.min(PREVIEW_MAX_H, 400);
  const previewW = previewH / ratio;

  return (
    <div style={{ height: '100%', display: 'flex', background: '#1a1a2e', color: '#e0e0e0', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* ===== LEFT: Print Settings ===== */}
      <div style={{ width: '280px', minWidth: '280px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Printer size={20} color="#a78bfa" />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Print</span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Document */}
          <Section title="Document">
            <Label>Select File</Label>
            <select
              value={selectedFileId}
              onChange={e => setSelectedFileId(e.target.value)}
              style={selectStyle}
            >
              <option value="">-- Select File --</option>
              {files.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            {selectedFile && (
              <div style={{ fontSize: '11px', color: '#666', display: 'flex', gap: '10px', marginTop: '2px' }}>
                <span>{selectedFile.size || fileContent.length} bytes</span>
                <span>{fileContent.split('\n').length} lines</span>
              </div>
            )}
          </Section>

          {/* Paper Size */}
          <Section title="Paper Size">
            <select style={selectStyle} value={paperSize} onChange={e => setPaperSize(e.target.value)}>
              {Object.entries(PAPER_SIZES).map(([key, p]) => (
                <option key={key} value={key}>{p.name} ({p.label})</option>
              ))}
            </select>
          </Section>

          {/* Orientation */}
          <Section title="Orientation">
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
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
            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ToggleBtn active={colorMode === 'bw'} onClick={() => setColorMode('bw')}>B&W</ToggleBtn>
              <ToggleBtn active={colorMode === 'color'} onClick={() => setColorMode('color')}>Color</ToggleBtn>
            </div>
            <Label>Margins</Label>
            <select style={selectStyle} value={margins} onChange={e => setMargins(e.target.value)}>
              <option value="narrow">Narrow</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
            <Label>Copies</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button style={counterBtn} onClick={() => setCopies(Math.max(1, copies - 1))}><Minus size={14} /></button>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', minWidth: '24px', textAlign: 'center' }}>{copies}</span>
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
              background: (isPrinting || !selectedFile) ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: (isPrinting || !selectedFile) ? '#666' : '#fff',
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

          {/* Recent Prints */}
          {printHistory.length > 0 && (
            <Section title={`Recent Prints (${printHistory.length})`} extra={
              <button onClick={clearPrintHistory} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '10px' }}>Clear</button>
            }>
              {printHistory.slice(0, 5).map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <CheckCircle size={12} color="#10b981" />
                  <span style={{ flex: 1, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                  <span style={{ color: '#555', flexShrink: 0 }}>{doc.completedAt}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>

      {/* ===== RIGHT: Print Preview ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Preview Header */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Print Preview</span>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888' }}>
            <span>{PAPER_SIZES[paperSize].name}</span>
            <span>{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
            <span>{copies} {copies > 1 ? 'copies' : 'copy'}</span>
          </div>
        </div>

        {/* Paper Preview */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', padding: '20px', overflow: 'auto' }}>
          <div style={{
            width: `${previewW}px`, height: `${previewH}px`,
            background: '#fff', borderRadius: '3px', position: 'relative',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
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
        <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#888', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isPrinting ? '#f59e0b' : '#10b981',
              animation: isPrinting ? 'pulse 1s infinite' : 'none'
            }} />
            <span>{isPrinting ? `Printing — ${printPhase}` : 'Printer Ready'}</span>
          </div>
          {isPrinting && (
            <div style={{ flex: 1, maxWidth: '200px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
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

// --- Helper Components ---
const Section = ({ title, extra, children }) => (
  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title}</span>
      {extra}
    </div>
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {children}
    </div>
  </div>
);

const Label = ({ children }) => (
  <span style={{ fontSize: '11px', color: '#aaa', display: 'block' }}>{children}</span>
);

const ToggleBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    flex: 1, padding: '7px', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: 600, textAlign: 'center',
    background: active ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0.2)',
    color: active ? '#a5b4fc' : '#888', transition: 'all 0.2s'
  }}>
    {children}
  </button>
);

const selectStyle = {
  width: '100%', padding: '7px 10px', borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)',
  color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer'
};

const counterBtn = {
  width: '28px', height: '28px', borderRadius: '6px', border: 'none',
  background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export default PrinterSimulator;
