import React, { useState, useCallback, useRef } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Star, Plus, X, Search, Home, BookOpen, Code, Play } from 'lucide-react';

const BOOKMARKS = [
  { name: 'Google', url: 'google.com' },
  { name: 'Wikipedia', url: 'wikipedia.org' },
  { name: 'GitHub', url: 'github.com' },
  { name: 'YouTube', url: 'youtube.com' },
];

// Simulated page content renderers
const GooglePage = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const results = [
    { title: 'Operating System Concepts - Wikipedia', url: 'wikipedia.org', desc: 'An operating system is system software that manages computer hardware and software resources...' },
    { title: 'OS Scheduling Algorithms Explained', url: 'github.com', desc: 'A comprehensive guide to CPU scheduling algorithms including FCFS, SJF, Round Robin...' },
    { title: 'Memory Management in Modern OS', url: 'wikipedia.org', desc: 'Memory management is a form of resource management applied to computer memory...' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', minHeight: '100%', background: '#1a1a2e' }}>
      <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '32px', background: 'linear-gradient(135deg, #6366f1, #ec4899, #f59e0b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google</div>
      <div style={{ display: 'flex', width: '500px', maxWidth: '90%', background: 'rgba(255,255,255,0.08)', borderRadius: '24px', padding: '12px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Search size={18} color="#888" style={{ marginRight: '10px', flexShrink: 0, marginTop: '2px' }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the web..." style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '15px', outline: 'none' }} onKeyDown={e => e.key === 'Enter' && query && setQuery(query)} />
      </div>
      {query && (
        <div style={{ width: '500px', maxWidth: '90%', marginTop: '24px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>About {Math.floor(Math.random()*900+100)},000 results</div>
          {results.map((r, i) => (
            <div key={i} onClick={() => onNavigate(r.url)} style={{ marginBottom: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', color: '#888' }}>{r.url}</div>
              <div style={{ fontSize: '16px', color: '#8ab4f8', marginBottom: '4px' }}>{r.title}</div>
              <div style={{ fontSize: '13px', color: '#bbb', lineHeight: '1.4' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WikiPage = () => (
  <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', background: '#1a1a2e', minHeight: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
      <BookOpen size={28} color="#a78bfa" />
      <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Wikipedia</span>
    </div>
    <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#fff', marginBottom: '4px' }}>Operating System</h1>
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>From Wikipedia, the free encyclopedia</div>
    <p style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '16px', fontSize: '14px' }}>
      An <strong style={{ color: '#fff' }}>operating system</strong> (OS) is system software that manages computer hardware and software resources, and provides common services for computer programs. Time-sharing operating systems schedule tasks for efficient use of the system and may also include accounting software for cost allocation of processor time, mass storage, peripherals, and other resources.
    </p>
    <h2 style={{ fontSize: '20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '12px' }}>Key Functions</h2>
    <ul style={{ color: '#ccc', lineHeight: '2', paddingLeft: '20px', fontSize: '14px' }}>
      <li><strong style={{ color: '#a78bfa' }}>Process Management</strong> — Creation, scheduling, and termination of processes</li>
      <li><strong style={{ color: '#ec4899' }}>Memory Management</strong> — Allocation and deallocation of memory space</li>
      <li><strong style={{ color: '#10b981' }}>File System Management</strong> — Creation, deletion, and access to files</li>
      <li><strong style={{ color: '#f59e0b' }}>I/O Management</strong> — Management of input/output devices and drivers</li>
      <li><strong style={{ color: '#6366f1' }}>Security</strong> — Protection against unauthorized access</li>
    </ul>
    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
      <div style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 600, marginBottom: '4px' }}>Did you know?</div>
      <div style={{ fontSize: '13px', color: '#bbb' }}>The first operating system, GM-NAA I/O, was created in 1956 by General Motors for its IBM 704 computer.</div>
    </div>
  </div>
);

const GitHubPage = () => (
  <div style={{ background: '#0d1117', minHeight: '100%', color: '#c9d1d9' }}>
    <div style={{ padding: '12px 24px', background: '#161b22', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Code size={28} color="#f0f6fc" />
      <span style={{ fontWeight: 700, fontSize: '18px', color: '#f0f6fc' }}>GitHub</span>
    </div>
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>OS</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#f0f6fc' }}>os-simulator</div>
          <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '16px' }}>A web-based operating system simulator built with React</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['React', 'JavaScript', 'CSS', 'Vite'].map(t => (
              <span key={t} style={{ padding: '4px 12px', borderRadius: '16px', background: 'rgba(56,139,253,0.15)', color: '#58a6ff', fontSize: '12px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[['Stars', '⭐ 1.2k'], ['Forks', '🍴 340'], ['Issues', '🐛 12']].map(([l, v]) => (
          <div key={l} style={{ padding: '16px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: '12px', color: '#8b949e' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', padding: '16px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#f0f6fc' }}>README.md</div>
        <div style={{ fontSize: '14px', color: '#8b949e', lineHeight: '1.6' }}>This project simulates core OS concepts including CPU scheduling (FCFS, SJF, Round Robin, SRTF, Priority), memory management (First Fit, Best Fit, Worst Fit), file system operations, and I/O device management through an interactive desktop environment.</div>
      </div>
    </div>
  </div>
);

const YouTubePage = () => (
  <div style={{ background: '#0f0f0f', minHeight: '100%', color: '#fff' }}>
    <div style={{ padding: '10px 24px', background: '#0f0f0f', borderBottom: '1px solid #272727', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Play size={24} color="#ff0000" fill="#ff0000" />
      <span style={{ fontWeight: 700, fontSize: '18px' }}>YouTube</span>
    </div>
    <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
      {[
        { title: 'Operating Systems: Crash Course CS #18', views: '4.2M views', channel: 'CrashCourse', color: '#ef4444' },
        { title: 'CPU Scheduling Algorithms Explained', views: '892K views', channel: 'Neso Academy', color: '#6366f1' },
        { title: 'How Memory Management Works', views: '1.1M views', channel: 'Computerphile', color: '#10b981' },
        { title: 'Build an OS from Scratch', views: '2.3M views', channel: 'Ben Eater', color: '#f59e0b' },
        { title: 'Process vs Thread Explained', views: '567K views', channel: 'ByteByteGo', color: '#ec4899' },
        { title: 'File Systems as Fast As Possible', views: '1.8M views', channel: 'Techquickie', color: '#8b5cf6' },
      ].map((v, i) => (
        <div key={i} style={{ cursor: 'pointer' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', background: `linear-gradient(135deg, ${v.color}44, ${v.color}22)`, borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={36} color="#fff" fill="#fff" style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', lineHeight: '1.3' }}>{v.title}</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>{v.channel}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{v.views} · 1 year ago</div>
        </div>
      ))}
    </div>
  </div>
);

const NotFoundPage = ({ url }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#1a1a2e', color: '#e0e0e0' }}>
    <div style={{ fontSize: '72px', fontWeight: 800, color: '#ef4444', opacity: 0.7 }}>404</div>
    <div style={{ fontSize: '18px', color: '#aaa', marginTop: '8px' }}>Page not found</div>
    <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>Cannot connect to <strong style={{ color: '#888' }}>{url}</strong></div>
  </div>
);

const HomePage = ({ onNavigate }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px', minHeight: '100%', background: '#1a1a2e' }}>
    <Globe size={48} color="#a78bfa" style={{ marginBottom: '16px' }} />
    <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>New Tab</div>
    <div style={{ fontSize: '13px', color: '#888', marginBottom: '32px' }}>Browse simulated websites</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: '16px' }}>
      {BOOKMARKS.map(b => (
        <div key={b.url} onClick={() => onNavigate(b.url)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', borderRadius: '12px', transition: 'background 0.2s' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#a78bfa' }}>
            {b.name[0]}
          </div>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{b.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const resolveUrl = (input) => {
  let url = input.trim().toLowerCase();
  url = url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  return url;
};

const getPageComponent = (url, onNavigate) => {
  const resolved = resolveUrl(url);
  if (!resolved || resolved === 'newtab') return <HomePage onNavigate={onNavigate} />;
  if (resolved.includes('google')) return <GooglePage onNavigate={onNavigate} />;
  if (resolved.includes('wikipedia')) return <WikiPage />;
  if (resolved.includes('github')) return <GitHubPage />;
  if (resolved.includes('youtube')) return <YouTubePage />;
  return <NotFoundPage url={url} />;
};

const Browser = () => {
  const [tabs, setTabs] = useState([{ id: 1, url: '', title: 'New Tab' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState({});
  const [historyIdx, setHistoryIdx] = useState({});
  const nextTabId = useRef(2);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const navigate = useCallback((url) => {
    const resolved = resolveUrl(url);
    setLoading(true);

    const titleMap = { 'google.com': 'Google', 'wikipedia.org': 'Wikipedia', 'github.com': 'GitHub', 'youtube.com': 'YouTube' };
    const title = titleMap[resolved] || (resolved ? resolved : 'New Tab');

    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: resolved, title } : t));
      setUrlInput(resolved ? `https://${resolved}` : '');

      setHistory(prev => {
        const h = prev[activeTabId] || [];
        const idx = historyIdx[activeTabId] ?? -1;
        const newH = [...h.slice(0, idx + 1), resolved];
        return { ...prev, [activeTabId]: newH };
      });
      setHistoryIdx(prev => {
        const h = history[activeTabId] || [];
        const idx = prev[activeTabId] ?? -1;
        return { ...prev, [activeTabId]: idx + 1 };
      });

      setLoading(false);
    }, 400);
  }, [activeTabId, history, historyIdx]);

  const goBack = () => {
    const idx = historyIdx[activeTabId] ?? 0;
    if (idx > 0) {
      const newIdx = idx - 1;
      setHistoryIdx(prev => ({ ...prev, [activeTabId]: newIdx }));
      const url = history[activeTabId][newIdx];
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
      setUrlInput(url ? `https://${url}` : '');
    }
  };

  const goForward = () => {
    const h = history[activeTabId] || [];
    const idx = historyIdx[activeTabId] ?? 0;
    if (idx < h.length - 1) {
      const newIdx = idx + 1;
      setHistoryIdx(prev => ({ ...prev, [activeTabId]: newIdx }));
      const url = h[newIdx];
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
      setUrlInput(url ? `https://${url}` : '');
    }
  };

  const addTab = () => {
    const id = nextTabId.current++;
    setTabs(prev => [...prev, { id, url: '', title: 'New Tab' }]);
    setActiveTabId(id);
    setUrlInput('');
  };

  const closeTab = (id, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
  };

  const switchTab = (id) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    setUrlInput(tab?.url ? `https://${tab.url}` : '');
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) navigate(urlInput);
  };

  const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column', background: '#1a1a2e', overflow: 'hidden' },
    tabBar: { display: 'flex', alignItems: 'flex-end', background: '#0f0f23', padding: '0', height: '36px', gap: '1px', overflow: 'hidden' },
    tab: (active) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', background: active ? '#1a1a2e' : '#12122a', color: active ? '#fff' : '#888', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: 'none', maxWidth: '180px', minWidth: '80px', height: active ? '34px' : '30px', marginTop: active ? '2px' : '6px', transition: 'all 0.15s' }),
    tabClose: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center', marginLeft: '4px' },
    addTab: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center' },
    navbar: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    navBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
    urlBar: { flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.08)' },
    urlInput: { flex: 1, background: 'none', border: 'none', color: '#e0e0e0', fontSize: '13px', outline: 'none' },
    bookmarkBar: { display: 'flex', gap: '4px', padding: '4px 12px', background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    bookmark: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' },
    content: { flex: 1, overflow: 'auto', background: '#1a1a2e' },
    loader: { position: 'absolute', top: 0, left: 0, height: '2px', background: 'linear-gradient(90deg, #6366f1, #a78bfa, #ec4899)', animation: 'loadBar 0.5s ease-out forwards', width: '100%' },
  };

  return (
    <div style={styles.container}>
      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button key={tab.id} style={styles.tab(tab.id === activeTabId)} onClick={() => switchTab(tab.id)}>
            <Globe size={12} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.title}</span>
            {tabs.length > 1 && <button style={styles.tabClose} onClick={(e) => closeTab(tab.id, e)}><X size={12} /></button>}
          </button>
        ))}
        <button style={styles.addTab} onClick={addTab}><Plus size={16} /></button>
      </div>

      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <button style={styles.navBtn} onClick={goBack}><ArrowLeft size={16} /></button>
        <button style={styles.navBtn} onClick={goForward}><ArrowRight size={16} /></button>
        <button style={styles.navBtn} onClick={() => navigate(activeTab.url)}><RotateCw size={14} /></button>
        <button style={styles.navBtn} onClick={() => navigate('')}><Home size={16} /></button>
        <form style={styles.urlBar} onSubmit={handleUrlSubmit}>
          <Globe size={14} color="#666" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input style={styles.urlInput} value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Enter URL or search..." />
        </form>
        <button style={styles.navBtn}><Star size={16} /></button>
      </div>

      {/* Bookmarks Bar */}
      <div style={styles.bookmarkBar}>
        {BOOKMARKS.map(b => (
          <button key={b.url} style={styles.bookmark} onClick={() => navigate(b.url)}>
            <Globe size={10} /> {b.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ ...styles.content, position: 'relative' }}>
        {loading && <div style={styles.loader} />}
        {getPageComponent(activeTab.url, navigate)}
      </div>

      <style>{`
        @keyframes loadBar { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default Browser;
