import React, { useState } from 'react';
import { MemoryStick, Play, Pause, Square, Plus, Trash2, RotateCcw, Info, Layers, Zap, Clock, Cpu, ChevronDown, Shuffle } from 'lucide-react';
import useMemoryEngine from './useMemoryEngine';
import { useOS } from '../context/OSContext';

export default function MemoryManager() {
  const { theme } = useOS();
  const eng = useMemoryEngine();
  const stats = eng.getStats();
  
  const [pName, setPName] = useState('');
  const [pSize, setPSize] = useState('');
  const [pBurst, setPBurst] = useState('');
  const [mName, setMName] = useState('');
  const [mSize, setMSize] = useState('');
  const [addBlockSize, setAddBlockSize] = useState('');
  const [tab, setTab] = useState('process'); // process | algorithm

  const isDark = theme === 'dark';

  const S = {
    wrap: { height:'100%', display:'flex', background: isDark ? '#12121f' : '#f3f4f6', color: isDark ? '#e0e0e0' : '#1e293b', fontFamily:'Inter, sans-serif', overflow:'hidden' },
    side: { width:'300px', borderRight: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb', display:'flex', flexDirection:'column', overflow:'hidden' },
    sideScroll: { flex:1, overflowY:'auto', padding:'10px', display:'flex', flexDirection:'column', gap:'10px' },
    main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
    hdr: { padding:'12px 16px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', display:'flex', alignItems:'center', gap:'10px' },
    sec: { background: isDark ? 'rgba(0,0,0,0.3)' : '#fff', borderRadius:'10px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' },
    secHdr: { padding:'8px 12px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f3f4f6', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:600, color: isDark ? '#fff' : '#000' },
    inp: { padding:'7px 10px', borderRadius:'6px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ccc', background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', color: isDark ? '#fff' : '#000', fontSize:'13px', outline:'none', width:'100%', fontFamily:'Inter, sans-serif' },
    sel: { padding:'7px 10px', borderRadius:'6px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ccc', background: isDark ? 'rgba(0,0,0,0.4)' : '#fff', color: isDark ? '#fff' : '#000', fontSize:'13px', outline:'none', width:'100%', fontFamily:'Inter, sans-serif' },
    lbl: { fontSize:'10px', color: isDark ? '#888' : '#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' },
    btn: (bg, full = false, color = '#fff') => ({ padding:'7px 12px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', background:bg, color:color, transition:'all 0.2s', width: full?'100%':'auto', fontFamily:'Inter, sans-serif' }),
    stat: { textAlign:'center', padding:'8px 6px', borderRadius:'8px', background: isDark ? 'rgba(0,0,0,0.25)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb', flex: 1, boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.02)' },
    logE: (t) => ({ padding:'5px 12px', fontSize:'11px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid #f3f4f6', color: t==='error'?'#f87171':t==='success'?'#34d399':t==='warning'?'#fbbf24':(isDark ? '#94a3b8' : '#4b5563'), textShadow: isDark ? 'none' : 'none' }),
  };

  const handleAdd = () => {
    const sz = parseInt(pSize); const bu = parseInt(pBurst);
    if (!sz || sz <= 0) return;
    eng.addProcess(pName, sz, bu || 2000);
    setPName(''); setPSize(''); setPBurst('');
  };
  const handleManual = () => {
    const sz = parseInt(mSize);
    if (!sz || sz <= 0) return;
    eng.manualAllocate(mName, sz);
    setMName(''); setMSize('');
  };
  const handleAddBlock = () => {
    const sz = parseInt(addBlockSize);
    if (!sz || sz <= 0) return;
    eng.addMemoryBlock(sz);
    setAddBlockSize('');
  };
  const fmtTime = (ms) => { const s = Math.floor(ms/1000); const m = Math.floor(s/60); return `${m}:${String(s%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`; };

  return (
    <div style={S.wrap}>
      {/* ===== SIDEBAR ===== */}
      <div style={S.side}>
        <div style={{...S.hdr, gap:'8px'}}>
          <MemoryStick size={18} color="#ec4899" />
          <div>
            <div style={{fontSize:'14px',fontWeight:700,color: isDark ? '#fff' : '#000'}}>Memory Manager</div>
            <div style={{fontSize:'10px',color: isDark ? '#888' : '#64748b'}}>Dynamic Partition Allocation</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{display:'flex',gap:'4px',padding:'8px 10px 0'}}>
          <button 
            onClick={()=>setTab('process')} 
            style={{
              ...S.btn(
                tab==='process' 
                  ? '#6366f1' 
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                true,
                tab==='process' ? '#fff' : (isDark ? '#888' : '#4b5563')
              ),
              flex:1,
              fontSize:'11px'
            }}
          >
            <Cpu size={12}/>Process Ctrl
          </button>
          <button 
            onClick={()=>setTab('algorithm')} 
            style={{
              ...S.btn(
                tab==='algorithm' 
                  ? '#f59e0b' 
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                true,
                tab==='algorithm' ? '#fff' : (isDark ? '#888' : '#4b5563')
              ),
              flex:1,
              fontSize:'11px'
            }}
          >
            <Zap size={12}/>Algorithm Ctrl
          </button>
        </div>

        <div style={S.sideScroll}>
          {tab === 'process' ? (<>
            {/* Simulation Controls */}
            <div style={S.sec}>
              <div style={S.secHdr}><Play size={13} color="#10b981"/>Simulation Control</div>
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={eng.startSim} disabled={eng.simState==='running'} style={{...S.btn(eng.simState==='running'?(isDark ? '#222' : '#ddd'):'#10b981', false, eng.simState==='running'?'#888':'#fff'),flex:1,opacity:eng.simState==='running'?0.5:1}}><Play size={13}/>Start</button>
                  <button onClick={eng.pauseSim} disabled={eng.simState!=='running'} style={{...S.btn(eng.simState!=='running'?(isDark ? '#222' : '#ddd'):'#f59e0b', false, eng.simState!=='running'?'#888':'#fff'),flex:1,opacity:eng.simState!=='running'?0.5:1}}><Pause size={13}/>Pause</button>
                  <button onClick={eng.stopSim} disabled={eng.simState==='idle'} style={{...S.btn(eng.simState==='idle'?(isDark ? '#222' : '#ddd'):'#ef4444', false, eng.simState==='idle'?'#888':'#fff'),flex:1,opacity:eng.simState==='idle'?0.5:1}}><Square size={13}/>Stop</button>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'4px 8px',borderRadius:'6px',background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'}}>
                  <Clock size={12} color="#a78bfa"/>
                  <span style={{fontSize:'11px',color:'#a78bfa',fontWeight:600}}>Time: {fmtTime(eng.totalTime)}</span>
                  <span style={{fontSize:'10px',color: isDark ? '#888' : '#64748b',marginLeft:'auto'}}>{eng.simState.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Add Process to Queue */}
            <div style={S.sec}>
              <div style={S.secHdr}><Plus size={13} color="#10b981"/>Add Process to Queue</div>
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:'6px'}}>
                <div><div style={S.lbl}>Name</div><input style={S.inp} value={pName} onChange={e=>setPName(e.target.value)} placeholder="Process name"/></div>
                <div style={{display:'flex',gap:'6px'}}>
                  <div style={{flex:1}}><div style={S.lbl}>Size (KB)</div><input style={S.inp} type="number" value={pSize} onChange={e=>setPSize(e.target.value)} placeholder="128" min="1"/></div>
                  <div style={{flex:1}}><div style={S.lbl}>Burst (ms)</div><input style={S.inp} type="number" value={pBurst} onChange={e=>setPBurst(e.target.value)} placeholder="2000" min="100"/></div>
                </div>
                <button style={S.btn('#10b981',true)} onClick={handleAdd}><Plus size={13}/>Add</button>
              </div>
            </div>

            {/* Process Queue */}
            <div style={S.sec}>
              <div style={S.secHdr}><Layers size={13} color="#6366f1"/>Process Queue ({eng.processQueue.length})</div>
              <div style={{maxHeight:'120px',overflowY:'auto'}}>
                {eng.processQueue.length===0 ? (
                  <div style={{padding:'12px',textAlign:'center',fontSize:'11px',color: isDark ? '#888' : '#64748b'}}>Queue empty</div>
                ) : eng.processQueue.map((p,i) => (
                  <div key={p.id+i} style={{padding:'6px 12px',fontSize:'11px',display:'flex',justifyContent:'space-between',borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.05)'}}>
                    <span style={{color: isDark ? '#fff' : '#000',fontWeight:500}}>{p.id} — {p.name}</span>
                    <span style={{color: isDark ? '#888' : '#64748b'}}>{p.size}KB / {p.burst}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Allocate */}
            <div style={S.sec}>
              <div style={S.secHdr}><Plus size={13} color="#8b5cf6"/>Manual Allocate</div>
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:'6px'}}>
                <div style={{display:'flex',gap:'6px'}}>
                  <div style={{flex:1}}><div style={S.lbl}>Name</div><input style={S.inp} value={mName} onChange={e=>setMName(e.target.value)} placeholder="Name"/></div>
                  <div style={{flex:1}}><div style={S.lbl}>Size (KB)</div><input style={S.inp} type="number" value={mSize} onChange={e=>setMSize(e.target.value)} placeholder="128"/></div>
                </div>
                <button style={S.btn('#8b5cf6',true)} onClick={handleManual}><Plus size={13}/>Allocate</button>
              </div>
            </div>
          </>) : (<>
            {/* Algorithm Selector */}
            <div style={S.sec}>
              <div style={S.secHdr}><Zap size={13} color="#f59e0b"/>Memory Allocation</div>
              <div style={{padding:'10px 12px'}}>
                <div style={S.lbl}>Algorithm</div>
                <select value={eng.algorithm} onChange={e=>eng.setAlgorithm(e.target.value)} style={S.sel}>
                  <option value="first-fit" style={{background: isDark ? '#12121f' : '#fff', color: isDark ? '#fff' : '#000'}}>First Fit</option>
                  <option value="best-fit" style={{background: isDark ? '#12121f' : '#fff', color: isDark ? '#fff' : '#000'}}>Best Fit</option>
                  <option value="worst-fit" style={{background: isDark ? '#12121f' : '#fff', color: isDark ? '#fff' : '#000'}}>Worst Fit</option>
                </select>
                <div style={{marginTop:'8px',padding:'8px',borderRadius:'6px',background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',fontSize:'10px',color: isDark ? '#a0aec0' : '#4b5563',lineHeight:'1.5'}}>
                  {eng.algorithm==='first-fit' && 'Allocates the first block that is large enough. Fast but may cause fragmentation.'}
                  {eng.algorithm==='best-fit' && 'Finds the smallest block that fits. Minimizes wasted space but slower.'}
                  {eng.algorithm==='worst-fit' && 'Finds the largest block. Leaves large remainders but reduces small fragments.'}
                </div>
              </div>
            </div>

            {/* Fragmentation Solution */}
            <div style={S.sec}>
              <div style={S.secHdr}><Shuffle size={13} color="#14b8a6"/>Fragmentation Solution</div>
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{fontSize:'11px',color: isDark ? '#a0aec0' : '#4b5563',lineHeight:'1.5'}}>Compaction moves all allocated blocks together, consolidating free space into one contiguous region.</div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'6px',background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'}}>
                  <span style={{fontSize:'11px',color: isDark ? '#fbbf24' : '#d97706',fontWeight:600}}>External Fragmentation:</span>
                  <span style={{fontSize:'13px',fontWeight:700,color: parseFloat(stats.frag)>30?'#ef4444':parseFloat(stats.frag)>10?'#f59e0b':'#10b981'}}>{stats.frag}%</span>
                </div>
                <button style={S.btn('#14b8a6',true)} onClick={eng.compact}><Shuffle size={13}/>Compact Memory</button>
              </div>
            </div>

            {/* Total Processing Time */}
            <div style={S.sec}>
              <div style={S.secHdr}><Clock size={13} color="#a78bfa"/>Total Processing Time</div>
              <div style={{padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:'28px',fontWeight:700,color:'#a78bfa',fontVariantNumeric:'tabular-nums'}}>{fmtTime(eng.totalTime)}</div>
                <div style={{fontSize:'10px',color: isDark ? '#888' : '#64748b',marginTop:'4px'}}>Elapsed simulation time</div>
              </div>
            </div>

            {/* Add Memory Block */}
            <div style={S.sec}>
              <div style={S.secHdr}><Plus size={13} color="#06b6d4"/>Add Memory Block</div>
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:'6px'}}>
                <div><div style={S.lbl}>Block Size (KB)</div><input style={S.inp} type="number" value={addBlockSize} onChange={e=>setAddBlockSize(e.target.value)} placeholder="256" min="1"/></div>
                <button style={S.btn('#06b6d4',true)} onClick={handleAddBlock}><Plus size={13}/>Add Block</button>
              </div>
            </div>
          </>)}

          <button style={S.btn(isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.15)',true, isDark ? '#fff' : '#ef4444')} onClick={eng.reset}><RotateCcw size={13}/>Reset All</button>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={S.main}>
        <div style={S.hdr}>
          <Layers size={16} color="#a78bfa"/>
          <span style={{fontSize:'14px',fontWeight:600,color: isDark ? '#fff' : '#000'}}>Memory Map</span>
          <span style={{fontSize:'11px',color: isDark ? '#888' : '#64748b'}}>{stats.total}KB — {stats.freeCount} free block(s)</span>
          <div style={{flex:1}}/>
          <span style={{fontSize:'11px',color: isDark ? '#888' : '#64748b'}}>Click allocated block to deallocate</span>
        </div>

        {/* Stats Bar */}
        <div style={{display:'flex',gap:'8px',padding:'8px 16px',borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb'}}>
          {[
            { label:'Total', val:`${stats.total}KB`, color:'#6366f1' },
            { label:'Used', val:`${stats.used}KB`, color:'#10b981' },
            { label:'Free', val:`${stats.free}KB`, color:'#3b82f6' },
            { label:'Fragmentation', val:`${stats.frag}%`, color:'#f59e0b' },
            { label:'Largest Free', val:`${stats.largest}KB`, color:'#06b6d4' },
          ].map(s => (
            <div key={s.label} style={S.stat}>
              <div style={{fontSize:'14px',fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontSize:'9px',color: isDark ? '#888' : '#64748b'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Memory Map Visual */}
        <div style={{flex:1,padding:'16px',overflowY:'auto'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'2px',borderRadius:'8px',overflow:'hidden',border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb'}}>
            {eng.blocks.map(block => {
              const totalSize = eng.blocks.reduce((s,b)=>s+b.size,0);
              const h = Math.max(34, (block.size/totalSize)*450);
              const free = !block.pid;
              return (
                <div key={block.id} onClick={()=>!free&&!block.locked&&eng.deallocateBlock(block.id)}
                  style={{
                    height:`${h}px`, minHeight:'34px',
                    background: free
                      ? `repeating-linear-gradient(45deg, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'} 10px, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 10px, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 20px)`
                      : `linear-gradient(135deg, ${block.color}cc, ${block.color}77)`,
                    display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px',
                    cursor: free||block.locked?'default':'pointer',
                    transition:'all 0.25s', borderBottom: isDark ? '1px solid rgba(0,0,0,0.3)' : '1px solid #e5e7eb',
                  }}
                  onMouseEnter={e=>{if(!free&&!block.locked)e.currentTarget.style.filter='brightness(1.25)';}}
                  onMouseLeave={e=>{e.currentTarget.style.filter='none';}}
                  title={free?`Free: ${block.size}KB`:block.locked?'OS Reserved':`Click to free ${block.name}`}
                >
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontWeight:700,fontSize:'12px',color: free ? (isDark ? '#888' : '#7f8c8d') : '#fff', textShadow:free?'none':'0 1px 3px rgba(0,0,0,0.4)'}}>
                      {free?'FREE':`${block.pid} — ${block.name}`}
                    </span>
                    {block.locked && <span style={{fontSize:'9px',padding:'1px 5px',borderRadius:'3px',background:'rgba(0,0,0,0.3)',color:'#fbbf24'}}>LOCKED</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'10px',color:free?(isDark ? '#888' : '#7f8c8d'):'rgba(255,255,255,0.8)'}}>{block.start}—{block.start+block.size}</span>
                    <span style={{fontWeight:700,fontSize:'12px',padding:'2px 8px',borderRadius:'5px',background:free?(isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'):'rgba(0,0,0,0.2)',color:free?(isDark ? '#888' : '#7f8c8d'):'#fff'}}>{block.size}KB</span>
                    {!free&&!block.locked && <Trash2 size={12} color="rgba(255,255,255,0.4)"/>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Usage Bar */}
          <div style={{marginTop:'12px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color: isDark ? '#888' : '#64748b',marginBottom:'3px'}}>
              <span>Memory Usage</span><span>{((stats.used/stats.total)*100).toFixed(1)}%</span>
            </div>
            <div style={{height:'10px',borderRadius:'5px',background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',overflow:'hidden'}}>
              <div style={{width:`${(stats.used/stats.total)*100}%`,height:'100%',borderRadius:'5px',background: stats.used/stats.total>0.85?'linear-gradient(90deg,#ef4444,#f87171)':stats.used/stats.total>0.6?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#6366f1,#a78bfa)',transition:'width 0.4s'}}/>
            </div>
          </div>
        </div>

        {/* Log */}
        <div style={{height:'160px',borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',overflowY:'auto'}}>
          <div style={{padding:'6px 14px',borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb',fontSize:'11px',fontWeight:600,color: isDark ? '#fff' : '#000',display:'flex',alignItems:'center',gap:'5px',position:'sticky',top:0,background: isDark ? '#12121f' : '#f3f4f6',zIndex:1}}>
            <Info size={12}/>Allocation Log
          </div>
          {eng.log.map((e,i) => (
            <div key={i} style={S.logE(e.type)}>
              <span style={{color: isDark ? '#444' : '#95a5a6',marginRight:'6px'}}>{e.t}</span>{e.m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
