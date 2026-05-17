import React, { useState, useEffect, useRef } from 'react';
import { Delete, Trash2, Clock, X, ChevronRight } from 'lucide-react';
import { useOS } from '../context/OSContext';

const Calculator = () => {
  const { theme } = useOS();
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState('');
  const [historyLog, setHistoryLog] = useState([]);
  
  // Responsive tracking based on actual container size
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  const [isRad, setIsRad] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Determine layout mode based on actual component width
  const isWide = containerWidth > 540;

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistory('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (val !== 0) setDisplay(String(-val));
  };

  const inputPercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const performOperation = (nextOp) => {
    const current = parseFloat(display);

    if (prevValue !== null && operator && !waitingForOperand) {
      let result;
      switch (operator) {
        case '+': result = prevValue + current; break;
        case '−': result = prevValue - current; break;
        case '×': result = prevValue * current; break;
        case '÷': result = current !== 0 ? prevValue / current : 'Error'; break;
        case 'Mod': result = prevValue % current; break;
        case '^': result = Math.pow(prevValue, current); break;
        default: result = current;
      }

      const resultStr = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
      
      if (nextOp === '=') {
        const formula = `${prevValue} ${operator} ${current} =`;
        setHistory(formula);
        setHistoryLog(prev => [{ formula, result: resultStr }, ...prev]);
      }

      setDisplay(resultStr);
      setPrevValue(nextOp === '=' ? null : (result === 'Error' ? 0 : result));
      setOperator(nextOp === '=' ? null : nextOp);
    } else {
      if (nextOp !== '=') {
        setPrevValue(current);
        setOperator(nextOp);
        setHistory(`${current} ${nextOp}`);
      }
    }
    setWaitingForOperand(true);
  };

  const scientificButtons = [
    [
      { label: isRad ? 'Rad' : 'Deg', type: 'sci', action: () => setIsRad(!isRad) },
      { label: 'π', type: 'sci', action: () => setDisplay(String(parseFloat(Math.PI.toFixed(10)))) },
      { label: 'e', type: 'sci', action: () => setDisplay(String(parseFloat(Math.E.toFixed(10)))) },
    ],
    [
      { label: 'x³', type: 'sci', action: () => { const v = parseFloat(display); setDisplay(String(parseFloat((v*v*v).toFixed(10)))); } },
      { label: 'xʸ', type: 'sci', action: () => performOperation('^') },
      { label: '10ˣ', type: 'sci', action: () => setDisplay(String(parseFloat(Math.pow(10, parseFloat(display)).toFixed(10)))) },
    ],
    [
      { label: 'sin', type: 'sci', action: () => {
          const angle = isRad ? parseFloat(display) : (parseFloat(display) * Math.PI) / 180;
          setDisplay(String(parseFloat(Math.sin(angle).toFixed(10))));
        } 
      },
      { label: 'cos', type: 'sci', action: () => {
          const angle = isRad ? parseFloat(display) : (parseFloat(display) * Math.PI) / 180;
          setDisplay(String(parseFloat(Math.cos(angle).toFixed(10))));
        } 
      },
      { label: 'tan', type: 'sci', action: () => {
          const angle = isRad ? parseFloat(display) : (parseFloat(display) * Math.PI) / 180;
          const val = Math.tan(angle);
          setDisplay(Math.abs(val) > 1e10 ? 'Error' : String(parseFloat(val.toFixed(10))));
        } 
      },
    ],
    [
      { label: 'ln', type: 'sci', action: () => { const v = parseFloat(display); setDisplay(v > 0 ? String(parseFloat(Math.log(v).toFixed(10))) : 'Error'); } },
      { label: 'log', type: 'sci', action: () => { const v = parseFloat(display); setDisplay(v > 0 ? String(parseFloat(Math.log10(v).toFixed(10))) : 'Error'); } },
      { label: 'abs', type: 'sci', action: () => setDisplay(String(Math.abs(parseFloat(display)))) },
    ],
    [
      { label: 'Exp', type: 'sci', action: () => setDisplay(parseFloat(display).toExponential(5)) },
      { label: 'Mod', type: 'sci', action: () => performOperation('Mod') },
      { label: 'n!', type: 'sci', action: () => {
          const f = (n) => {
            if (n < 0 || n !== Math.floor(n)) return 'Error';
            let res = 1;
            for (let i = 2; i <= n; i++) res *= i;
            return res;
          };
          setDisplay(String(f(parseFloat(display))));
        } 
      },
    ],
    [
      { label: '(', type: 'sci', action: () => {} },
      { label: ')', type: 'sci', action: () => {} },
      { label: 'rand', type: 'sci', action: () => setDisplay(String(parseFloat(Math.random().toFixed(6)))) },
    ],
  ];

  const buttons = [
    [
      { label: '%', type: 'func', action: inputPercent },
      { label: 'CE', type: 'func', action: clear },
      { label: 'C', type: 'func', action: clear },
      { label: '⌫', type: 'func', action: backspace },
    ],
    [
      { label: '1/x', type: 'func', action: () => { const v = parseFloat(display); setDisplay(v !== 0 ? String(parseFloat((1/v).toFixed(10))) : 'Error'); } },
      { label: 'x²', type: 'func', action: () => { const v = parseFloat(display); setDisplay(String(parseFloat((v*v).toFixed(10)))); } },
      { label: '√x', type: 'func', action: () => { const v = parseFloat(display); setDisplay(v >= 0 ? String(parseFloat(Math.sqrt(v).toFixed(10))) : 'Error'); } },
      { label: '÷', type: 'op', action: () => performOperation('÷') },
    ],
    [
      { label: '7', type: 'num' }, { label: '8', type: 'num' }, { label: '9', type: 'num' },
      { label: '×', type: 'op', action: () => performOperation('×') },
    ],
    [
      { label: '4', type: 'num' }, { label: '5', type: 'num' }, { label: '6', type: 'num' },
      { label: '−', type: 'op', action: () => performOperation('−') },
    ],
    [
      { label: '1', type: 'num' }, { label: '2', type: 'num' }, { label: '3', type: 'num' },
      { label: '+', type: 'op', action: () => performOperation('+') },
    ],
    [
      { label: '±', type: 'func', action: toggleSign },
      { label: '0', type: 'num' },
      { label: '.', type: 'num', action: inputDot },
      { label: '=', type: 'equals', action: () => performOperation('=') },
    ],
  ];

  const getButtonStyle = (btn) => {
    const base = {
      border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.05)', 
      borderRadius: '8px', 
      cursor: 'pointer',
      fontSize: isWide 
        ? (btn.type === 'equals' ? '24px' : btn.type === 'op' ? '22px' : '20px')
        : (btn.type === 'equals' ? '20px' : btn.type === 'op' ? '18px' : '15px'), 
      fontWeight: btn.type === 'num' ? 600 : 500, 
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      userSelect: 'none',
      boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
      outline: 'none',
    };

    switch (btn.type) {
      case 'sci':
        return { 
          ...base, 
          background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.03)', 
          color: isDark ? '#a5b4fc' : '#4f46e5',
          fontWeight: 600,
        };
      case 'func':
        return { 
          ...base, 
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', 
          color: isDark ? '#d1d5db' : '#374151',
        };
      case 'op':
        return { 
          ...base, 
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', 
          color: isDark ? '#818cf8' : '#4f46e5', 
          fontWeight: 600 
        };
      case 'equals':
        return { 
          ...base, 
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
          color: '#fff', 
          fontWeight: 700, 
          boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
          border: 'none'
        };
      default: // numbers
        return { 
          ...base, 
          background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff', 
          color: isDark ? '#ffffff' : '#111827',
        };
    }
  };

  const displayFontSize = isWide
    ? (display.length > 12 ? '36px' : display.length > 8 ? '48px' : '64px')
    : (display.length > 12 ? '24px' : display.length > 8 ? '30px' : '36px');

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100%', 
        display: 'flex', 
        flexDirection: 'row',
        background: isDark ? '#141424' : '#f3f4f6', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* LEFT COLUMN: Keypad and Display */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        position: 'relative',
        maxWidth: isWide ? '750px' : 'none',
        background: isDark ? '#1a1a2e' : '#ffffff',
        boxShadow: isWide && !isDark ? '2px 0 8px rgba(0,0,0,0.03)' : 'none',
        zIndex: 2
      }}>
        {/* Top Header toolbar with Toggle for narrow screens */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 20px 4px', 
          flexShrink: 0 
        }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '1px', 
            color: isDark ? '#6366f1' : '#4f46e5' 
          }}>
            {isWide ? 'SCIENTIFIC' : 'STANDARD'}
          </span>
          {!isWide && (
            <button 
              onClick={() => setShowHistoryOverlay(!showHistoryOverlay)}
              style={{
                background: showHistoryOverlay ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)') : 'none',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: isDark ? '#a5b4fc' : '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="Show History"
            >
              <Clock size={16} />
            </button>
          )}
        </div>

        {/* Display Section */}
        <div style={{ padding: isWide ? '24px 24px 20px' : '8px 20px 16px', flexShrink: 0 }}>
          {/* Formula History */}
          <div style={{ 
            fontSize: isWide ? '14px' : '12px', 
            color: isDark ? '#8888b0' : '#718096', 
            textAlign: 'right', 
            minHeight: '20px', 
            marginBottom: '6px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}>
            {history}
          </div>
          {/* Main display */}
          <div style={{
            fontSize: displayFontSize, 
            fontWeight: 600, 
            color: isDark ? '#ffffff' : '#111827',
            textAlign: 'right', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', 
            minHeight: isWide ? '72px' : '44px', 
            lineHeight: isWide ? '72px' : '44px',
            transition: 'font-size 0.15s'
          }}>
            {display}
          </div>
        </div>

        {/* Buttons Section (Flexbox wrapping Scientific and Standard Keypads) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden'
        }}>
          {/* SCIENTIFIC PANEL */}
          {isWide && (
            <div style={{
              flex: 0.75,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(6, 1fr)',
              gap: '8px',
              padding: '8px 0px 24px 24px',
            }}>
              {scientificButtons.flat().map((btn, i) => (
                <button
                  key={`sci-${i}`}
                  style={getButtonStyle(btn)}
                  onClick={btn.action}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97) translateY(0)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* STANDARD PANEL */}
          <div style={{
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: `repeat(${buttons.length}, 1fr)`,
            gap: isWide ? '8px' : '5px', 
            padding: isWide ? '8px 24px 24px 8px' : '4px 16px 16px',
          }}>
            {buttons.flat().map((btn, i) => (
              <button
                key={i}
                style={getButtonStyle(btn)}
                onClick={() => {
                  if (btn.action) btn.action();
                  else if (btn.type === 'num' && btn.label !== '.') inputDigit(btn.label);
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97) translateY(0)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* NARROW SCREEN OVERLAY: calculation history */}
        {!isWide && showHistoryOverlay && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(20, 20, 32, 0.96)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#fff' : '#000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#6366f1" /> History
              </span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {historyLog.length > 0 && (
                  <button 
                    onClick={() => setHistoryLog([])}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={() => setShowHistoryOverlay(false)}
                  style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#555', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {historyLog.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: isDark ? '#555' : '#9ca3af', gap: '8px' }}>
                  <Clock size={28} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '12px' }}>There's no history yet</span>
                </div>
              ) : (
                historyLog.map((log, index) => (
                  <div 
                    key={index} 
                    onClick={() => {
                      setDisplay(log.result);
                      setHistory(log.formula);
                      setWaitingForOperand(true);
                      setShowHistoryOverlay(false);
                    }}
                    style={{ 
                      textAlign: 'right', 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'; }}
                  >
                    <div style={{ fontSize: '11px', color: isDark ? '#8888b0' : '#718096', marginBottom: '2px' }}>{log.formula}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#fff' : '#111827' }}>{log.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Interactive History Log (rendered side-by-side ONLY when actual container is wide) */}
      {isWide && (
        <div style={{ 
          width: '300px', 
          flexShrink: 0,
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          background: isDark ? 'rgba(15, 15, 27, 0.4)' : '#f9fafb',
          borderLeft: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
          zIndex: 1
        }}>
          <div style={{ 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' 
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#a5b4fc' : '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> History
            </span>
            {historyLog.length > 0 && (
              <button 
                onClick={() => setHistoryLog([])}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ef4444', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  fontSize: '11px', 
                  fontWeight: 600 
                }}
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {historyLog.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: isDark ? '#555' : '#9ca3af', gap: '8px' }}>
                <Clock size={28} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: '11px', fontWeight: 500 }}>There's no history yet</span>
              </div>
            ) : (
              historyLog.map((log, index) => (
                <div 
                  key={index} 
                  onClick={() => {
                    setDisplay(log.result);
                    setHistory(log.formula);
                    setWaitingForOperand(true);
                  }}
                  style={{ 
                    textAlign: 'right', 
                    cursor: 'pointer', 
                    padding: '8px 10px', 
                    borderRadius: '6px', 
                    transition: 'all 0.15s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: '11px', color: isDark ? '#8888b0' : '#718096', marginBottom: '2px' }}>{log.formula}</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#fff' : '#1e293b' }}>{log.result}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Calculator;
