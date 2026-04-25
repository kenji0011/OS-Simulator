import React, { useState, useEffect } from 'react';

const gameModes = ['UNRATED', 'COMPETITIVE', 'SPIKE RUSH', 'DEATHMATCH', 'REPLICATION', 'ESCALATION', 'CUSTOM GAME'];

const LobbyScreen = ({ onBack }) => {
  const [selectedMode, setSelectedMode] = useState('UNRATED');
  const [inQueue, setInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);

  useEffect(() => {
    let interval;
    if (inQueue) {
      interval = setInterval(() => setQueueTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [inQueue]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1b2838', color: '#fff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onBack}>
          <span style={{ fontSize: '18px', color: '#aaa' }}>‹</span>
          <span style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>BACK //</span>
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px' }}>LOBBY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
          <span style={{ color: '#aaa', cursor: 'pointer' }}>HOME</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(queueTime)}</span>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>◆</div>
          </div>
          <span style={{ color: '#aaa', cursor: 'pointer' }}>STORE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#aaa' }}>
          <span>0/2</span><span>2/3</span><span>0</span><span>370</span>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#888', cursor: 'pointer' }}>⚙</div>
        </div>
      </div>

      {/* MODE TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {gameModes.map(mode => (
          <div
            key={mode}
            onClick={() => setSelectedMode(mode)}
            style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '1px', padding: '6px 12px', cursor: 'pointer',
              color: selectedMode === mode ? '#fff' : '#666',
              borderBottom: selectedMode === mode ? '2px solid #00c8c8' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >{mode}</div>
        ))}
      </div>

      {/* CLOSED PARTY */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#aaa' }}>
          <span>CLOSED PARTY</span>
          <div style={{ width: '36px', height: '18px', borderRadius: '9px', background: '#00c8c8', position: 'relative', cursor: 'pointer' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', right: '2px' }} />
          </div>
        </div>
      </div>

      {/* PLAYER CARDS */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '0 20px' }}>
        {[
          { name: 'lakano', title: 'Bading', rank: '3', color: 'rgba(100,140,200,0.4)', border: 'rgba(100,140,200,0.3)', emoji: '🛡️' },
          { name: 'lowiq', title: 'Big Brain Plays', rank: '1000', color: 'rgba(200,160,60,0.4)', border: 'rgba(200,160,60,0.3)', emoji: '🧠' },
          { name: 'ricin', title: 'VAMOS', rank: '117', color: 'rgba(150, 31, 15, 0.6)', border: 'rgba(200,200,100,0.3)', emoji: '🎖️', isMain: true },
          { name: 'kenji', title: 'Slay', rank: '167', color: 'rgba(160,80,180,0.4)', border: 'rgba(160,80,180,0.3)', emoji: '⚔️' },
          { name: 'benedih', title: 'SIXSEVEN', rank: '169', color: 'rgba(60,160,160,0.4)', border: 'rgba(60,160,160,0.3)', emoji: '💊' },
        ].map(player => (
          <div key={player.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: player.isMain ? '150px' : '120px',
              height: player.isMain ? '220px' : '170px',
              background: `linear-gradient(180deg, ${player.color} 0%, rgba(20,30,40,0.8) 100%)`,
              borderRadius: '8px',
              border: `${player.isMain ? '2px' : '1px'} solid ${player.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'transform 0.2s',
            }}>
              <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', color: '#fbbf24' }}>{player.rank}</div>
              <div style={{ fontSize: player.isMain ? '40px' : '30px', marginBottom: '6px' }}>{player.emoji}</div>
              <div style={{ fontSize: player.isMain ? '14px' : '11px', fontWeight: 800, letterSpacing: '2px', color: 'rgba(255,255,255,0.35)' }}></div>
            </div>
            <div style={{ background: 'rgba(100,180,100,0.3)', border: '1px solid rgba(100,180,100,0.5)', padding: '3px 16px', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#a3e635', marginTop: '-1px', width: player.isMain ? '150px' : '120px', textAlign: 'center' }}>READY</div>
            <div style={{ background: 'rgba(200,180,100,0.15)', border: '1px solid rgba(200,180,100,0.2)', padding: '5px 8px', textAlign: 'center', marginTop: '2px', width: player.isMain ? '150px' : '120px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>♦ {player.name}</div>
              <div style={{ fontSize: '9px', color: '#aaa' }}>{player.title}</div>
            </div>
            {player.isMain && <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.1)', marginTop: '4px' }}>▼</div>}
          </div>
        ))}
      </div>

      {/* DESCRIPTION */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', padding: '8px 20px', letterSpacing: '0.5px' }}>
        {selectedMode}: Standard VALORANT gameplay. Swap between attacking and defending sites, first to 13 rounds wins.
      </div>

      {/* BOTTOM BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{ padding: '10px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa', borderRadius: '4px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          PRACTICE ⚙
        </button>
        <button
          onClick={() => setInQueue(!inQueue)}
          style={{ padding: '12px 48px', background: inQueue ? 'rgba(0,200,200,0.2)' : 'rgba(255,255,255,0.08)', border: inQueue ? '1px solid rgba(0,200,200,0.5)' : '1px solid rgba(255,255,255,0.15)', color: inQueue ? '#00c8c8' : '#fff', borderRadius: '4px', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {inQueue ? 'IN QUEUE' : 'START'} ◆
        </button>
        <button style={{ padding: '10px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa', borderRadius: '4px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', cursor: 'pointer' }}>
          LEAVE PARTY
        </button>
      </div>

      {/* PARTY BAR */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#555' }}>
        <span>Party:</span>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666', cursor: 'pointer', marginLeft: '8px' }}>+</div>
      </div>
    </div>
  );
};

const Valorant = () => {
  const [screen, setScreen] = useState('home');
  const [activeNav, setActiveNav] = useState('PLAY');
  const navItems = ['PLAY', 'CAREER', 'BATTLEPASS', 'COLLECTION', 'AGENTS', 'STORE'];

  if (screen === 'lobby') {
    return <LobbyScreen onBack={() => setScreen('home')} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f1923', color: '#fff', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden', userSelect: 'none' }}>

      {/* Background Art Placeholder */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '35%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,50,0.35) 0%, rgba(255,100,0,0.1) 40%, transparent 70%)', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,200,0.2) 0%, transparent 60%)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '20%', width: '50%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,170,50,0.3), transparent)' }} />
      </div>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L12 20L20 4" stroke="#ff4655" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '3px', color: '#ff4655' }}>VALORANT</span>
          </div>
          <span style={{ fontSize: '11px', color: '#555', letterSpacing: '1px' }}>EPISODE 5 /// ACT III</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: '#aaa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fbbf24' }} />
            <span>1/2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#34d399' }} />
            <span>2/3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #888', background: 'transparent' }} />
            <span>0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#f59e0b' }} />
            <span>370</span>
          </div>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: '#888' }}>⚙</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10 }}>
        {/* LEFT NAV */}
        <div style={{ width: '220px', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map(item => (
            <div
              key={item}
              onClick={() => {
                setActiveNav(item);
                if (item === 'PLAY') setScreen('lobby');
              }}
              style={{
                fontSize: item === activeNav ? '28px' : '18px',
                fontWeight: 800,
                letterSpacing: '2px',
                color: item === activeNav ? '#ff4655' : '#eee',
                cursor: 'pointer',
                padding: '6px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {item !== activeNav && <span style={{ color: '#ff4655', fontSize: '8px' }}>◆</span>}
              {item}
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div style={{ flex: 1 }} />

        {/* RIGHT PANEL */}
        <div style={{ width: '280px', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Featured Collection */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(60,100,160,0.2), rgba(30,50,80,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '4px', color: 'rgba(150,200,255,0.15)' }}>SKINS</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '1px' }}>FEATURED</div>
              <div style={{ fontSize: '11px', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Collection</div>
            </div>
          </div>

          {/* Patch Notes */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ height: '60px', background: 'linear-gradient(135deg, rgba(40,60,80,0.6), rgba(20,30,40,0.4))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px' }}>
              PATCH 9.08
            </div>
            <div style={{ padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}>PATCH NOTES</div>
            </div>
          </div>

          {/* Featured Modes */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>Featured Modes</div>
            {[
              { name: 'Escalation', time: '7-9 MINS', icon: '⚡' },
              { name: 'Replication', time: '10-15 MINS', icon: '🔁' },
            ].map(mode => (
              <div key={mode.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{mode.icon}</div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{mode.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#666', letterSpacing: '1px' }}>{mode.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAR RIGHT Mini Cards */}
        <div style={{ width: '36px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 4px', alignItems: 'center' }}>
          {['S', '★', '◈', '♦', '✦'].map((char, i) => (
            <div key={i} style={{ width: '28px', height: '44px', borderRadius: '4px', background: `linear-gradient(180deg, rgba(${50 + i * 30},${60 + i * 20},${80 + i * 15},0.4), rgba(20,25,35,0.6))`, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#555' }}>
          <span>Party:</span>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#666', cursor: 'pointer' }}>+</div>
        </div>
      </div>
    </div>
  );
};

export default Valorant;
