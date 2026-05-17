import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HardDrive, RefreshCw, Plus, Trash2, Database, Layers, Activity, AlertCircle } from 'lucide-react';
import { useOS } from '../context/OSContext';

const DiskManagement = () => {
  const { theme } = useOS();
  
  // Static volume metadata and partition states
  const [disks, setDisks] = useState([
    {
      id: 0,
      name: 'Disk 0 (SSD)',
      type: 'Basic',
      capacity: 512, // GB
      status: 'Online',
      partitions: [
        { id: 'p0-1', label: 'System Reserved', letter: '', size: 0.5, fs: 'FAT32', status: 'Healthy (System)', type: 'primary' },
        { id: 'p0-2', label: 'Local Disk', letter: 'C', size: 380, fs: 'NTFS', status: 'Healthy (Boot, Page File, Crash Dump)', type: 'primary' },
        { id: 'p0-3', label: 'Recovery Partition', letter: '', size: 1.5, fs: 'NTFS', status: 'Healthy (Recovery)', type: 'primary' },
        { id: 'p0-4', label: 'Unallocated', letter: '', size: 130, fs: '', status: 'Unallocated', type: 'unallocated' }
      ]
    },
    {
      id: 1,
      name: 'Disk 1 (USB Removable)',
      type: 'Basic',
      capacity: 64, // GB
      status: 'Online',
      partitions: [
        { id: 'p1-1', label: 'USB Drive', letter: 'D', size: 48, fs: 'FAT32', status: 'Healthy (Active, Primary Partition)', type: 'primary' },
        { id: 'p1-2', label: 'Unallocated', letter: '', size: 16, fs: '', status: 'Unallocated', type: 'unallocated' }
      ]
    }
  ]);

  const [selectedPartition, setSelectedPartition] = useState(null);
  
  // Modal states for operations
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showShrinkModal, setShowShrinkModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);

  // Form input states
  const [newVolumeLetter, setNewVolumeLetter] = useState('E');
  const [newVolumeLabel, setNewVolumeLabel] = useState('New Volume');
  const [newVolumeSize, setNewVolumeSize] = useState(10);
  const [newVolumeFs, setNewVolumeFs] = useState('NTFS');

  const [formatLabel, setFormatLabel] = useState('Formatted Disk');
  const [formatFs, setFormatFs] = useState('NTFS');

  const [shrinkAmount, setShrinkAmount] = useState(10);
  const [extendAmount, setExtendAmount] = useState(10);

  // Canvas-based performance graph setup (extremely optimized, 0 FPS drops)
  const canvasRef = useRef(null);
  const dataPoints = useRef([]);
  const animationFrameId = useRef(null);

  // Available letters helper
  const availableLetters = useMemo(() => {
    const used = new Set();
    disks.forEach(d => d.partitions.forEach(p => {
      if (p.letter) used.add(p.letter);
    }));
    return ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T'].filter(l => !used.has(l));
  }, [disks]);

  // Set default letter when modal opens
  useEffect(() => {
    if (availableLetters.length > 0) {
      setNewVolumeLetter(availableLetters[0]);
    }
  }, [availableLetters, showCreateModal]);

  // Handle high-performance disk simulation graphing (canvas render)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill initial values
    if (dataPoints.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        dataPoints.current.push(Math.random() * 15 + 5); // baseline active disk time
      }
    }

    const drawGraph = () => {
      // Clean canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Shift graph data randomly simulating disk active usage
      dataPoints.current.shift();
      const currentLoad = Math.min(100, Math.max(1, dataPoints.current[dataPoints.current.length - 1] + (Math.random() * 20 - 10)));
      dataPoints.current.push(currentLoad);

      // Paint grid background
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 1;
      const gridSpacing = 20;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw active disk fill gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)'); // Light purple glow
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');

      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      const step = canvas.width / (dataPoints.current.length - 1);
      dataPoints.current.forEach((val, index) => {
        const x = index * step;
        // Map value (0-100) to canvas height (inverted coordinates)
        const y = canvas.height - (val / 100) * (canvas.height - 10) - 5;
        ctx.lineTo(x, y);
      });

      ctx.lineTo(canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw active disk stroke line
      ctx.beginPath();
      dataPoints.current.forEach((val, index) => {
        const x = index * step;
        const y = canvas.height - (val / 100) * (canvas.height - 10) - 5;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.stroke();

      animationFrameId.current = requestAnimationFrame(drawGraph);
    };

    drawGraph();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [theme]);

  // Operations
  const handleCreatePartition = () => {
    if (!selectedPartition || selectedPartition.type !== 'unallocated') return;
    
    const [diskId, index] = selectedPartition.path;
    const newDisks = [...disks];
    const disk = newDisks[diskId];
    const unallocated = disk.partitions[index];

    if (newVolumeSize <= 0 || newVolumeSize > unallocated.size) {
      alert("Invalid volume size.");
      return;
    }

    const createdPartition = {
      id: `p${diskId}-${Date.now()}`,
      label: newVolumeLabel || 'New Volume',
      letter: newVolumeLetter,
      size: parseFloat(newVolumeSize),
      fs: newVolumeFs,
      status: 'Healthy (Primary Partition)',
      type: 'primary'
    };

    // If there is leftover unallocated space, update its size
    const remainingSize = unallocated.size - newVolumeSize;
    if (remainingSize > 0.01) {
      unallocated.size = parseFloat(remainingSize.toFixed(2));
      disk.partitions.splice(index, 0, createdPartition);
    } else {
      disk.partitions[index] = createdPartition;
    }

    setDisks(newDisks);
    setSelectedPartition(null);
    setShowCreateModal(false);
  };

  const handleFormatPartition = () => {
    if (!selectedPartition || selectedPartition.type === 'unallocated') return;

    const [diskId, index] = selectedPartition.path;
    const newDisks = [...disks];
    const partition = newDisks[diskId].partitions[index];

    partition.label = formatLabel || 'Formatted Volume';
    partition.fs = formatFs;
    partition.status = 'Healthy (Primary Partition - Cleaned)';

    setDisks(newDisks);
    setSelectedPartition(null);
    setShowFormatModal(false);
  };

  const handleDeletePartition = () => {
    if (!selectedPartition || selectedPartition.type === 'unallocated') return;

    const [diskId, index] = selectedPartition.path;
    const newDisks = [...disks];
    const disk = newDisks[diskId];
    const partition = disk.partitions[index];

    if (partition.label === 'System Reserved' || partition.letter === 'C') {
      alert("Error: Protective system partitions cannot be deleted.");
      return;
    }

    // Convert to unallocated
    const deletedSize = partition.size;
    disk.partitions[index] = {
      id: `p${diskId}-unallocated-${Date.now()}`,
      label: 'Unallocated',
      letter: '',
      size: deletedSize,
      fs: '',
      status: 'Unallocated',
      type: 'unallocated'
    };

    // Merge adjacent unallocated spaces for perfect optimization
    const mergedPartitions = [];
    disk.partitions.forEach(p => {
      const prev = mergedPartitions[mergedPartitions.length - 1];
      if (prev && prev.type === 'unallocated' && p.type === 'unallocated') {
        prev.size = parseFloat((prev.size + p.size).toFixed(2));
      } else {
        mergedPartitions.push(p);
      }
    });
    disk.partitions = mergedPartitions;

    setDisks(newDisks);
    setSelectedPartition(null);
  };

  const handleShrinkPartition = () => {
    if (!selectedPartition || selectedPartition.type === 'unallocated') return;

    const [diskId, index] = selectedPartition.path;
    const newDisks = [...disks];
    const disk = newDisks[diskId];
    const partition = disk.partitions[index];

    if (shrinkAmount <= 0 || shrinkAmount >= partition.size - 1) {
      alert("Invalid shrink amount. Volume must retain at least 1 GB.");
      return;
    }

    partition.size = parseFloat((partition.size - shrinkAmount).toFixed(2));

    // Add unallocated space to the right
    const nextPartition = disk.partitions[index + 1];
    if (nextPartition && nextPartition.type === 'unallocated') {
      nextPartition.size = parseFloat((nextPartition.size + shrinkAmount).toFixed(2));
    } else {
      disk.partitions.splice(index + 1, 0, {
        id: `p${diskId}-unallocated-${Date.now()}`,
        label: 'Unallocated',
        letter: '',
        size: parseFloat(shrinkAmount),
        fs: '',
        status: 'Unallocated',
        type: 'unallocated'
      });
    }

    setDisks(newDisks);
    setSelectedPartition(null);
    setShowShrinkModal(false);
  };

  const handleExtendPartition = () => {
    if (!selectedPartition || selectedPartition.type === 'unallocated') return;

    const [diskId, index] = selectedPartition.path;
    const newDisks = [...disks];
    const disk = newDisks[diskId];
    const partition = disk.partitions[index];
    const nextPartition = disk.partitions[index + 1];

    if (!nextPartition || nextPartition.type !== 'unallocated') {
      alert("Error: You can only extend a volume if there is unallocated space directly to its right.");
      return;
    }

    if (extendAmount <= 0 || extendAmount > nextPartition.size) {
      alert("Invalid extend size.");
      return;
    }

    partition.size = parseFloat((partition.size + extendAmount).toFixed(2));

    if (nextPartition.size === extendAmount) {
      // Remove it completely
      disk.partitions.splice(index + 1, 1);
    } else {
      nextPartition.size = parseFloat((nextPartition.size - extendAmount).toFixed(2));
    }

    setDisks(newDisks);
    setSelectedPartition(null);
    setShowExtendModal(false);
  };

  // Compile active flat volume rows for the top table
  const volumeRows = useMemo(() => {
    const list = [];
    disks.forEach(d => {
      d.partitions.forEach(p => {
        if (p.type !== 'unallocated') {
          list.push({
            letter: p.letter || '(No Letter)',
            label: p.label || 'System',
            type: 'Simple',
            fileSystem: p.fs || 'NTFS',
            status: p.status,
            capacity: `${p.size.toFixed(2)} GB`,
            freeSpace: `${(p.size * 0.65).toFixed(2)} GB`, // mock 65% free space
            freePct: '65%',
            diskName: d.name
          });
        }
      });
    });
    return list;
  }, [disks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: theme === 'dark' ? '#f3f4f6' : '#1f2937', fontFamily: 'inherit', overflow: 'hidden' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(243, 244, 246, 0.8)', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} color="#a855f7" />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>Virtual Disk Manager (DiskMgmt.msc)</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => {
              setSelectedPartition(null);
              // baseline reset load
              dataPoints.current = [];
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCw size={12} />
            <span>Refresh Disks</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflowY: 'auto', padding: '16px', gap: '16px' }}>
        
        {/* 2. Top Section: Volumes list table */}
        <div className="glass-panel" style={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', background: theme === 'dark' ? 'rgba(30,41,59,0.3)' : 'rgba(243,244,246,0.5)', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', fontWeight: 600, fontSize: '12px' }}>
            Volume List
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
                  <th style={{ padding: '8px 12px' }}>Volume</th>
                  <th style={{ padding: '8px 12px' }}>Disk</th>
                  <th style={{ padding: '8px 12px' }}>Layout</th>
                  <th style={{ padding: '8px 12px' }}>File System</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Capacity</th>
                  <th style={{ padding: '8px 12px' }}>Free Space</th>
                  <th style={{ padding: '8px 12px' }}>% Free</th>
                </tr>
              </thead>
              <tbody>
                {volumeRows.map((vol, index) => (
                  <tr key={index} style={{ borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.04)', background: selectedPartition && selectedPartition.letter === vol.letter ? 'rgba(168, 85, 247, 0.08)' : 'transparent' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{vol.label} ({vol.letter})</td>
                    <td style={{ padding: '8px 12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>{vol.diskName}</td>
                    <td style={{ padding: '8px 12px' }}>{vol.type}</td>
                    <td style={{ padding: '8px 12px' }}>{vol.fileSystem}</td>
                    <td style={{ padding: '8px 12px', color: '#10b981' }}>{vol.status}</td>
                    <td style={{ padding: '8px 12px' }}>{vol.capacity}</td>
                    <td style={{ padding: '8px 12px' }}>{vol.freeSpace}</td>
                    <td style={{ padding: '8px 12px' }}>{vol.freePct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Middle Section: Disk partition graphical viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {disks.map((disk, diskIdx) => (
            <div key={disk.id} className="glass-panel" style={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', display: 'flex', height: '90px', overflow: 'hidden' }}>
              
              {/* Disk Label Block */}
              <div style={{ width: '130px', padding: '12px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(243,244,246,0.6)', borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                <span style={{ fontWeight: 600, fontSize: '11px' }}>{disk.name}</span>
                <span style={{ fontSize: '10px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>{disk.type} - {disk.capacity}.00 GB</span>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 500 }}>{disk.status}</span>
              </div>

              {/* Partition Blocks Grid */}
              <div style={{ flex: 1, display: 'flex', background: theme === 'dark' ? 'rgba(15,23,42,0.2)' : '#fff' }}>
                {disk.partitions.map((part, partIdx) => {
                  const percentWidth = (part.size / disk.capacity) * 100;
                  const isSelected = selectedPartition && selectedPartition.id === part.id;
                  
                  return (
                    <div
                      key={part.id}
                      onClick={() => setSelectedPartition({ ...part, path: [diskIdx, partIdx] })}
                      style={{
                        width: `${percentWidth}%`,
                        minWidth: '50px',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '6px',
                        textAlign: 'center',
                        position: 'relative',
                        borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                        transition: 'all 0.2s',
                        background: part.type === 'unallocated'
                          ? (theme === 'dark' 
                              ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35) 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 12px)' 
                              : 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 12px)')
                          : isSelected 
                            ? 'rgba(168, 85, 247, 0.16)' 
                            : 'transparent',
                        boxShadow: isSelected ? 'inset 0 0 0 2px #a855f7' : 'none'
                      }}
                    >
                      {part.type !== 'unallocated' ? (
                        <>
                          <span style={{ fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                            {part.label} {part.letter ? `(${part.letter}:)` : ''}
                          </span>
                          <span style={{ fontSize: '10px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
                            {part.size >= 1 ? `${part.size.toFixed(1)} GB` : `${(part.size * 1024).toFixed(0)} MB`} {part.fs}
                          </span>
                          <span style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                            {part.status.split(' ')[0]}
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontWeight: 600, fontSize: '11px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Unallocated</span>
                          <span style={{ fontSize: '10px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginTop: '1px' }}>{part.size.toFixed(1)} GB</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* 4. Action Panel & Dynamic Performance Graph */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Action Operations Controller */}
          <div className="glass-panel" style={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#a855f7" />
              <span>Volume Actions</span>
            </div>
            
            {selectedPartition ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* Partition selected summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderRadius: '4px', fontSize: '11px' }}>
                  <HardDrive size={14} color="#a855f7" />
                  <div>
                    <span style={{ fontWeight: 600 }}>Selected: </span> 
                    <span>{selectedPartition.label} {selectedPartition.letter ? `(${selectedPartition.letter}:)` : ''} - {selectedPartition.size} GB</span>
                  </div>
                </div>

                {/* Operations Buttons Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selectedPartition.type === 'unallocated' ? (
                    <button 
                      onClick={() => {
                        setNewVolumeSize(selectedPartition.size);
                        setNewVolumeLabel('New Volume');
                        setShowCreateModal(true);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#a855f7', border: 'none', borderRadius: '4px', color: '#fff', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      <Plus size={12} />
                      <span>Create Partition</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setFormatLabel(selectedPartition.label);
                          setShowFormatModal(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        <RefreshCw size={12} />
                        <span>Format...</span>
                      </button>
                      <button 
                        onClick={() => {
                          // only extendable if unallocated is to the right
                          const [diskId, index] = selectedPartition.path;
                          const nextPart = disks[diskId].partitions[index + 1];
                          if (nextPart && nextPart.type === 'unallocated') {
                            setExtendAmount(nextPart.size);
                            setShowExtendModal(true);
                          } else {
                            alert("No unallocated space directly to the right of this partition.");
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        <span>Extend Volume...</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShrinkAmount(Math.floor(selectedPartition.size / 3));
                          setShowShrinkModal(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        <span>Shrink Volume...</span>
                      </button>
                      <button 
                        onClick={handleDeletePartition}
                        disabled={selectedPartition.label === 'System Reserved' || selectedPartition.letter === 'C'}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#ef4444', padding: '6px 12px', fontSize: '11px', cursor: (selectedPartition.label === 'System Reserved' || selectedPartition.letter === 'C') ? 'not-allowed' : 'pointer', opacity: (selectedPartition.label === 'System Reserved' || selectedPartition.letter === 'C') ? 0.4 : 1 }}
                      >
                        <Trash2 size={12} />
                        <span>Delete Volume</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '16px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '11px', gap: '6px', minHeight: '100px' }}>
                <AlertCircle size={20} style={{ opacity: 0.6 }} />
                <span>Select a disk partition block above to see operations.</span>
              </div>
            )}
          </div>

          {/* Graphics-Optimized Performance Graph */}
          <div className="glass-panel" style={{ borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} color="#a855f7" />
                <span>Disk 0 Activity Graph</span>
              </div>
              <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 600 }}>Active Time</span>
            </div>
            
            <div style={{ flex: 1, position: 'relative', height: '110px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderRadius: '4px', overflow: 'hidden', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)' }}>
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={110} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* ==========================================
          MODALS & OPERATIONS DIALOGS (Highly optimized, portal-free overlay structure)
          ========================================== */}
      
      {/* 1. CREATE PARTITION DIALOG */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '320px', borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', background: theme === 'dark' ? '#1e293b' : '#fff', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>New Simple Volume Wizard</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>Drive Letter:</span>
                <select 
                  value={newVolumeLetter} 
                  onChange={(e) => setNewVolumeLetter(e.target.value)}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                >
                  {availableLetters.map(l => <option key={l} value={l}>{l}:</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>Volume Label:</span>
                <input 
                  type="text" 
                  value={newVolumeLabel} 
                  onChange={(e) => setNewVolumeLabel(e.target.value)}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>Size (GB) (Max {selectedPartition.size} GB):</span>
                <input 
                  type="number" 
                  value={newVolumeSize} 
                  onChange={(e) => setNewVolumeSize(Math.min(selectedPartition.size, Math.max(1, parseFloat(e.target.value) || 0)))}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>File System:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" checked={newVolumeFs === 'NTFS'} onChange={() => setNewVolumeFs('NTFS')} /> NTFS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" checked={newVolumeFs === 'FAT32'} onChange={() => setNewVolumeFs('FAT32')} /> FAT32
                  </label>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: 'inherit', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreatePartition} style={{ background: '#a855f7', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}>Finish</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORMAT PARTITION DIALOG */}
      {showFormatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '300px', borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', background: theme === 'dark' ? '#1e293b' : '#fff', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Format Volume</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>Volume Label:</span>
                <input 
                  type="text" 
                  value={formatLabel} 
                  onChange={(e) => setFormatLabel(e.target.value)}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>File System:</span>
                <select 
                  value={formatFs} 
                  onChange={(e) => setFormatFs(e.target.value)}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                >
                  <option value="NTFS">NTFS</option>
                  <option value="FAT32">FAT32</option>
                </select>
              </div>

              <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', lineHeight: '1.4' }}>
                ⚠️ Warning: Formatting this volume will erase all virtual data. Do you wish to continue?
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => setShowFormatModal(false)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: 'inherit', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleFormatPartition} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}>Format</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHRINK VOLUME DIALOG */}
      {showShrinkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '300px', borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', background: theme === 'dark' ? '#1e293b' : '#fff', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Shrink Volume</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <span>Total size before shrink: <b>{selectedPartition.size} GB</b></span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                <span>Enter amount of space to shrink (GB):</span>
                <input 
                  type="number" 
                  value={shrinkAmount} 
                  onChange={(e) => setShrinkAmount(Math.min(selectedPartition.size - 1, Math.max(1, parseFloat(e.target.value) || 0)))}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                />
              </div>
              <span>Total size after shrink: <b>{(selectedPartition.size - shrinkAmount).toFixed(1)} GB</b></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => setShowShrinkModal(false)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: 'inherit', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleShrinkPartition} style={{ background: '#a855f7', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}>Shrink</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXTEND VOLUME DIALOG */}
      {showExtendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '300px', borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)', background: theme === 'dark' ? '#1e293b' : '#fff', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Extend Volume Wizard</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <span>Current size: <b>{selectedPartition.size} GB</b></span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                <span>Select amount to extend (GB) (Max {disks[selectedPartition.path[0]].partitions[selectedPartition.path[1] + 1]?.size} GB):</span>
                <input 
                  type="number" 
                  value={extendAmount} 
                  onChange={(e) => {
                    const maxExtend = disks[selectedPartition.path[0]].partitions[selectedPartition.path[1] + 1]?.size || 0;
                    setExtendAmount(Math.min(maxExtend, Math.max(1, parseFloat(e.target.value) || 0)));
                  }}
                  style={{ padding: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', color: 'inherit' }}
                />
              </div>
              
              <span>Total size after extend: <b>{(selectedPartition.size + extendAmount).toFixed(1)} GB</b></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => setShowExtendModal(false)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: 'inherit', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleExtendPartition} style={{ background: '#a855f7', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}>Extend</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiskManagement;
