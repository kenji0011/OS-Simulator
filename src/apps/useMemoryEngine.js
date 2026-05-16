import { useState, useRef, useCallback, useEffect } from 'react';

const TOTAL_MEMORY = 1024;
const COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316','#06b6d4','#84cc16','#e879f9','#fb923c','#22d3ee'];
let cidx = 0;
const nextColor = () => COLORS[cidx++ % COLORS.length];

const INIT_BLOCKS = [
  { id:'blk_os', start:0, size:64, pid:'OS', name:'Operating System', color:'#ef4444', locked:true },
  { id:'blk_free0', start:64, size:960, pid:null, name:null, color:null, locked:false },
];

export default function useMemoryEngine() {
  const [blocks, setBlocks] = useState(INIT_BLOCKS);
  const [algorithm, setAlgorithm] = useState('first-fit');
  const [processQueue, setProcessQueue] = useState([
    { id:'P1', name:'Browser', size:150, burst:3000 },
    { id:'P2', name:'Editor', size:80, burst:2000 },
    { id:'P3', name:'Compiler', size:200, burst:5000 },
  ]);
  const [log, setLog] = useState([{ t: new Date().toLocaleTimeString(), m:'System initialized. OS reserved 64 KB.', type:'info' }]);
  const [simState, setSimState] = useState('idle'); // idle|running|paused
  const [nextPid, setNextPid] = useState(4);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedBeforePause = useRef(0);
  // Track pending deallocation timeouts so we can cancel them on reset
  const deallocTimers = useRef([]);
  // Keep a ref of the process queue so runStep can read it synchronously
  const processQueueRef = useRef(processQueue);
  processQueueRef.current = processQueue;

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      deallocTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const addLog = useCallback((m, type='info') => {
    setLog(p => [{ t: new Date().toLocaleTimeString(), m, type }, ...p].slice(0,100));
  }, []);

  const getStats = useCallback(() => {
    const totalMem = blocks.reduce((s,b) => s + b.size, 0);
    const used = blocks.filter(b=>b.pid).reduce((s,b)=>s+b.size,0);
    const free = totalMem - used;
    const freeBlks = blocks.filter(b=>!b.pid);
    const largest = freeBlks.length ? Math.max(...freeBlks.map(b=>b.size)) : 0;
    const frag = freeBlks.length > 1 && free > 0 ? ((1 - largest/free)*100).toFixed(1) : '0.0';
    return { total: totalMem, used, free, largest, frag, freeCount: freeBlks.length };
  }, [blocks]);

  const findTarget = useCallback((blks, size) => {
    let idx = -1;
    if (algorithm === 'first-fit') {
      idx = blks.findIndex(b => !b.pid && b.size >= size);
    } else if (algorithm === 'best-fit') {
      let best = Infinity;
      blks.forEach((b,i) => { if (!b.pid && b.size >= size && b.size < best) { best=b.size; idx=i; }});
    } else {
      let worst = -1;
      blks.forEach((b,i) => { if (!b.pid && b.size >= size && b.size > worst) { worst=b.size; idx=i; }});
    }
    return idx;
  }, [algorithm]);

  const allocate = useCallback((proc, blks) => {
    const newBlks = [...blks];
    const idx = findTarget(newBlks, proc.size);
    if (idx === -1) return null;
    const target = newBlks[idx];
    const color = nextColor();
    const allocated = { id:`blk_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, start:target.start, size:proc.size, pid:proc.id, name:proc.name, color, locked:false };
    if (target.size > proc.size) {
      const rem = { id:`blk_f_${Date.now()}`, start:target.start+proc.size, size:target.size-proc.size, pid:null, name:null, color:null, locked:false };
      newBlks.splice(idx, 1, allocated, rem);
    } else {
      newBlks.splice(idx, 1, allocated);
    }
    return newBlks;
  }, [findTarget]);

  const mergeAdjacentFree = (blks) => {
    const m = [];
    for (const b of blks) {
      if (m.length && !m[m.length-1].pid && !b.pid) { m[m.length-1].size += b.size; }
      else m.push({...b});
    }
    return m;
  };

  const deallocateBlock = useCallback((blockId) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b=>b.id===blockId);
      if (idx===-1 || prev[idx].locked) return prev;
      const b = prev[idx];
      addLog(`Deallocated ${b.size} KB from "${b.name}" (${b.pid})`, 'warning');
      const nxt = [...prev];
      nxt[idx] = {...b, pid:null, name:null, color:null};
      return mergeAdjacentFree(nxt);
    });
  }, [addLog]);

  const addProcess = useCallback((name, size, burst) => {
    const id = `P${nextPid}`;
    setNextPid(p=>p+1);
    setProcessQueue(p=>[...p, { id, name: name||id, size, burst }]);
    addLog(`Added process "${name||id}" (${size} KB, ${burst}ms) to queue`, 'info');
  }, [nextPid, addLog]);

  const addMemoryBlock = useCallback((size) => {
    setBlocks(prev => {
      const last = prev[prev.length-1];
      const newStart = last ? last.start + last.size : 0;
      const nb = { id:`blk_add_${Date.now()}`, start:newStart, size, pid:null, name:null, color:null, locked:false };
      addLog(`Added ${size} KB memory block at offset ${newStart}`, 'info');
      return mergeAdjacentFree([...prev, nb]);
    });
  }, [addLog]);

  const compact = useCallback(() => {
    setBlocks(prev => {
      const allocated = prev.filter(b=>b.pid);
      const totalMem = prev.reduce((s,b)=>s+b.size,0);
      let offset = 0;
      const compacted = allocated.map(b => { const nb = {...b, start: offset}; offset += b.size; return nb; });
      const remaining = totalMem - offset;
      if (remaining > 0) {
        compacted.push({ id:`blk_free_comp_${Date.now()}`, start:offset, size:remaining, pid:null, name:null, color:null, locked:false });
      }
      addLog(`Compaction complete. ${allocated.length} blocks moved. Free space consolidated.`, 'success');
      return compacted;
    });
  }, [addLog]);

  // Ref to share allocation result between state updaters
  const lastAllocResult = useRef(false);

  // --- Simulation loop ---
  const runStep = useCallback(() => {
    // First, try to allocate the front of the queue
    setBlocks(prev => {
      // Peek at the current process queue via a ref-like approach
      // We need to read processQueue — use a ref updated in sync
      const queue = processQueueRef.current;
      if (!queue || queue.length === 0) {
        lastAllocResult.current = false;
        return prev;
      }
      const proc = queue[0];
      const result = allocate(proc, prev);
      if (result) {
        lastAllocResult.current = true;
        addLog(`Allocated ${proc.size} KB for "${proc.name}" (${proc.id}) [${algorithm}]`, 'success');
        // Schedule deallocation after burst time
        const timer = setTimeout(() => {
          setBlocks(bp => {
            const bi = bp.findIndex(b=>b.pid===proc.id);
            if (bi===-1) return bp;
            addLog(`Process "${proc.name}" (${proc.id}) finished after ${proc.burst}ms`, 'warning');
            const n = [...bp];
            n[bi] = {...n[bi], pid:null, name:null, color:null};
            return mergeAdjacentFree(n);
          });
        }, proc.burst);
        deallocTimers.current.push(timer);
        return result;
      } else {
        lastAllocResult.current = false;
        addLog(`Cannot allocate ${proc.size} KB for "${proc.name}" — no suitable block [${algorithm}]`, 'error');
        return prev;
      }
    });

    // Then update the queue based on whether allocation succeeded
    setProcessQueue(queue => {
      if (queue.length === 0) {
        setSimState('idle');
        addLog('All processes completed.', 'success');
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        return queue;
      }
      if (lastAllocResult.current) {
        return queue.slice(1);
      }
      return queue;
    });
  }, [allocate, algorithm, addLog]);

  const startSim = useCallback(() => {
    if (simState === 'running') return;
    setSimState('running');
    startTimeRef.current = Date.now();
    addLog(simState === 'paused' ? 'Simulation resumed.' : 'Simulation started.', 'info');
    timerRef.current = setInterval(() => {
      setTotalTime(elapsedBeforePause.current + (Date.now() - startTimeRef.current));
      runStep();
    }, 1500);
  }, [simState, runStep, addLog]);

  const pauseSim = useCallback(() => {
    if (simState !== 'running') return;
    setSimState('paused');
    elapsedBeforePause.current += Date.now() - startTimeRef.current;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    addLog('Simulation paused.', 'warning');
  }, [simState, addLog]);

  const stopSim = useCallback(() => {
    setSimState('idle');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    elapsedBeforePause.current = 0;
    setTotalTime(0);
    addLog('Simulation stopped.', 'error');
  }, [addLog]);

  const manualAllocate = useCallback((name, size) => {
    const nm = name || `P${nextPid}`;
    const pid = `P${nextPid}`;
    setNextPid(p=>p+1);
    setBlocks(prev => {
      const result = allocate({ id:pid, name:nm, size }, prev);
      if (result) {
        addLog(`Allocated ${size} KB for "${nm}" (${pid}) [${algorithm}]`, 'success');
        return result;
      }
      addLog(`FAILED: No suitable block for "${nm}" (${size} KB) [${algorithm}]`, 'error');
      return prev;
    });
  }, [allocate, nextPid, algorithm, addLog]);

  const reset = useCallback(() => {
    // Clear all timers
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    deallocTimers.current.forEach(t => clearTimeout(t));
    deallocTimers.current = [];
    cidx = 0;
    setBlocks(INIT_BLOCKS);
    setNextPid(4);
    setSimState('idle');
    setTotalTime(0);
    elapsedBeforePause.current = 0;
    setProcessQueue([
      { id:'P1', name:'Browser', size:150, burst:3000 },
      { id:'P2', name:'Editor', size:80, burst:2000 },
      { id:'P3', name:'Compiler', size:200, burst:5000 },
    ]);
    setLog([{ t: new Date().toLocaleTimeString(), m:'Memory reset.', type:'info' }]);
  }, []);

  return {
    blocks, algorithm, setAlgorithm, processQueue, log, simState, totalTime,
    getStats, deallocateBlock, addProcess, addMemoryBlock, compact,
    startSim, pauseSim, stopSim, manualAllocate, reset, TOTAL_MEMORY,
  };
}
