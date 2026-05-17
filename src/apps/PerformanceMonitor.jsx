import React, { useState, useEffect, useRef } from 'react';
import { Cpu, MemoryStick, HardDrive, Wifi, Monitor } from 'lucide-react';
import { useOS } from '../context/OSContext';

const MAX_POINTS = 60;

const generateRandom = (min, max) => Math.random() * (max - min) + min;

const PerformanceMonitor = () => {
  const { theme } = useOS();
  const [activeTab, setActiveTab] = useState('cpu');
  const [cpuHistory, setCpuHistory] = useState(Array(MAX_POINTS).fill(0));
  const [memHistory, setMemHistory] = useState(Array(MAX_POINTS).fill(0));
  const [diskHistory, setDiskHistory] = useState(Array(MAX_POINTS).fill(0));

  const [cpuUtil, setCpuUtil] = useState(0);
  const [memUsed, setMemUsed] = useState(11.1);
  const [diskActive, setDiskActive] = useState(0);
  const [uptime, setUptime] = useState(0);

  const uptimeRef = useRef(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      uptimeRef.current += 1;
      setUptime(uptimeRef.current);

      // CPU: fluctuates 2-40%, occasionally spikes
      const spike = Math.random() > 0.92 ? generateRandom(35, 75) : 0;
      const cpu = Math.min(100, generateRandom(2, 18) + spike);
      setCpuUtil(cpu);
      setCpuHistory(prev => [...prev.slice(1), cpu]);

      // Memory: hovers around 65-75%
      const mem = 10.2 + generateRandom(0, 2.5);
      setMemUsed(mem);
      setMemHistory(prev => [...prev.slice(1), (mem / 15.9) * 100]);

      // Disk: mostly idle with bursts
      const diskSpike = Math.random() > 0.85 ? generateRandom(20, 60) : 0;
      const disk = Math.min(100, generateRandom(0, 5) + diskSpike);
      setDiskActive(disk);
      setDiskHistory(prev => [...prev.slice(1), disk]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  // SVG Chart Builder
  const renderChart = (data, color, gradientId) => {
    const width = 600;
    const height = 200;
    const stepX = width / (MAX_POINTS - 1);

    const points = data.map((val, i) => `${i * stepX},${height - (val / 100) * height}`).join(' ');
    const areaPoints = `0,${height} ${points} ${(MAX_POINTS - 1) * stepX},${height}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1="0" y1={height - (v / 100) * height} x2={width} y2={height - (v / 100) * height}
            stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth="1" />
        ))}
        {/* Filled area */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  };

  const tabs = [
    { id: 'cpu', label: 'CPU', icon: Cpu, value: `${cpuUtil.toFixed(0)}%`, sub: '3.54 GHz' },
    { id: 'memory', label: 'Memory', icon: MemoryStick, value: `${memUsed.toFixed(1)}/15.9 GB`, sub: `${((memUsed / 15.9) * 100).toFixed(0)}%` },
    { id: 'disk', label: 'Disk 0 (C:)', icon: HardDrive, value: `${diskActive.toFixed(0)}%`, sub: 'SSD (SATA)' },
    { id: 'network', label: 'Ethernet', icon: Wifi, value: 'S: 0 R: 0', sub: 'Kbps' },
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case 'cpu': return { data: cpuHistory, color: '#c471ed', gradId: 'cpuGrad', title: 'CPU', subtitle: 'AMD Ryzen 9 7900X 12-Core Processor', label: '% Utilization' };
      case 'memory': return { data: memHistory, color: '#ec4899', gradId: 'memGrad', title: 'Memory', subtitle: '32.0 GB DDR5', label: '% In Use' };
      case 'disk': return { data: diskHistory, color: '#a78bfa', gradId: 'diskGrad', title: 'Disk 0 (C:)', subtitle: 'NVMe Gen4 SSD 1TB', label: '% Active Time' };
      case 'network': return { data: Array(MAX_POINTS).fill(0), color: '#60a5fa', gradId: 'netGrad', title: 'Ethernet', subtitle: 'Realtek PCIe 2.5GbE Controller', label: 'Throughput' };
      default: return { data: cpuHistory, color: '#c471ed', gradId: 'cpuGrad', title: 'CPU', subtitle: '', label: '% Utilization' };
    }
  };

  const active = getActiveData();

  const styles = {
    container: { height: '100%', display: 'flex', background: isDark ? '#1a1a2e' : '#f3f4f6', color: isDark ? '#e0e0e0' : '#1e293b', fontFamily: 'Inter, sans-serif', overflow: 'hidden' },
    iconSidebar: { width: '48px', background: isDark ? 'rgba(0,0,0,0.3)' : '#e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '6px', borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db' },
    iconBtn: (isActive) => ({ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: 'none', cursor: 'pointer', background: isActive ? (isDark ? 'rgba(196,113,237,0.25)' : 'rgba(196,113,237,0.15)') : 'transparent', color: isActive ? '#c471ed' : (isDark ? '#888' : '#64748b') }),
    sidebar: { width: '200px', background: isDark ? 'rgba(0,0,0,0.2)' : '#fff', borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', overflowY: 'auto', padding: '8px 0' },
    sideItem: (isActive) => ({ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', background: isActive ? (isDark ? 'rgba(196,113,237,0.15)' : 'rgba(196,113,237,0.08)') : 'transparent', borderLeft: isActive ? '3px solid #c471ed' : '3px solid transparent', transition: 'all 0.2s' }),
    main: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' },
    chartBox: { background: isDark ? 'rgba(0,0,0,0.3)' : '#fff', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', padding: '16px', marginBottom: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '16px 40px', fontSize: '13px' },
    statLabel: { color: isDark ? '#888' : '#64748b' },
    statValue: { color: isDark ? '#e0e0e0' : '#1e293b', textAlign: 'right', fontWeight: 600 },
  };

  const cpuStats = [
    ['Utilization', `${cpuUtil.toFixed(0)}%`], ['Speed', '4.70 GHz'],
    ['Processes', '309'], ['Threads', '4901'],
    ['Handles', '1934631'], ['Up time', formatUptime(uptime)],
    ['Base speed', '4.70 GHz'], ['Sockets', '1'],
    ['Cores', '12'], ['Logical processors', '24'],
    ['Virtualization', 'Enabled'], ['L1 cache', '768 KB'],
    ['L2 cache', '12.0 MB'], ['L3 cache', '64.0 MB'],
  ];

  const memStats = [
    ['In use', `${(memUsed * 2).toFixed(1)} GB`], ['Available', `${(32.0 - memUsed * 2).toFixed(1)} GB`],
    ['Committed', '26.4/36.8 GB'], ['Cached', '9.6 GB'],
    ['Paged pool', '1.2 GB'], ['Non-paged pool', '704 MB'],
    ['Speed', '5200 MHz'], ['Slots used', '2 of 4'],
    ['Form factor', 'UDIMM'], ['Hardware reserved', '144.6 MB'],
  ];

  const diskStats = [
    ['Active time', `${diskActive.toFixed(0)}%`], ['Average response time', `${generateRandom(0.1, 1.5).toFixed(1)} ms`],
    ['Read speed', `${(diskActive * 8.4).toFixed(0)} KB/s`], ['Write speed', `${(diskActive * 5.6).toFixed(0)} KB/s`],
    ['Capacity', '1024 GB'], ['Formatted', '953 GB'],
    ['System disk', 'Yes'], ['Type', 'SSD (NVMe)'],
  ];

  const getStatsForTab = () => {
    switch (activeTab) {
      case 'cpu': return cpuStats;
      case 'memory': return memStats;
      case 'disk': return diskStats;
      default: return [['Send', '0 Kbps'], ['Receive', '0 Kbps']];
    }
  };

  const miniChart = (data, color) => {
    const w = 60; const h = 24;
    const pts = data.slice(-20).map((v, i) => `${i * (w / 19)},${h - (v / 100) * h}`).join(' ');
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '60px', height: '24px' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div style={styles.container}>
      {/* Icon Sidebar */}
      <div style={styles.iconSidebar}>
        <button style={styles.iconBtn(true)}><Monitor size={18} /></button>
      </div>

      {/* Hardware Sidebar */}
      <div style={styles.sidebar}>
        <div style={{ padding: '8px 16px 16px', fontSize: '15px', fontWeight: 600, color: isDark ? '#fff' : '#000' }}>Performance</div>
        {tabs.map(tab => (
          <div key={tab.id} style={styles.sideItem(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <tab.icon size={16} color={activeTab === tab.id ? '#c471ed' : (isDark ? '#888' : '#64748b')} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: activeTab === tab.id ? (isDark ? '#fff' : '#000') : (isDark ? '#bbb' : '#475569') }}>{tab.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {miniChart(
                  tab.id === 'cpu' ? cpuHistory : tab.id === 'memory' ? memHistory : tab.id === 'disk' ? diskHistory : Array(20).fill(0),
                  activeTab === tab.id ? '#c471ed' : (isDark ? '#555' : '#cbd5e1')
                )}
                <span style={{ fontSize: '11px', color: isDark ? '#aaa' : '#64748b' }}>{tab.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: isDark ? '#fff' : '#000' }}>{active.title}</h2>
          <span style={{ fontSize: '13px', color: isDark ? '#aaa' : '#64748b' }}>{active.subtitle}</span>
        </div>

        {/* Chart */}
        <div style={styles.chartBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isDark ? '#888' : '#64748b', marginBottom: '8px' }}>
            <span>{active.label}</span>
            <span>100%</span>
          </div>
          {renderChart(active.data, active.color, active.gradId)}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: isDark ? '#666' : '#94a3b8', marginTop: '4px' }}>
            <span>60 seconds</span>
            <span>0</span>
          </div>
        </div>

        {/* Stats  */}
        <div style={styles.statsGrid}>
          {getStatsForTab().map(([label, value], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb' }}>
              <span style={styles.statLabel}>{label}</span>
              <span style={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
