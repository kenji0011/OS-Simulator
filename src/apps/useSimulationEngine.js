import { useState, useRef, useEffect, useCallback } from 'react';

// Help functions to generate random inclusive
const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const useSimulationEngine = () => {
    const [algorithm, setAlgorithm] = useState('FCFS');
    const [numProcesses, setNumProcesses] = useState(5);
    const [themeConfig, setThemeConfig] = useState({ quantum: 50, scaledSpeed: 10 });

    // UI state bound to the React Tree
    const [uiProcesses, setUiProcesses] = useState([]);
    const [uiGantt, setUiGantt] = useState([]);
    const [uiTime, setUiTime] = useState(0);
    const [uiMetrics, setUiMetrics] = useState({ avgWT: 0, avgTAT: 0, totalExec: 0 });
    const [uiReadyQueue, setUiReadyQueue] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    // MUTABLE ENGINE STATE (0 render overhead during calculations)
    const engineRef = useRef({
        processes: [],
        readyQueue: [],
        gantt: [],
        time: 0, // Current real simulation time
        clockSpeedMs: 50, // Physical JS tick ms
        simSpeedMultiplier: 10, // 50ms tick = 10ms of "burst time"
        activeProcessId: null,
        quantumProgress: 0, 
        completed: 0
    });

    const timerRef = useRef(null);

    // Generate N Processes
    const generateProcesses = useCallback((n) => {
        const newProcesses = [];
        for (let i = 1; i <= n; i++) {
            const bTime = getRandom(100, 400); // 100 to 400ms burst
            newProcesses.push({
                id: `P${i}`,
                arrivalTime: getRandom(0, 1500), // Random arrival
                burstTime: bTime,
                remainingBurstTime: bTime,
                priority: getRandom(1, 10), // 1 is highest priority
                startTime: null,
                endTime: null,
                waitTime: 0,
                turnaroundTime: 0,
                state: 'Not Arrived',
                color: `hsl(${getRandom(0, 360)}, 70%, 65%)`
            });
        }
        
        // Ensure at least one process arrives at 0
        const first = newProcesses.reduce((prev, curr) => prev.arrivalTime < curr.arrivalTime ? prev : curr);
        first.arrivalTime = 0;

        engineRef.current = {
            processes: newProcesses,
            readyQueue: [],
            gantt: [],
            time: 0,
            activeProcessId: null,
            quantumProgress: 0,
            completed: 0,
            simSpeedMultiplier: 10 // process 10 units each tick
        };
        
        forceSyncUI();
    }, []);

    const forceSyncUI = () => {
        const eng = engineRef.current;
        setUiProcesses([...eng.processes]);
        setUiGantt([...eng.gantt]);
        setUiTime(eng.time);
        setUiReadyQueue([...eng.readyQueue]);
        
        if (eng.completed === eng.processes.length && eng.processes.length > 0) {
            let totalWT = 0;
            let totalTAT = 0;
            eng.processes.forEach(p => {
                totalWT += p.waitTime;
                totalTAT += p.turnaroundTime;
            });
            setUiMetrics({
                avgWT: (totalWT / eng.processes.length).toFixed(1),
                avgTAT: (totalTAT / eng.processes.length).toFixed(1),
                totalExec: eng.time
            });
            setIsRunning(false);
            if(timerRef.current) clearInterval(timerRef.current);
        } else {
             setUiMetrics({ avgWT: 0, avgTAT: 0, totalExec: 0 });
        }
    };

    // The core tick loop
    const tick = useCallback(() => {
        const eng = engineRef.current;
        const ADVANCE_TIME = eng.simSpeedMultiplier; 
        eng.time += ADVANCE_TIME;

        // 1. Process Arrivals
        eng.processes.forEach(p => {
            if (p.state === 'Not Arrived' && eng.time >= p.arrivalTime) {
                p.state = 'Ready';
                eng.readyQueue.push(p.id);
            }
        });

        // 2. Scheduler Dispatch Logic
        let activeProc = eng.processes.find(p => p.id === eng.activeProcessId);

        // Preemption logic based on algorithm
        if (algorithm === 'Round Robin' && activeProc) {
            eng.quantumProgress += ADVANCE_TIME;
            if (activeProc.remainingBurstTime > 0 && eng.quantumProgress >= themeConfig.quantum) {
                // Preempt
                activeProc.state = 'Ready';
                eng.readyQueue.push(activeProc.id); // goes to back
                eng.activeProcessId = null;
                activeProc = null;
                eng.quantumProgress = 0;
            }
        } else if (algorithm === 'SRTF' && activeProc) {
            // Shortest Remaining Time First Preemption
            const shortestReady = getCurrentShortestRemaining();
            if (shortestReady && shortestReady.remainingBurstTime < activeProc.remainingBurstTime) {
                activeProc.state = 'Ready';
                eng.readyQueue.push(activeProc.id);
                eng.activeProcessId = null;
                activeProc = null;
            }
        } else if (algorithm === 'Priority' && activeProc) {
           // Priority Preemption (1 is highest)
           const highestPriReady = getCurrentHighestPriority();
           if (highestPriReady && highestPriReady.priority < activeProc.priority) {
                activeProc.state = 'Ready';
                eng.readyQueue.push(activeProc.id);
                eng.activeProcessId = null;
                activeProc = null;
           }
        }

        // 3. Selection if Idle
        if (!eng.activeProcessId && eng.readyQueue.length > 0) {
            let nextId = null;
            if (algorithm === 'FCFS' || algorithm === 'Round Robin') {
                nextId = eng.readyQueue.shift(); // FIFO
            } else if (algorithm === 'SJF' || algorithm === 'SRTF') {
                // find shortest remaining
                let shortest = eng.readyQueue[0];
                let minBurst = Infinity;
                eng.readyQueue.forEach(id => {
                    const p = eng.processes.find(x => x.id === id);
                    if (p.remainingBurstTime < minBurst) {
                        minBurst = p.remainingBurstTime;
                        shortest = id;
                    }
                });
                nextId = shortest;
                eng.readyQueue = eng.readyQueue.filter(id => id !== nextId);
            } else if (algorithm === 'Priority') {
                // Priority (1 is highest)
                let prioProcess = eng.readyQueue[0];
                let highest = Infinity;
                eng.readyQueue.forEach(id => {
                    const p = eng.processes.find(x => x.id === id);
                    if (p.priority < highest) {
                        highest = p.priority;
                        prioProcess = id;
                    }
                });
                nextId = prioProcess;
                eng.readyQueue = eng.readyQueue.filter(id => id !== nextId);
            }

            eng.activeProcessId = nextId;
            eng.quantumProgress = 0;
            
            let p = eng.processes.find(x => x.id === nextId);
            p.state = 'Running';
            if (p.startTime === null) p.startTime = eng.time;

            // Log Gantt snippet
            eng.gantt.push({
                processId: p.id,
                color: p.color,
                start: eng.time,
                end: eng.time + ADVANCE_TIME // updated dynamically
            });
        }

        // 4. Execution
        if (eng.activeProcessId) {
            activeProc = eng.processes.find(p => p.id === eng.activeProcessId);
            activeProc.remainingBurstTime = Math.max(0, activeProc.remainingBurstTime - ADVANCE_TIME);
            
            // Expand latest gantt block
            if(eng.gantt.length > 0) {
                eng.gantt[eng.gantt.length - 1].end = eng.time;
            }

            if (activeProc.remainingBurstTime === 0) {
                activeProc.state = 'Terminated';
                activeProc.endTime = eng.time;
                activeProc.turnaroundTime = activeProc.endTime - activeProc.arrivalTime;
                activeProc.waitTime = activeProc.turnaroundTime - activeProc.burstTime;
                eng.activeProcessId = null;
                eng.completed += 1;
            }
        }

        // Add Wait Time to processes in Ready Queue
        eng.readyQueue.forEach(id => {
            const p = eng.processes.find(x => x.id === id);
             // Purely visual tracking (actual WT calculated analytically at termination is safer)
        });

        // 5. Sync UI Frame
        forceSyncUI();
    }, [algorithm, themeConfig]);

    const getCurrentShortestRemaining = () => {
        const eng = engineRef.current;
        if(eng.readyQueue.length === 0) return null;
        let shortest = null;
        let minBurst = Infinity;
        eng.readyQueue.forEach(id => {
            const p = eng.processes.find(x => x.id === id);
            if (p.remainingBurstTime < minBurst) {
                minBurst = p.remainingBurstTime;
                shortest = p;
            }
        });
        return shortest;
    };

    const getCurrentHighestPriority = () => {
        const eng = engineRef.current;
        if(eng.readyQueue.length === 0) return null;
        let best = null;
        let highest = Infinity;
        eng.readyQueue.forEach(id => {
            const p = eng.processes.find(x => x.id === id);
            if (p.priority < highest) {
                highest = p.priority;
                best = p;
            }
        });
        return best;
    };

    const playSimulation = () => {
        if (isRunning) return;
        if (engineRef.current.completed === engineRef.current.processes.length) {
            generateProcesses(numProcesses); // auto reset if done
        }
        setIsRunning(true);
        timerRef.current = setInterval(tick, 50); // HTML tick running at ~20fps
    };

    const pauseSimulation = () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const resetSimulation = () => {
        pauseSimulation();
        generateProcesses(numProcesses);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Initial Gen
    useEffect(() => {
        generateProcesses(numProcesses);
        // eslint-disable-next-line
    }, []);

    const updateProcess = useCallback((processId, field, value) => {
        const eng = engineRef.current;
        const proc = eng.processes.find(p => p.id === processId);
        if (!proc) return;
        const numVal = parseInt(value) || 0;
        proc[field] = numVal;
        if (field === 'burstTime') {
            proc.remainingBurstTime = numVal;
        }
        forceSyncUI();
    }, []);

    return {
        algorithm, setAlgorithm,
        numProcesses, setNumProcesses,
        themeConfig, setThemeConfig,
        processes: uiProcesses,
        gantt: uiGantt,
        time: uiTime,
        readyQueue: uiReadyQueue,
        metrics: uiMetrics,
        isRunning,
        playSimulation, pauseSimulation, resetSimulation, generateProcesses,
        updateProcess
    };
};
