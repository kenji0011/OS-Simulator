import React from 'react';

const Browser = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #ddd', display: 'flex', gap: '8px', background: '#eee' }}>
        <input 
          type="text" 
          value="https://google.com" 
          readOnly 
          style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button style={{ padding: '4px 12px' }}>Go</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <p style={{ color: '#888' }}>Browser Content Area</p>
      </div>
    </div>
  );
};

export default Browser;
