import React, { useState } from 'react';
import { MemoryStick, Play, Pause, Square, Plus, Trash2, RotateCcw, Info, Layers, Zap, Clock, Cpu, ChevronDown, Shuffle } from 'lucide-react';
import useMemoryEngine from './useMemoryEngine';

const S = {
  wrap: { height:'100%', display:'flex', background:'#12121f', color:'#e0e0e0', fontFamily:'Inter, sans-serif', overflow:'hidden' },
  side: { width:'300px', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', overflow:'hidden' },
  sideScroll: { flex:1, overflowY:'auto', padding:'10px', display:'flex', flexDirection:'column', gap:'10px' },
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  hdr: { padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'10px' },
  sec: { background:'rgba(0,0,0,0.3)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)' },
  secHdr: { padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:600 },
  inp: { padding:'7px 10px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'13px', outline:'none', width:'100%', fontFamily:'Inter, sans-serif' },
  sel: { padding:'7px 10px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.4)', color:'#fff', fontSize:'13px', outline:'none', width:'100%', fontFamily:'Inter, sans-serif' },
  lbl: { fontSize:'10px', color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' },
  btn: (bg, full) => ({ padding:'7px 12px', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', background:bg, color:'#fff', transition:'all 0.2s', width: full?'100%':'auto', fontFamily:'Inter, sans-serif' }),
  stat: { textAlign:'center', padding:'8px 6px', borderRadius:'8px', background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.04)' },
  logE: (t) => ({ padding:'5px 12px', fontSize:'11px', borderBottom:'1px solid rgba(255,255,255,0.02)', color: t==='error'?'#f87171':t==='success'?'#34d399':t==='warning'?'#fbbf24':'#94a3b8' }),
};

export default function MemoryManager() {
  const eng = useMemoryEngine();
  const stats = eng.getStats();
  const [pName, setPName] = useState('');
  const [pSize, setPSize] = useState('');
  const [pBurst, setPBurst] = useState('');
  const [mName, setMName] = useState('');
  const [mSize, setMSize] = useState('');
  const [addBlockSize, setAddBlockSize] = useState('');
  const [tab, setTab] = useState('process'); // process | algorithm

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
            <div style={{fontSize:'14px',fontWeight:700,color:'#fff'}}>Memory Manager</div>
            <div style={{fontSize:'10px',color:'#666'}}>Dynamic Partition Allocation</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{display:'flex',gap:'4px',padding:'8px 10px 0'}}>
          <button onClick={()=>setTab('process')} style={{...S.btn(tab==='process'?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.05)'),flex:1,fontSize:'11px'}}><Cpu size={12}/>Process Ctrl</button>
          <button onClick={()=>setTab('algorithm')} style={{...S.btn(tab==='algorithm'?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.05)'),flex:1,fontSize:'11px'}}><Zap size={12}/>Algorithm Ctrl</button>
        </div>

        <div style={S.sideScroll}>
          {tab === 'process' ? (<>
            {/* Simulation Controls */}
            <div style={S.sec}>
              <div style={S.secHdr}><Play size={13} color="#10b981"/>Simulation Control</div>
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={eng.startSim} disabled={eng.simState==='running'} style={{...S.btn(eng.simState==='running'?'#333':'#10b981'),flex:1,opacity:eng.simState==='running'?0.5:1}}><Play size={13}/>Start</button>
                  <button onClick={eng.pauseSim} disabled={eng.simState!=='running'} style={{...S.btn(eng.simState!=='running'?'#333':'#f59e0b'),flex:1,opacity:eng.simState!=='running'?0.5:1}}><Pause size={13}/>Pause</button>
                  <button onClick={eng.stopSim} disabled={eng.simState==='idle'} style={{...S.btn(eng.simState==='idle'?'#333':'#ef4444'),flex:1,opacity:eng.simState==='idle'?0.5:1}}><Square size={13}/>Stop</button>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'4px 8px',borderRadius:'6px',background:'rgba(0,0,0,0.2)'}}>
                  <Clock size={12} color="#a78bfa"/>
                  <span style={{fontSize:'11px',color:'#a78bfa',fontWeight:600}}>Time: {fmtTime(eng.totalTime)}</span>
                  <span style={{fontSize:'10px',color:'#555',marginLeft:'auto'}}>{eng.simState.toUpperCase()}</span>
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
                  <div style={{padding:'12px',textAlign:'center',fontSize:'11px',color:'#555'}}>Queue empty</div>
                ) : eng.processQueue.map((p,i) => (
                  <div key={p.id+i} style={{padding:'6px 12px',fontSize:'11px',display:'flex',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                    <span style={{color:'#fff',fontWeight:500}}>{p.id} — {p.name}</span>
                    <span style={{color:'#888'}}>{p.size}KB / {p.burst}ms</span>
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
                  <option value="first-fit">First Fit</option>
                  <option value="best-fit">Best Fit</option>
                  <option value="worst-fit">Worst Fit</option>
                </select>
                <div style={{marginTop:'8px',padding:'8px',borderRadius:'6px',background:'rgba(0,0,0,0.2)',fontSize:'10px',color:'#888',lineHeight:'1.5'}}>
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
                <div style={{fontSize:'11px',color:'#888',lineHeight:'1.5'}}>Compaction moves all allocated blocks together, consolidating free space into one contiguous region.</div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'6px',background:'rgba(0,0,0,0.2)'}}>
                  <span style={{fontSize:'11px',color:'#f59e0b',fontWeight:600}}>External Fragmentation:</span>
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
                <div style={{fontSize:'10px',color:'#666',marginTop:'4px'}}>Elapsed simulation time</div>
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

          <button style={S.btn('rgba(239,68,68,0.25)',true)} onClick={eng.reset}><RotateCcw size={13}/>Reset All</button>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={S.main}>
        <div style={S.hdr}>
          <Layers size={16} color="#a78bfa"/>
          <span style={{fontSize:'14px',fontWeight:600,color:'#fff'}}>Memory Map</span>
          <span style={{fontSize:'11px',color:'#555'}}>{stats.total}KB — {stats.freeCount} free block(s)</span>
          <div style={{flex:1}}/>
          <span style={{fontSize:'11px',color:'#555'}}>Click allocated block to deallocate</span>
        </div>

        {/* Stats Bar */}
        <div style={{display:'flex',gap:'8px',padding:'8px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          {[
            { label:'Total', val:`${stats.total}KB`, color:'#6366f1' },
            { label:'Used', val:`${stats.used}KB`, color:'#10b981' },
            { label:'Free', val:`${stats.free}KB`, color:'#3b82f6' },
            { label:'Fragmentation', val:`${stats.frag}%`, color:'#f59e0b' },
            { label:'Largest Free', val:`${stats.largest}KB`, color:'#06b6d4' },
          ].map(s => (
            <div key={s.label} style={S.stat}>
              <div style={{fontSize:'14px',fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontSize:'9px',color:'#666'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Memory Map Visual */}
        <div style={{flex:1,padding:'16px',overflowY:'auto'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'2px',borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
            {eng.blocks.map(block => {
              const totalSize = eng.blocks.reduce((s,b)=>s+b.size,0);
              const h = Math.max(34, (block.size/totalSize)*450);
              const free = !block.pid;
              return (
                <div key={block.id} onClick={()=>!free&&!block.locked&&eng.deallocateBlock(block.id)}
                  style={{
                    height:`${h}px`, minHeight:'34px',
                    background: free
                      ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
                      : `linear-gradient(135deg, ${block.color}cc, ${block.color}77)`,
                    display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px',
                    cursor: free||block.locked?'default':'pointer',
                    transition:'all 0.25s', borderBottom:'1px solid rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={e=>{if(!free&&!block.locked)e.currentTarget.style.filter='brightness(1.25)';}}
                  onMouseLeave={e=>{e.currentTarget.style.filter='none';}}
                  title={free?`Free: ${block.size}KB`:block.locked?'OS Reserved':`Click to free ${block.name}`}
                >
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontWeight:700,fontSize:'12px',color:free?'#444':'#fff',textShadow:free?'none':'0 1px 3px rgba(0,0,0,0.4)'}}>
                      {free?'FREE':`${block.pid} — ${block.name}`}
                    </span>
                    {block.locked && <span style={{fontSize:'9px',padding:'1px 5px',borderRadius:'3px',background:'rgba(0,0,0,0.3)',color:'#fbbf24'}}>LOCKED</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'10px',color:free?'#444':'rgba(255,255,255,0.7)'}}>{block.start}—{block.start+block.size}</span>
                    <span style={{fontWeight:700,fontSize:'12px',padding:'2px 8px',borderRadius:'5px',background:free?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.25)',color:free?'#555':'#fff'}}>{block.size}KB</span>
                    {!free&&!block.locked && <Trash2 size={12} color="rgba(255,255,255,0.4)"/>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Usage Bar */}
          <div style={{marginTop:'12px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#666',marginBottom:'3px'}}>
              <span>Memory Usage</span><span>{((stats.used/stats.total)*100).toFixed(1)}%</span>
            </div>
            <div style={{height:'10px',borderRadius:'5px',background:'rgba(255,255,255,0.05)',overflow:'hidden'}}>
              <div style={{width:`${(stats.used/stats.total)*100}%`,height:'100%',borderRadius:'5px',background: stats.used/stats.total>0.85?'linear-gradient(90deg,#ef4444,#f87171)':stats.used/stats.total>0.6?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#6366f1,#a78bfa)',transition:'width 0.4s'}}/>
            </div>
          </div>
        </div>

        {/* Log */}
        <div style={{height:'160px',borderTop:'1px solid rgba(255,255,255,0.06)',overflowY:'auto'}}>
          <div style={{padding:'6px 14px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'11px',fontWeight:600,color:'#fff',display:'flex',alignItems:'center',gap:'5px',position:'sticky',top:0,background:'#12121f',zIndex:1}}>
            <Info size={12}/>Allocation Log
          </div>
          {eng.log.map((e,i) => (
            <div key={i} style={S.logE(e.type)}>
              <span style={{color:'#444',marginRight:'6px'}}>{e.t}</span>{e.m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
