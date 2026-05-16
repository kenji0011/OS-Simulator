import React, { useState } from 'react';
import { Delete } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState('');

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
        default: result = current;
      }

      if (nextOp === '=') {
        setHistory(`${prevValue} ${operator} ${current} =`);
      }

      const resultStr = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
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
      border: 'none', borderRadius: '8px', cursor: 'pointer',
      fontSize: '16px', fontWeight: 500, transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    };
    switch (btn.type) {
      case 'func':
        return { ...base, background: 'rgba(255,255,255,0.08)', color: '#ccc' };
      case 'op':
        return { ...base, background: 'rgba(255,255,255,0.08)', color: '#a5b4fc', fontSize: '20px', fontWeight: 600 };
      case 'equals':
        return { ...base, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '22px', fontWeight: 700, boxShadow: '0 2px 12px rgba(99,102,241,0.3)' };
      default:
        return { ...base, background: 'rgba(255,255,255,0.04)', color: '#fff' };
    }
  };

  // Truncate display for very long numbers
  const displayFontSize = display.length > 12 ? '24px' : display.length > 8 ? '32px' : '40px';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#1a1a2e', fontFamily: 'Inter, sans-serif', overflow: 'hidden'
    }}>
      {/* Display */}
      <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
        {/* History */}
        <div style={{ fontSize: '13px', color: '#666', textAlign: 'right', minHeight: '20px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {history}
        </div>
        {/* Main display */}
        <div style={{
          fontSize: displayFontSize, fontWeight: 300, color: '#fff',
          textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', minHeight: '48px', lineHeight: '48px',
          transition: 'font-size 0.15s'
        }}>
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: `repeat(${buttons.length}, 1fr)`,
        gap: '4px', padding: '8px 12px 12px',
      }}>
        {buttons.flat().map((btn, i) => (
          <button
            key={i}
            style={getButtonStyle(btn)}
            onClick={() => {
              if (btn.action) btn.action();
              else if (btn.type === 'num' && btn.label !== '.') inputDigit(btn.label);
            }}
            onMouseEnter={e => { e.target.style.filter = 'brightness(1.3)'; }}
            onMouseLeave={e => { e.target.style.filter = 'brightness(1)'; }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
