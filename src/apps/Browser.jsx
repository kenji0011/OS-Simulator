import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Star, Plus, X, Search, Home, BookOpen, Code, Play } from 'lucide-react';
import { useOS } from '../context/OSContext';

const BOOKMARKS = [
  { name: 'Google', url: 'google.com' },
  { name: 'Wikipedia', url: 'wikipedia.org' },
  { name: 'GitHub', url: 'github.com' },
  { name: 'YouTube', url: 'youtube.com' },
];

// Simulated page content renderers
const GooglePage = ({ onNavigate, isDark }) => {
  const [query, setQuery] = useState('');
  const results = [
    { title: 'Operating System Concepts - Wikipedia', url: 'wikipedia.org', desc: 'An operating system is system software that manages computer hardware and software resources...' },
    { title: 'OS Scheduling Algorithms Explained', url: 'github.com', desc: 'A comprehensive guide to CPU scheduling algorithms including FCFS, SJF, Round Robin...' },
    { title: 'Memory Management in Modern OS', url: 'wikipedia.org', desc: 'Memory management is a form of resource management applied to computer memory...' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', minHeight: '100%', background: isDark ? '#1a1a2e' : '#fff', color: isDark ? '#fff' : '#000' }}>
      <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '32px', background: 'linear-gradient(135deg, #6366f1, #ec4899, #f59e0b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google</div>
      <div style={{ display: 'flex', width: '500px', maxWidth: '90%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: '24px', padding: '12px 20px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
        <Search size={18} color="#888" style={{ marginRight: '10px', flexShrink: 0, marginTop: '2px' }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the web..." style={{ flex: 1, background: 'none', border: 'none', color: isDark ? '#fff' : '#000', fontSize: '15px', outline: 'none' }} onKeyDown={e => e.key === 'Enter' && query && setQuery(query)} />
      </div>
      {query && (
        <div style={{ width: '500px', maxWidth: '90%', marginTop: '24px' }}>
          <div style={{ fontSize: '12px', color: isDark ? '#888' : '#64748b', marginBottom: '12px' }}>About {Math.floor(Math.random()*900+100)},000 results</div>
          {results.map((r, i) => (
            <div key={i} onClick={() => onNavigate(r.url)} style={{ marginBottom: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', color: isDark ? '#888' : '#64748b' }}>{r.url}</div>
              <div style={{ fontSize: '16px', color: isDark ? '#8ab4f8' : '#1a0dab', marginBottom: '4px' }}>{r.title}</div>
              <div style={{ fontSize: '13px', color: isDark ? '#bbb' : '#4b5563', lineHeight: '1.4' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WikiPage = ({ isDark }) => (
  <div style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', background: isDark ? '#1a1a2e' : '#fff', minHeight: '100%', color: isDark ? '#ccc' : '#374151' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', paddingBottom: '16px' }}>
      <BookOpen size={28} color="#a78bfa" />
      <span style={{ fontSize: '24px', fontWeight: 700, color: isDark ? '#fff' : '#000' }}>Wikipedia</span>
    </div>
    <h1 style={{ fontSize: '28px', fontWeight: 300, color: isDark ? '#fff' : '#000', marginBottom: '4px' }}>Operating System</h1>
    <div style={{ fontSize: '12px', color: isDark ? '#888' : '#64748b', marginBottom: '16px' }}>From Wikipedia, the free encyclopedia</div>
    <p style={{ lineHeight: '1.8', marginBottom: '16px', fontSize: '14px' }}>
      An <strong style={{ color: isDark ? '#fff' : '#000' }}>operating system</strong> (OS) is system software that manages computer hardware and software resources, and provides common services for computer programs. Time-sharing operating systems schedule tasks for efficient use of the system and may also include accounting software for cost allocation of processor time, mass storage, peripherals, and other resources.
    </p>
    <h2 style={{ fontSize: '20px', color: isDark ? '#fff' : '#000', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', paddingBottom: '6px', marginBottom: '12px' }}>Key Functions</h2>
    <ul style={{ lineHeight: '2', paddingLeft: '20px', fontSize: '14px' }}>
      <li><strong style={{ color: '#a78bfa' }}>Process Management</strong> — Creation, scheduling, and termination of processes</li>
      <li><strong style={{ color: '#ec4899' }}>Memory Management</strong> — Allocation and deallocation of memory space</li>
      <li><strong style={{ color: '#10b981' }}>File System Management</strong> — Creation, deletion, and access to files</li>
      <li><strong style={{ color: '#f59e0b' }}>I/O Management</strong> — Management of input/output devices and drivers</li>
      <li><strong style={{ color: '#6366f1' }}>Security</strong> — Protection against unauthorized access</li>
    </ul>
    <div style={{ marginTop: '24px', padding: '16px', background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
      <div style={{ fontSize: '13px', color: isDark ? '#a5b4fc' : '#4f46e5', fontWeight: 600, marginBottom: '4px' }}>Did you know?</div>
      <div style={{ fontSize: '13px', color: isDark ? '#bbb' : '#4b5563' }}>The first operating system, GM-NAA I/O, was created in 1956 by General Motors for its IBM 704 computer.</div>
    </div>
  </div>
);

const GitHubPage = ({ isDark }) => (
  <div style={{ background: isDark ? '#0d1117' : '#f6f8fa', minHeight: '100%', color: isDark ? '#c9d1d9' : '#24292f' }}>
    <div style={{ padding: '12px 24px', background: isDark ? '#161b22' : '#24292f', borderBottom: isDark ? '1px solid #30363d' : '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Code size={28} color="#f0f6fc" />
      <span style={{ fontWeight: 700, fontSize: '18px', color: '#f0f6fc' }}>GitHub</span>
    </div>
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>OS</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: isDark ? '#f0f6fc' : '#24292f' }}>os-simulator</div>
          <div style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#57606a', marginBottom: '16px' }}>A web-based operating system simulator built with React</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['React', 'JavaScript', 'CSS', 'Vite'].map(t => (
              <span key={t} style={{ padding: '4px 12px', borderRadius: '16px', background: isDark ? 'rgba(56,139,253,0.15)' : 'rgba(0,0,0,0.05)', color: isDark ? '#58a6ff' : '#0969da', fontSize: '12px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[['Stars', '⭐ 1.2k'], ['Forks', '🍴 340'], ['Issues', '🐛 12']].map(([l, v]) => (
          <div key={l} style={{ padding: '16px', background: isDark ? '#161b22' : '#fff', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d0d7de', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#57606a' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', padding: '16px', background: isDark ? '#161b22' : '#fff', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d0d7de' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: isDark ? '#f0f6fc' : '#24292f' }}>README.md</div>
        <div style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#57606a', lineHeight: '1.6' }}>This project simulates core OS concepts including CPU scheduling (FCFS, SJF, Round Robin, SRTF, Priority), memory management (First Fit, Best Fit, Worst Fit), file system operations, and I/O device management through an interactive desktop environment.</div>
      </div>
    </div>
  </div>
);

const YouTubePage = ({ isDark, isWide }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [embedUrl, setEmbedUrl] = useState('https://www.youtube.com/embed/jfKfPfyJRdk');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      if (query.includes('v=') || query.includes('youtu.be/')) {
        const id = query.split('v=')[1]?.split('&')[0] || query.split('youtu.be/')[1]?.split('?')[0];
        if (id) {
          setEmbedUrl(`https://www.youtube.com/embed/${id}`);
          return;
        }
      }
      const encoded = encodeURIComponent(query);
      setEmbedUrl(`https://www.youtube.com/embed?listType=search&list=${encoded}`);
    }
  };

  return (
    <div style={{ background: isDark ? '#0f0f0f' : '#f9f9f9', minHeight: '100%', color: isDark ? '#fff' : '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px', background: isDark ? '#0f0f0f' : '#fff', borderBottom: isDark ? '1px solid #272727' : '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={24} color="#ff0000" fill="#ff0000" />
          <span style={{ fontWeight: 700, fontSize: '18px', color: isDark ? '#fff' : '#000', letterSpacing: '-0.5px' }}>YouTube</span>
        </div>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '450px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: '20px', padding: '6px 16px', border: isDark ? '1px solid #303030' : '1px solid #ccc' }}>
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search YouTube or paste video URL..." 
            style={{ flex: 1, background: 'none', border: 'none', color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none' }} 
          />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', paddingLeft: '8px' }}>
            <Search size={16} />
          </button>
        </form>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: isWide ? 'row' : 'column', padding: '20px', gap: '20px', overflowY: 'auto' }}>
        <div style={{ flex: isWide ? 2.5 : 'none', width: '100%', aspectRatio: '16/9', maxHeight: isWide ? '540px' : '420px', background: '#000', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <iframe 
            src={embedUrl}
            title="YouTube Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div style={{ flex: isWide ? 1 : 'none', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: isWide ? '280px' : 'none' }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Featured Playlists & Videos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: 'Lofi Girl Live Beats', url: 'https://www.youtube.com/embed/jfKfPfyJRdk', channel: 'Lofi Girl' },
              { title: 'Synthwave Radio Live', url: 'https://www.youtube.com/embed/4xDzrJKXOOY', channel: 'Lofi Girl' },
              { title: 'Operating Systems Course', url: 'https://www.youtube.com/embed?listType=search&list=operating+systems+crash+course+computer+science', channel: 'CrashCourse' },
              { title: 'Valorant VCT Highlights', url: 'https://www.youtube.com/embed/pAIWSyM9gAE', channel: 'Valorant' },
            ].map((v, i) => (
              <div 
                key={i} 
                onClick={() => setEmbedUrl(v.url)}
                style={{ padding: '10px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', border: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(0,0,0,0.02)' }}
                className="youtube-item"
              >
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px', color: isDark ? '#fff' : '#1a1a1a' }}>{v.title}</div>
                <div style={{ fontSize: '11px', color: isDark ? '#a0aec0' : '#475569' }}>{v.channel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = ({ url, isDark }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: isDark ? '#1a1a2e' : '#fff', color: isDark ? '#e0e0e0' : '#333' }}>
    <div style={{ fontSize: '72px', fontWeight: 800, color: '#ef4444', opacity: 0.7 }}>404</div>
    <div style={{ fontSize: '18px', color: isDark ? '#aaa' : '#666', marginTop: '8px' }}>Page not found</div>
    <div style={{ fontSize: '13px', color: isDark ? '#666' : '#999', marginTop: '12px' }}>Cannot connect to <strong style={{ color: isDark ? '#888' : '#555' }}>{url}</strong></div>
  </div>
);

const HomePage = ({ onNavigate, isDark }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px', minHeight: '100%', background: isDark ? '#1a1a2e' : '#f3f4f6' }}>
    <Globe size={48} color="#a78bfa" style={{ marginBottom: '16px' }} />
    <div style={{ fontSize: '24px', fontWeight: 600, color: isDark ? '#fff' : '#000', marginBottom: '8px' }}>New Tab</div>
    <div style={{ fontSize: '13px', color: isDark ? '#888' : '#64748b', marginBottom: '32px' }}>Browse simulated websites</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: '16px' }}>
      {BOOKMARKS.map(b => (
        <div key={b.url} onClick={() => onNavigate(b.url)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', borderRadius: '12px', transition: 'background 0.2s' }} className="browser-bookmark-item">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#a78bfa' }}>
            {b.name[0]}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#aaa' : '#4b5563' }}>{b.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const resolveUrl = (input) => {
  let url = input.trim();
  if (!url) return '';
  // Check if it is a search query or a direct URL
  const hasDot = url.includes('.');
  const hasSpace = url.includes(' ');
  if (!hasDot || hasSpace) {
    // If it's a search term, treat it as a Google query
    return `google.com/search?q=${encodeURIComponent(url)}`;
  }
  url = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  return url;
};

const getPageComponent = (url, onNavigate, isDark, isWide) => {
  const resolved = resolveUrl(url);
  if (!resolved || resolved === 'newtab') return <HomePage onNavigate={onNavigate} isDark={isDark} />;
  
  // Custom matched internal clients
  const lowerUrl = resolved.toLowerCase();
  if (lowerUrl.includes('google.com/search')) {
    // Check if the query is youtube
    const match = resolved.match(/q=([^&]+)/);
    const query = match ? decodeURIComponent(match[1]) : '';
    if (query.toLowerCase() === 'youtube') {
      return (
        <div style={{ padding: '40px', background: isDark ? '#1a1a2e' : '#fff', minHeight: '100%', color: isDark ? '#fff' : '#000' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Google Search Results for: "{query}"</div>
          <div onClick={() => onNavigate('youtube.com')} style={{ padding: '16px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--glass-border)', maxWidth: '600px' }}>
            <div style={{ color: '#ff0000', fontSize: '13px', marginBottom: '4px' }}>youtube.com</div>
            <div style={{ fontSize: '18px', color: isDark ? '#8ab4f8' : '#1a0dab', fontWeight: 600, marginBottom: '8px' }}>YouTube - Watch & Play Videos Online</div>
            <div style={{ fontSize: '13px', color: isDark ? '#ccc' : '#4b5563' }}>Explore latest music, games, news, and operating system lectures. Click here to launch our dynamic YouTube streaming client!</div>
          </div>
        </div>
      );
    }
  }
  if (lowerUrl.startsWith('google')) return <GooglePage onNavigate={onNavigate} isDark={isDark} isWide={isWide} />;
  if (lowerUrl.startsWith('wikipedia')) return <WikiPage isDark={isDark} />;
  if (lowerUrl.startsWith('github')) return <GitHubPage isDark={isDark} />;
  if (lowerUrl.startsWith('youtube')) return <YouTubePage isDark={isDark} isWide={isWide} />;
  
  // If it is a real URL (like another domain), render in a real iframe!
  if (url.startsWith('http://') || url.startsWith('https://') || url.includes('.')) {
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    return (
      <iframe 
        src={finalUrl} 
        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} 
        title="Web Browser" 
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    );
  }

  return <NotFoundPage url={url} isDark={isDark} />;
};

const Browser = () => {
  const { theme } = useOS();
  const [tabs, setTabs] = useState([{ id: 1, url: '', title: 'New Tab' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState({});
  const [historyIdx, setHistoryIdx] = useState({});
  const nextTabId = useRef(2);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

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

  const isWide = containerWidth > 800;
  const isDark = theme === 'dark';
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
    container: { height: '100%', display: 'flex', flexDirection: 'column', background: isDark ? '#1a1a2e' : '#f3f4f6', overflow: 'hidden' },
    tabBar: { display: 'flex', alignItems: 'flex-end', background: isDark ? '#0f0f23' : '#e2e8f0', padding: '0', height: '36px', gap: '1px', overflow: 'hidden' },
    tab: (active) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', background: active ? (isDark ? '#1a1a2e' : '#f3f4f6') : (isDark ? '#12122a' : '#d1d5db'), color: active ? (isDark ? '#fff' : '#000') : (isDark ? '#888' : '#4b5563'), borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: 'none', maxWidth: '180px', minWidth: '80px', height: active ? '34px' : '30px', marginTop: active ? '2px' : '6px', transition: 'all 0.15s' }),
    tabClose: { background: 'none', border: 'none', color: isDark ? '#666' : '#4b5563', cursor: 'pointer', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center', marginLeft: '4px' },
    addTab: { background: 'none', border: 'none', color: isDark ? '#666' : '#4b5563', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center' },
    navbar: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: isDark ? '#1a1a2e' : '#fff', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb' },
    navBtn: { background: 'none', border: 'none', color: isDark ? '#888' : '#4b5563', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
    urlBar: { flex: 1, display: 'flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderRadius: '20px', padding: '6px 14px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb' },
    urlInput: { flex: 1, background: 'none', border: 'none', color: isDark ? '#e0e0e0' : '#000', fontSize: '13px', outline: 'none' },
    bookmarkBar: { display: 'flex', gap: '4px', padding: '4px 12px', background: isDark ? '#1a1a2e' : '#fff', borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb' },
    bookmark: { background: 'none', border: 'none', color: isDark ? '#888' : '#4b5563', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' },
    content: { flex: 1, overflow: 'auto', background: isDark ? '#1a1a2e' : '#fff' },
    loader: { position: 'absolute', top: 0, left: 0, height: '2px', background: 'linear-gradient(90deg, #6366f1, #a78bfa, #ec4899)', animation: 'loadBar 0.5s ease-out forwards', width: '100%' },
  };

  return (
    <div ref={containerRef} style={styles.container}>
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
          <Globe size={14} color={isDark ? '#666' : '#9ca3af'} style={{ marginRight: '8px', flexShrink: 0 }} />
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
        {getPageComponent(activeTab.url, navigate, isDark, isWide)}
      </div>

      <style>{`
        @keyframes loadBar { from { width: 0%; } to { width: 100%; } }
        .browser-bookmark-item:hover {
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
        }
      `}</style>
    </div>
  );
};

export default Browser;
