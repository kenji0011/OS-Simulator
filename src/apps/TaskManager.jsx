import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { useSimulationEngine } from './useSimulationEngine';
import { useOS } from '../context/OSContext';

const TaskManager = () => {
  const sim = useSimulationEngine();
  const { theme } = useOS();

  const isDark = theme === 'dark';

  // Progress Bar Helper
  const renderProgressBar = (process) => {
    let progress = 0;
    if (process.state === 'Terminated') progress = 100;
    else if (process.state === 'Running' || process.state === 'Ready' || process.state === 'Waiting') {
        progress = ((process.burstTime - process.remainingBurstTime) / process.burstTime) * 100;
    }

    return (
      <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)', height: '16px', borderRadius: '8px', overflow: 'hidden', width: '100%', position: 'relative' }}>
          <div style={{ background: process.color, width: `${progress}%`, height: '100%', transition: 'width 0.1s linear' }} />
          <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
             {progress.toFixed(0)}%
          </span>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: isDark ? '#12121f' : '#fafafa', color: isDark ? '#e2e8f0' : '#1e293b', overflow: 'hidden' }}>
      {/* HEADER CONTROLS */}
      <div style={{ 
        padding: '16px', 
        background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', 
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--glass-border)', 
        display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' 
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Algorithm:</span>
            <select 
                value={sim.algorithm} 
                onChange={(e) => sim.setAlgorithm(e.target.value)}
                disabled={sim.isRunning || sim.time > 0}
                style={{ 
                  padding: '6px', 
                  borderRadius: '6px', 
                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc',
                  background: isDark ? '#1f1f2e' : '#fff',
                  color: isDark ? '#fff' : '#000'
                }}
            >
                <option value="FCFS" style={{ background: isDark ? '#1f1f2e' : '#fff', color: isDark ? '#fff' : '#000' }}>FCFS (First-Come)</option>
                <option value="Round Robin" style={{ background: isDark ? '#1f1f2e' : '#fff', color: isDark ? '#fff' : '#000' }}>Round Robin</option>
                <option value="SJF" style={{ background: isDark ? '#1f1f2e' : '#fff', color: isDark ? '#fff' : '#000' }}>SJF (Non-Preemptive)</option>
                <option value="SRTF" style={{ background: isDark ? '#1f1f2e' : '#fff', color: isDark ? '#fff' : '#000' }}>SRTF (Preemptive)</option>
                <option value="Priority" style={{ background: isDark ? '#1f1f2e' : '#fff', color: isDark ? '#fff' : '#000' }}>Priority (1 = Highest)</option>
            </select>
        </div>
        
        {sim.algorithm === 'Round Robin' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px' }}>Quantum (ms):</span>
                <input 
                  type="number" 
                  value={sim.themeConfig.quantum} 
                  onChange={e => sim.setThemeConfig({...sim.themeConfig, quantum: parseInt(e.target.value)})} 
                  disabled={sim.isRunning} 
                  style={{ 
                    width: '60px', padding: '4px',
                    borderRadius: '4px',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc',
                    background: isDark ? '#1f1f2e' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }} 
                />
            </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px' }}>Processes (N):</span>
            <input 
              type="number" 
              value={sim.numProcesses} 
              min="1" max="15" 
              onChange={e => sim.setNumProcesses(parseInt(e.target.value))} 
              style={{ 
                width: '50px', padding: '4px',
                borderRadius: '4px',
                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc',
                background: isDark ? '#1f1f2e' : '#fff',
                color: isDark ? '#fff' : '#000'
              }} 
            />
            <button onClick={() => sim.generateProcesses(sim.numProcesses)} style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }} disabled={sim.isRunning}>Generate</button>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: '8px' }}>
            <button 
                onClick={sim.isRunning ? sim.pauseSimulation : sim.playSimulation}
                style={{ padding: '8px 16px', background: sim.isRunning ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', fontWeight: 'bold' }}
            >
                {sim.isRunning ? <><Pause size={16}/> Pause</> : <><Play size={16}/> Start</>}
            </button>
            <button 
                onClick={sim.resetSimulation}
                style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', fontWeight: 'bold' }}
            >
                <RefreshCw size={16}/> Reset
            </button>
        </div>
      </div>

      <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* READY QUEUE METRIC */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ margin: 0 }}>Live Ready Queue</h4>
                <span style={{ color: isDark ? '#888' : '#666', fontSize: '13px' }}>Simulation Clock: {sim.time}ms</span>
            </div>
            <div style={{ 
              background: isDark ? '#1a1a2a' : 'rgba(255,255,255,0.7)', 
              padding: '12px', borderRadius: '8px', 
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #ddd', 
              fontFamily: 'monospace', minHeight: '44px', display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' 
            }}>
                {sim.readyQueue.length === 0 ? <span style={{ color: isDark ? '#64748b' : '#aaa' }}>Empty Queue</span> : null}
                {sim.readyQueue.map((id, index) => (
                    <React.Fragment key={index}>
                       <span style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>{id}</span>
                       {index < sim.readyQueue.length - 1 && <span style={{ color: isDark ? '#64748b' : '#999' }}>→</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* PROCESS TABLE */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
            <h4 style={{ margin: 0, marginBottom: '12px' }}>Active Processes</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)' }}>
                        <th style={{ padding: '8px' }}>PID</th>
                        <th>Arrival (ms)</th>
                        <th>Burst (ms)</th>
                        <th>Priority</th>
                        <th style={{ width: '20%' }}>Execution Progress</th>
                        <th>Wait Time</th>
                        <th>Turnaround</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sim.processes.map(p => (
                        <tr key={p.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', background: p.state === 'Running' ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)') : 'transparent' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold', color: p.color }}>{p.id}</td>
                            <td>
                              <input
                                type="number"
                                value={p.arrivalTime}
                                onChange={e => sim.updateProcess(p.id, 'arrivalTime', e.target.value)}
                                disabled={sim.isRunning || sim.time > 0}
                                min="0"
                                style={{ 
                                  width: '70px', padding: '4px 6px', borderRadius: '4px', 
                                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc', 
                                  background: (sim.isRunning || sim.time > 0) ? (isDark ? '#1a1a26' : '#eee') : (isDark ? '#1f1f2e' : '#fff'), 
                                  color: isDark ? '#fff' : '#000',
                                  fontSize: '13px' 
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={p.burstTime}
                                onChange={e => sim.updateProcess(p.id, 'burstTime', e.target.value)}
                                disabled={sim.isRunning || sim.time > 0}
                                min="10"
                                style={{ 
                                  width: '70px', padding: '4px 6px', borderRadius: '4px', 
                                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc', 
                                  background: (sim.isRunning || sim.time > 0) ? (isDark ? '#1a1a26' : '#eee') : (isDark ? '#1f1f2e' : '#fff'), 
                                  color: isDark ? '#fff' : '#000',
                                  fontSize: '13px' 
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={p.priority}
                                onChange={e => sim.updateProcess(p.id, 'priority', e.target.value)}
                                disabled={sim.isRunning || sim.time > 0}
                                min="1" max="10"
                                style={{ 
                                  width: '50px', padding: '4px 6px', borderRadius: '4px', 
                                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ccc', 
                                  background: (sim.isRunning || sim.time > 0) ? (isDark ? '#1a1a26' : '#eee') : (isDark ? '#1f1f2e' : '#fff'), 
                                  color: isDark ? '#fff' : '#000',
                                  fontSize: '13px' 
                                }}
                              />
                            </td>
                            <td style={{ paddingRight: '16px' }}>{renderProgressBar(p)}</td>
                            <td>{p.waitTime}ms</td>
                            <td>{p.turnaroundTime}ms</td>
                            <td style={{ fontWeight: 'bold', color: p.state === 'Running' ? '#10b981' : p.state === 'Ready' ? '#3b82f6' : (isDark ? '#94a3b8' : '#6b7280') }}>
                                {p.state}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* GANTT CHART */}
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
            <h4 style={{ margin: 0, marginBottom: '12px' }}>Dynamic Gantt Chart</h4>
            <div style={{ 
              background: isDark ? '#1a1a2a' : 'rgba(255,255,255,0.7)', 
              padding: '16px', borderRadius: '8px', 
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #ddd', 
              minHeight: '80px', display: 'flex', alignItems: 'stretch', position: 'relative' 
            }}>
                {sim.gantt.length === 0 ? <span style={{ color: isDark ? '#64748b' : '#aaa', alignSelf: 'center' }}>No execution data...</span> : null}
                {sim.gantt.map((block, index) => (
                    <div key={index} style={{ 
                        flex: Math.max(1, block.end - block.start),
                        background: block.color, 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRight: '1px solid rgba(255,255,255,0.3)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        position: 'relative'
                    }}>
                        {block.processId}
                        {/* Time markers */}
                        <div style={{ position: 'absolute', bottom: '-22px', fontSize: '10px', color: isDark ? '#888' : '#666', right: '-10px', zIndex: 10 }}>{block.end}</div>
                    </div>
                ))}
            </div>
            {/* Start marker */}
            {sim.gantt.length > 0 && <div style={{ fontSize: '10px', color: isDark ? '#888' : '#666', marginTop: '4px', marginLeft: '12px' }}>0</div>}
        </div>

        {/* METRICS DASHBOARD */}
        <div style={{ display: 'flex', gap: '16px' }}>
             <div className="glass-panel" style={{ flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
                 <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Average Wait Time (WT)</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c471ed', marginTop: '6px' }}>{sim.metrics.avgWT} ms</div>
             </div>
             <div className="glass-panel" style={{ flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
                 <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Average Turnaround (TAT)</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899', marginTop: '6px' }}>{sim.metrics.avgTAT} ms</div>
             </div>
             <div className="glass-panel" style={{ flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
                 <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Simulation Execution</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginTop: '6px' }}>{sim.metrics.totalExec} ms</div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default TaskManager;
