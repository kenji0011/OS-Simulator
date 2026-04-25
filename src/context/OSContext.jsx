import React, { createContext, useState, useContext } from 'react';

const OSContext = createContext();

export const useOS = () => useContext(OSContext);

export const OSProvider = ({ children }) => {
  // --- 1. FILE SYSTEM SIMULATION (Hierarchical) ---
  const [fileSystem, setFileSystem] = useState({
    id: 'root', name: 'C:', type: 'folder', children: [
      { id: 'desktop', name: 'Desktop', type: 'folder', children: [] },
      { id: 'docs', name: 'Documents', type: 'folder', children: [
        { id: 'f1', name: 'welcome.txt', type: 'file', content: 'Welcome to OS-Sim Windows 11 Edition!\n\nThis is a virtual file system.', size: 128 },
        { id: 'f2', name: 'grades.txt', type: 'file', content: 'Math: A\nOS: A+', size: 64 },
        { id: 'notes', name: 'Notes', type: 'folder', children: [
          { id: 'f3', name: 'todo.txt', type: 'file', content: '1. Finish OS project\n2. Study for finals', size: 48 },
        ]},
      ]},
      { id: 'downloads', name: 'Downloads', type: 'folder', children: [
        { id: 'f4', name: 'setup.exe', type: 'file', content: '[binary data]', size: 4096 },
      ]},
      { id: 'pictures', name: 'Pictures', type: 'folder', children: [] },
      { id: 'music', name: 'Music', type: 'folder', children: [] },
    ]
  });

  // Deep clone helper
  const cloneFS = (node) => JSON.parse(JSON.stringify(node));

  // Find a node by ID in the tree
  const findNode = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Find parent of a node
  const findParent = (node, id) => {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === id) return node;
        const found = findParent(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Get folder contents
  const getFolder = (folderId) => {
    const node = findNode(fileSystem, folderId);
    return node && node.type === 'folder' ? node : null;
  };

  // Legacy flat files getter (for Notepad compatibility)
  const getAllFiles = (node) => {
    let result = [];
    if (node.type === 'file') result.push(node);
    if (node.children) node.children.forEach(c => result.push(...getAllFiles(c)));
    return result;
  };
  const files = getAllFiles(fileSystem);

  const createFile = (parentId, name, content = 'New file content...') => {
    const fs = cloneFS(fileSystem);
    const parent = findNode(fs, parentId);
    if (parent && parent.type === 'folder') {
      parent.children.push({ id: `f_${Date.now()}`, name, type: 'file', content, size: content.length });
      setFileSystem(fs);
    }
  };

  const createFolder = (parentId, name) => {
    const fs = cloneFS(fileSystem);
    const parent = findNode(fs, parentId);
    if (parent && parent.type === 'folder') {
      parent.children.push({ id: `d_${Date.now()}`, name, type: 'folder', children: [] });
      setFileSystem(fs);
    }
  };

  const deleteItem = (id) => {
    const fs = cloneFS(fileSystem);
    const parent = findParent(fs, id);
    if (parent) {
      parent.children = parent.children.filter(c => c.id !== id);
      setFileSystem(fs);
    }
  };

  const renameItem = (id, newName) => {
    const fs = cloneFS(fileSystem);
    const node = findNode(fs, id);
    if (node) {
      node.name = newName;
      setFileSystem(fs);
    }
  };

  const updateFile = (id, newContent) => {
    const fs = cloneFS(fileSystem);
    const node = findNode(fs, id);
    if (node && node.type === 'file') {
      node.content = newContent;
      node.size = newContent.length;
      setFileSystem(fs);
    }
  };

  const moveItem = (id, newParentId) => {
    const fs = cloneFS(fileSystem);
    const parent = findParent(fs, id);
    const newParent = findNode(fs, newParentId);
    if (parent && newParent && newParent.type === 'folder') {
      const item = parent.children.find(c => c.id === id);
      parent.children = parent.children.filter(c => c.id !== id);
      newParent.children.push(item);
      setFileSystem(fs);
    }
  };

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null);
  
  // App linking state
  const [activeNotepadFile, setNotepadFile] = useState(null);
  const [systemAction, setSystemAction] = useState(null);
  const dispatchSystemAction = (action) => setSystemAction(action);

  const copyItem = (id) => {
    const node = findNode(fileSystem, id);
    if (node) setClipboard(cloneFS(node));
  };
  const pasteItem = (parentId) => {
    if (!clipboard) return;
    const fs = cloneFS(fileSystem);
    const parent = findNode(fs, parentId);
    if (parent && parent.type === 'folder') {
      const pasted = cloneFS(clipboard);
      pasted.id = `${pasted.id}_${Date.now()}`;
      pasted.name = `${pasted.name} (copy)`;
      parent.children.push(pasted);
      setFileSystem(fs);
    }
  };

  // Keep deleteFile for backward compat
  const deleteFile = (id) => deleteItem(id);

  // --- 2. MEMORY MANAGEMENT SIMULATION (Fixed Partitions) ---
  const [memoryBlocks, setMemoryBlocks] = useState([
    { id: 'M1', size: 100, processId: null },
    { id: 'M2', size: 200, processId: null },
    { id: 'M3', size: 300, processId: null },
    { id: 'M4', size: 400, processId: null },
  ]);

  // --- 3. PROCESS MANAGEMENT & CPU SCHEDULING (FCFS) ---
  // Initial processes ready to be scheduled
  const [processes, setProcesses] = useState([
    { id: 'P1', name: 'Browser', arrivalTime: 0, burstTime: 5, memoryReq: 150, state: 'Ready' },
    { id: 'P2', name: 'Notepad', arrivalTime: 1, burstTime: 3, memoryReq: 50, state: 'Ready' },
    { id: 'P3', name: 'Calculator', arrivalTime: 2, burstTime: 8, memoryReq: 250, state: 'Ready' },
  ]);

  const [ioQueue, setIoQueue] = useState([]); // Array of strings (print jobs)
  const [ganttChart, setGanttChart] = useState([]);
  const [logs, setLogs] = useState(["System Initialized"]);

  const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const addProcess = (name, burst, mem) => {
    const newP = {
      id: `P${processes.length + 1}`,
      name,
      arrivalTime: processes.length,
      burstTime: burst,
      memoryReq: mem,
      state: 'Ready'
    };
    setProcesses([...processes, newP]);
    addLog(`Process ${newP.id} created.`);
  };

  const runSchedulerFCFS = async () => {
    addLog("Started FCFS CPU Scheduling...");
    
    // Reset states visually first
    setMemoryBlocks(prev => prev.map(m => ({...m, processId: null})));
    setGanttChart([]);
    // Clone processes to manipulate locally and put back into state dynamically
    let procCopy = [...processes].map(p => ({...p, state: 'Ready'}));
    setProcesses([...procCopy]);

    let currentTime = 0;
    
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    for (let i = 0; i < procCopy.length; i++) {
        let p = procCopy[i];

        // 1. Allocate Memory
        let allocatedId = null;
        setMemoryBlocks(prev => {
            let updated = [...prev];
            let block = updated.find(m => m.processId === null && m.size >= p.memoryReq);
            if (block) {
                block.processId = p.id;
                allocatedId = block.id;
            }
            return updated;
        });

        if (!allocatedId) {
            addLog(`Process ${p.id} WAIT: Not enough memory.`);
            p.state = 'Waiting for Memory';
            setProcesses([...procCopy]);
            await sleep(1000);
            continue;
        }

        // 2. CPU Execution
        addLog(`Process ${p.id} moved to Running state.`);
        p.state = 'Running';
        setProcesses([...procCopy]);
        
        await sleep(1000); // Simulate execution time

        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }
        
        let startTime = currentTime;
        currentTime += p.burstTime;
        let completionTime = currentTime;
        
        setGanttChart(prev => [...prev, {
            processId: p.id,
            name: p.name,
            start: startTime,
            end: completionTime,
            duration: p.burstTime
        }]);

        p.state = 'Terminated';
        p.waitingTime = startTime - p.arrivalTime;
        p.turnaroundTime = completionTime - p.arrivalTime;
        setProcesses([...procCopy]);
        addLog(`Process ${p.id} terminated.`);

        // 3. Deallocate memory
        setMemoryBlocks(prev => {
             let updated = [...prev];
             let block = updated.find(m => m.id === allocatedId);
             if (block) block.processId = null;
             return updated;
        });
        
        await sleep(500); // brief pause before next process
    }
  };

  // --- 4. I/O SIMULATION ---
  const addToPrinterQueue = (document) => {
    setIoQueue(prev => [...prev, document]);
    addLog(`I/O Request: Added "${document}" to printer queue.`);
  };
  
  const processNextIo = () => {
    if (ioQueue.length > 0) {
      const doc = ioQueue[0];
      setIoQueue(prev => prev.slice(1));
      addLog(`I/O Completed: Printed "${doc}".`);
    }
  };

  return (
    <OSContext.Provider value={{
      files, fileSystem, getFolder, createFile, createFolder, updateFile, deleteFile, deleteItem, renameItem, moveItem, copyItem, pasteItem, clipboard,
      activeNotepadFile, setNotepadFile, systemAction, dispatchSystemAction,
      memoryBlocks,
      processes, addProcess, runSchedulerFCFS, ganttChart, logs,
      ioQueue, addToPrinterQueue, processNextIo
    }}>
      {children}
    </OSContext.Provider>
  );
};
