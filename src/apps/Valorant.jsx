import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';

const gameModes = ['UNRATED', 'COMPETITIVE', 'SPIKE RUSH', 'DEATHMATCH', 'REPLICATION', 'ESCALATION', 'CUSTOM GAME'];

const LobbyScreen = ({ onBack, isDark }) => {
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: isDark ? '#1b2838' : '#f3f4f6', color: isDark ? '#fff' : '#1e293b', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? 'transparent' : '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onBack}>
          <span style={{ fontSize: '18px', color: isDark ? '#aaa' : '#64748b' }}>‹</span>
          <span style={{ fontSize: '12px', color: isDark ? '#888' : '#64748b', letterSpacing: '1px' }}>BACK //</span>
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', color: isDark ? '#fff' : '#0f1923' }}>LOBBY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
          <span style={{ color: isDark ? '#aaa' : '#64748b', cursor: 'pointer' }}>HOME</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isDark ? '#fff' : '#0f1923' }}>{formatTime(queueTime)}</span>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: isDark ? '#fff' : '#0f1923' }}>◆</div>
          </div>
          <span style={{ color: isDark ? '#aaa' : '#64748b', cursor: 'pointer' }}>STORE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: isDark ? '#aaa' : '#64748b' }}>
          <span>0/2</span><span>2/3</span><span>0</span><span>370</span>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isDark ? '1px solid #444' : '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: isDark ? '#888' : '#64748b', cursor: 'pointer' }}>⚙</div>
        </div>
      </div>

      {/* MODE TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? 'transparent' : '#fff' }}>
        {gameModes.map(mode => (
          <div
            key={mode}
            onClick={() => setSelectedMode(mode)}
            style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '1px', padding: '6px 12px', cursor: 'pointer',
              color: selectedMode === mode ? (isDark ? '#fff' : '#ff4655') : (isDark ? '#666' : '#64748b'),
              borderBottom: selectedMode === mode ? '2px solid #ff4655' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >{mode}</div>
        ))}
      </div>

      {/* CLOSED PARTY */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: isDark ? '#aaa' : '#475569', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', border: isDark ? 'none' : '1px solid #e5e7eb' }}>
          <span>CLOSED PARTY</span>
          <div style={{ width: '36px', height: '18px', borderRadius: '9px', background: '#ff4655', position: 'relative', cursor: 'pointer' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', right: '2px' }} />
          </div>
        </div>
      </div>

      {/* PLAYER CARDS */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '0 20px' }}>
        {[
          { name: 'lakano', title: 'Bading', rank: '3', color: 'rgba(100,140,200,0.4)', border: isDark ? 'rgba(100,140,200,0.3)' : 'rgba(100,140,200,0.15)', emoji: '🛡️' },
          { name: 'lowiq', title: 'Big Brain Plays', rank: '1000', color: 'rgba(200,160,60,0.4)', border: isDark ? 'rgba(200,160,60,0.3)' : 'rgba(200,160,60,0.15)', emoji: '🧠' },
          { name: 'ricin', title: 'VAMOS', rank: '117', color: 'rgba(255, 70, 85, 0.4)', border: isDark ? 'rgba(255, 70, 85, 0.3)' : 'rgba(255, 70, 85, 0.15)', emoji: '🎖️', isMain: true },
          { name: 'kenji', title: 'Slay', rank: '167', color: 'rgba(160,80,180,0.4)', border: isDark ? 'rgba(160,80,180,0.3)' : 'rgba(160,80,180,0.15)', emoji: '⚔️' },
          { name: 'benedih', title: 'SIXSEVEN', rank: '169', color: 'rgba(60,160,160,0.4)', border: isDark ? 'rgba(60,160,160,0.3)' : 'rgba(60,160,160,0.15)', emoji: '💊' },
        ].map(player => (
          <div key={player.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: player.isMain ? '150px' : '120px',
              height: player.isMain ? '220px' : '170px',
              background: isDark 
                ? `linear-gradient(180deg, ${player.color} 0%, rgba(20,30,40,0.8) 100%)`
                : `linear-gradient(180deg, ${player.color} 0%, #ffffff 100%)`,
              borderRadius: '8px',
              border: `${player.isMain ? '2px' : '1px'} solid ${player.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', color: '#fbbf24' }}>{player.rank}</div>
              <div style={{ fontSize: player.isMain ? '40px' : '30px', marginBottom: '6px' }}>{player.emoji}</div>
              <div style={{ fontSize: player.isMain ? '14px' : '11px', fontWeight: 800, letterSpacing: '2px', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)' }}></div>
            </div>
            <div style={{ background: 'rgba(100,180,100,0.3)', border: '1px solid rgba(100,180,100,0.5)', padding: '3px 16px', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#16a34a', marginTop: '-1px', width: player.isMain ? '150px' : '120px', textAlign: 'center', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}>READY</div>
            <div style={{ background: isDark ? 'rgba(200,180,100,0.15)' : '#fff', border: isDark ? '1px solid rgba(200,180,100,0.2)' : '1px solid #e5e7eb', padding: '5px 8px', textAlign: 'center', marginTop: '4px', width: player.isMain ? '150px' : '120px', borderRadius: '4px', boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#fff' : '#1e293b' }}>♦ {player.name}</div>
              <div style={{ fontSize: '9px', color: isDark ? '#aaa' : '#64748b' }}>{player.title}</div>
            </div>
            {player.isMain && <div style={{ fontSize: '20px', color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', marginTop: '4px' }}>▼</div>}
          </div>
        ))}
      </div>

      {/* DESCRIPTION */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: isDark ? '#666' : '#64748b', padding: '8px 20px', letterSpacing: '0.5px' }}>
        {selectedMode}: Standard VALORANT gameplay. Swap between attacking and defending sites, first to 13 rounds wins.
      </div>

      {/* BOTTOM BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '12px 20px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? 'transparent' : '#fff' }}>
        <button style={{ padding: '10px 28px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc', color: isDark ? '#aaa' : '#475569', borderRadius: '4px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          PRACTICE ⚙
        </button>
        <button
          onClick={() => setInQueue(!inQueue)}
          style={{ 
            padding: '12px 48px', 
            background: inQueue ? 'rgba(255,70,85,0.15)' : (isDark ? 'rgba(255,255,255,0.08)' : '#ff4655'), 
            border: 'none',
            color: inQueue ? '#ff4655' : '#fff', 
            borderRadius: '4px', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
          }}
        >
          {inQueue ? 'IN QUEUE' : 'START'} ◆
        </button>
        <button style={{ padding: '10px 28px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc', color: isDark ? '#aaa' : '#475569', borderRadius: '4px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', cursor: 'pointer' }}>
          LEAVE PARTY
        </button>
      </div>

      {/* PARTY BAR */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)', fontSize: '12px', color: isDark ? '#555' : '#888', background: isDark ? 'transparent' : '#fff' }}>
        <span>Party:</span>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', border: isDark ? '1px dashed rgba(255,255,255,0.15)' : '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: isDark ? '#666' : '#888', cursor: 'pointer', marginLeft: '8px' }}>+</div>
      </div>
    </div>
  );
};

const Valorant = () => {
  const { theme } = useOS();
  const [screen, setScreen] = useState('home');
  const [activeNav, setActiveNav] = useState('PLAY');
  const navItems = ['PLAY', 'CAREER', 'BATTLEPASS', 'COLLECTION', 'AGENTS', 'STORE'];

  const isDark = theme === 'dark';

  if (screen === 'lobby') {
    return <LobbyScreen onBack={() => setScreen('home')} isDark={isDark} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: isDark ? '#0f1923' : '#fafafa', color: isDark ? '#fff' : '#1e293b', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden', userSelect: 'none' }}>

      {/* Background Art Placeholder */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '35%', width: '450px', height: '450px', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(255,170,50,0.35) 0%, rgba(255,100,0,0.1) 40%, transparent 70%)' : 'radial-gradient(circle, rgba(255,170,50,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '300px', height: '300px', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(0,200,200,0.2) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(0,200,200,0.08) 0%, transparent 60%)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '20%', width: '50%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,170,50,0.3), transparent)' }} />
      </div>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', position: 'relative', zIndex: 10, background: isDark ? 'transparent' : '#fff', borderBottom: isDark ? 'none' : '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L12 20L20 4" stroke="#ff4655" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '3px', color: '#ff4655' }}>VALORANT</span>
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#555' : '#64748b', letterSpacing: '1px' }}>EPISODE 5 /// ACT III</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: isDark ? '#aaa' : '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fbbf24' }} />
            <span>1/2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#34d399' }} />
            <span>2/3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: isDark ? '2px solid #888' : '2px solid #ccc', background: 'transparent' }} />
            <span>0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#f59e0b' }} />
            <span>370</span>
          </div>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: isDark ? '1px solid #444' : '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: isDark ? '#888' : '#64748b' }}>⚙</div>
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
                color: item === activeNav ? '#ff4655' : (isDark ? '#eee' : '#475569'),
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
          <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderRadius: '8px', overflow: 'hidden', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb', boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(60,100,160,0.2), rgba(30,50,80,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '4px', color: isDark ? 'rgba(150,200,255,0.15)' : 'rgba(150,200,255,0.3)' }}>SKINS</div>
            </div>
            <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb', padding: '12px 16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '1px', color: isDark ? '#fff' : '#0f1923' }}>FEATURED</div>
              <div style={{ fontSize: '11px', color: isDark ? '#888' : '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>Collection</div>
            </div>
          </div>

          {/* Patch Notes */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderRadius: '8px', overflow: 'hidden', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb', boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ height: '60px', background: isDark ? 'linear-gradient(135deg, rgba(40,60,80,0.6), rgba(20,30,40,0.4))' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.3)' : '#475569', letterSpacing: '3px', fontWeight: 700 }}>
              PATCH 9.08
            </div>
            <div style={{ padding: '10px 16px', textAlign: 'center', background: isDark ? 'transparent' : '#f9fafb' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: isDark ? '#fff' : '#0f1923' }}>PATCH NOTES</div>
            </div>
          </div>

          {/* Featured Modes */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb', padding: '12px 16px', boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: isDark ? '#888' : '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Featured Modes</div>
            {[
              { name: 'Escalation', time: '7-9 MINS', icon: '⚡' },
              { name: 'Replication', time: '10-15 MINS', icon: '🔁' },
            ].map(mode => (
              <div key={mode.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{mode.icon}</div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#1e293b' }}>{mode.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: isDark ? '#666' : '#64748b', letterSpacing: '1px' }}>{mode.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAR RIGHT Mini Cards */}
        <div style={{ width: '36px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 4px', alignItems: 'center' }}>
          {['S', '★', '◈', '♦', '✦'].map((char, i) => (
            <div key={i} style={{ width: '28px', height: '44px', borderRadius: '4px', background: isDark ? `linear-gradient(180deg, rgba(${50 + i * 30},${60 + i * 20},${80 + i * 15},0.4), rgba(20,25,35,0.6))` : `linear-gradient(180deg, #f1f5f9, #cbd5e1)`, border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.3)' : '#475569', cursor: 'pointer' }}>
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', position: 'relative', zIndex: 10, borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e5e7eb', background: isDark ? 'transparent' : '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: isDark ? '#555' : '#888' }}>
          <span>Party:</span>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: isDark ? '1px dashed rgba(255,255,255,0.15)' : '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: isDark ? '#666' : '#888', cursor: 'pointer' }}>+</div>
        </div>
      </div>
    </div>
  );
};

export default Valorant;
