import React, { useEffect, useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Folder, FolderOpen, FolderTree, FileText, File as FileIcon, Image as ImageIcon, 
  LayoutGrid, List as ListIcon, ChevronRight, ArrowLeft, ArrowRight, ArrowUp, 
  Search, Plus, FolderPlus, Trash2, Edit2, Copy, ClipboardPaste, Settings 
} from 'lucide-react';

// Utility component for File Icons based on extension/type
const getFileIcon = (name, type) => {
  if (type === 'folder') return <Folder size={32} color="#eab308" fill="#fef08a" style={{ marginBottom: '8px' }} />;
  if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon size={32} color="#10b981" style={{ marginBottom: '8px' }} />;
  if (name.endsWith('.txt')) return <FileText size={32} color="#3b82f6" style={{ marginBottom: '8px' }} />;
  if (name.endsWith('.exe')) return <Settings size={32} color="#64748b" style={{ marginBottom: '8px' }} />;
  return <FileIcon size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />;
};

const getSmallFileIcon = (name, type) => {
  if (type === 'folder') return <Folder size={18} color="#eab308" fill="#fef08a" />;
  if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon size={18} color="#10b981" />;
  if (name.endsWith('.txt')) return <FileText size={18} color="#3b82f6" />;
  if (name.endsWith('.exe')) return <Settings size={18} color="#64748b" />;
  return <FileIcon size={18} color="#94a3b8" />;
};

const FileManager = () => {
  const { 
    fileSystem, getFolder, createFile, createFolder, deleteItem, 
    renameItem, copyItem, pasteItem, clipboard,
    setNotepadFile, dispatchSystemAction,
    fileManagerTargetFolderId, setFileManagerTargetFolderId
  } = useOS();

  const [history, setHistory] = useState(['root']); // stack of folder IDs
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const currentFolderId = history[historyIndex];
  const currentFolder = getFolder(currentFolderId) || fileSystem;
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!fileManagerTargetFolderId) return;

    const targetFolder = getFolder(fileManagerTargetFolderId);
    if (targetFolder) {
      setHistory([fileManagerTargetFolderId]);
      setHistoryIndex(0);
      setSelectedIds(new Set());
      setSearchQuery('');
    }

    setFileManagerTargetFolderId(null);
  }, [fileManagerTargetFolderId, getFolder, setFileManagerTargetFolderId]);
  
  // Navigation
  const navigateTo = (folderId) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSelectedIds(new Set());
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSelectedIds(new Set());
    }
  };

  const goUp = () => {
    // Determine path from root
    const buildPath = (node, targetId, currentPath) => {
      if (node.id === targetId) return [...currentPath, node];
      if (node.children) {
        for (const child of node.children) {
          const res = buildPath(child, targetId, [...currentPath, node]);
          if (res) return res;
        }
      }
      return null;
    };
    
    const fullPath = buildPath(fileSystem, currentFolderId, []) || [fileSystem];
    if (fullPath.length > 1) {
      const parent = fullPath[fullPath.length - 2];
      navigateTo(parent.id);
    }
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else if (item.type === 'file') {
      setNotepadFile(item.id);
      dispatchSystemAction({ action: 'OPEN_APP', appId: 'notepad' });
    }
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      const next = new Set(selectedIds);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      setSelectedIds(next);
    } else {
      setSelectedIds(new Set([item.id]));
    }
    setContextMenu(null);
  };
  
  // Right click logic
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (item && !selectedIds.has(item.id)) {
      setSelectedIds(new Set([item.id]));
    }
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: item ? item.id : null });
  };
  
  const handleBgContextMenu = (e) => {
    e.preventDefault();
    setSelectedIds(new Set());
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: null });
  };

  const handleBgClick = () => {
    setSelectedIds(new Set());
    closeContextMenu();
  };

  const closeContextMenu = () => setContextMenu(null);
  
  const startRename = (id) => {
    const item = currentFolder.children.find(c => c.id === id);
    if (item) {
      setRenamingId(id);
      setEditName(item.name);
    }
  };

  const commitRename = (id, oldName) => {
    if (editName.trim() && editName !== oldName) {
      renameItem(id, editName.trim());
    }
    setRenamingId(null);
  };
  
  // Render Data
  const displayedItems = (currentFolder.children || []).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Breadcrumbs
  const buildPath = (node, targetId, currentPath) => {
    if (node.id === targetId) return [...currentPath, node];
    if (node.children) {
      for (const child of node.children) {
        const res = buildPath(child, targetId, [...currentPath, node]);
        if (res) return res;
      }
    }
    return null;
  };
  const breadcrumbs = buildPath(fileSystem, currentFolderId, []) || [fileSystem];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f4f6', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }} onClick={closeContextMenu}>
      
      {/* Top Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={goBack} disabled={historyIndex === 0} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: historyIndex === 0 ? 'default' : 'pointer', opacity: historyIndex === 0 ? 0.3 : 1, borderRadius: '4px' }}><ArrowLeft size={18} /></button>
          <button onClick={goForward} disabled={historyIndex === history.length - 1} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: historyIndex === history.length - 1 ? 'default' : 'pointer', opacity: historyIndex === history.length - 1 ? 0.3 : 1, borderRadius: '4px' }}><ArrowRight size={18} /></button>
          <button onClick={goUp} disabled={currentFolderId === 'root'} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: currentFolderId === 'root' ? 'default' : 'pointer', opacity: currentFolderId === 'root' ? 0.3 : 1, borderRadius: '4px' }}><ArrowUp size={18} /></button>
        </div>
        
        {/* Breadcrumb Path */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '4px', border: '1px solid #d1d5db', padding: '4px 12px', gap: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <span onClick={() => navigateTo(crumb.id)} style={{ cursor: 'pointer', fontSize: '13px', padding: '2px 4px', borderRadius: '4px' }} className="breadcrumbHover">{crumb.name}</span>
              {idx < breadcrumbs.length - 1 && <ChevronRight size={14} color="#9ca3af" />}
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', right: '8px', top: '8px' }} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentFolder.name}`} 
            style={{ width: '100%', padding: '6px 28px 6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }} 
          />
        </div>
      </div>

      {/* Ribbon / Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => createFolder(currentFolderId, "New Folder")} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} className="btnHover">
              <FolderPlus size={16} color="#3b82f6" /> New Folder
            </button>
            <button onClick={() => createFile(currentFolderId, "New Text Document.txt")} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} className="btnHover">
              <Plus size={16} color="#3b82f6" /> New File
            </button>
          </div>
          
          <div style={{ width: '1px', background: '#e5e7eb' }} />
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button disabled={selectedIds.size === 0} onClick={() => { if(selectedIds.size) copyItem(Array.from(selectedIds)[0]); }} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: selectedIds.size ? 'pointer' : 'default', opacity: selectedIds.size ? 1 : 0.4 }} className="btnHover"><Copy size={16} /></button>
            <button disabled={!clipboard} onClick={() => { if(clipboard) pasteItem(currentFolderId); }} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: clipboard ? 'pointer' : 'default', opacity: clipboard ? 1 : 0.4 }} className="btnHover"><ClipboardPaste size={16} /></button>
            <button disabled={selectedIds.size === 0} onClick={() => { selectedIds.forEach(id => deleteItem(id)); setSelectedIds(new Set()); }} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: selectedIds.size ? 'pointer' : 'default', opacity: selectedIds.size ? 1 : 0.4 }} className="btnHover"><Trash2 size={16} color="#ef4444" /></button>
            <button disabled={selectedIds.size !== 1} onClick={(e) => {
                e.stopPropagation();
                startRename(Array.from(selectedIds)[0]);
            }} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: selectedIds.size === 1 ? 'pointer' : 'default', opacity: selectedIds.size === 1 ? 1 : 0.4 }} className="btnHover"><Edit2 size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
           <button onClick={() => setViewMode('grid')} style={{ padding: '4px 8px', background: viewMode === 'grid' ? '#fff' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center' }}>
             <LayoutGrid size={16} />
           </button>
           <button onClick={() => setViewMode('list')} style={{ padding: '4px 8px', background: viewMode === 'list' ? '#fff' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center' }}>
             <ListIcon size={16} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Sidebar Navigation */}
        <div style={{ width: '220px', borderRight: '1px solid #e5e7eb', background: '#f8fafc', padding: '16px 8px', overflowY: 'auto' }}>
           <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>Quick Access</div>
           {['desktop', 'downloads', 'docs', 'pictures', 'music'].map(id => {
             const f = fileSystem.children.find(c => c.id === id);
             if (!f) return null;
             return (
               <div key={id} onClick={() => navigateTo(id)} style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', cursor: 'pointer', background: currentFolderId === id ? 'rgba(59,130,246,0.1)' : 'transparent', color: currentFolderId === id ? '#2563eb' : '#334155' }} className="navHover">
                 <Folder size={18} color="#60a5fa" fill={currentFolderId === id ? "#bfdbfe" : "none"} />
                 <span style={{ fontSize: '13px' }}>{f.name}</span>
               </div>
             );
           })}
           
           <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '24px', marginBottom: '8px', paddingLeft: '8px' }}>This PC</div>
           <div onClick={() => navigateTo('root')} style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', cursor: 'pointer', background: currentFolderId === 'root' ? 'rgba(59,130,246,0.1)' : 'transparent', color: currentFolderId === 'root' ? '#2563eb' : '#334155' }} className="navHover">
                 <FolderTree size={18} color="#94a3b8" />
                 <span style={{ fontSize: '13px' }}>Local Disk (C:)</span>
           </div>
        </div>

        {/* File View */}
        <div style={{ flex: 1, background: '#ffffff', padding: '16px', overflowY: 'auto' }} onClick={handleBgClick} onContextMenu={handleBgContextMenu}>
          
          {displayedItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
               <FolderOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
               <p>This folder is empty.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignContent: 'flex-start' }}>
               {displayedItems.map(item => (
                 <div 
                   key={item.id} 
                   onClick={(e) => handleItemClick(e, item)}
                   onDoubleClick={() => handleItemDoubleClick(item)}
                   onContextMenu={(e) => handleContextMenu(e, item)}
                   style={{
                     width: '100px', height: '100px', padding: '12px 8px',
                     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                     borderRadius: '6px', cursor: 'pointer',
                     background: selectedIds.has(item.id) ? 'rgba(59,130,246,0.1)' : 'transparent',
                     border: selectedIds.has(item.id) ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                   }}
                   className="itemGridHover"
                 >
                   {getFileIcon(item.name, item.type)}
                   {renamingId === item.id ? (
                     <input 
                       autoFocus
                       value={editName}
                       onChange={e => setEditName(e.target.value)}
                       onBlur={() => commitRename(item.id, item.name)}
                       onKeyDown={e => {
                         if (e.key === 'Enter') commitRename(item.id, item.name);
                         if (e.key === 'Escape') setRenamingId(null);
                       }}
                       style={{ width: '80px', fontSize: '12px', textAlign: 'center', padding: '2px', outline: '2px solid #3b82f6', border: 'none', borderRadius: '2px' }}
                       onClick={e => e.stopPropagation()}
                       onDoubleClick={e => e.stopPropagation()}
                       onContextMenu={e => e.stopPropagation()}
                     />
                   ) : (
                     <span style={{ fontSize: '12px', textAlign: 'center', wordBreak: 'break-word', color: '#1e293b', userSelect: 'none', lineHeight: '1.2' }}>{item.name}</span>
                   )}
                 </div>
               ))}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', userSelect: 'none' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#64748b', fontSize: '12px' }}>
                   <th style={{ padding: '8px', fontWeight: 500 }}>Name</th>
                   <th style={{ padding: '8px', fontWeight: 500 }}>Type</th>
                   <th style={{ padding: '8px', fontWeight: 500 }}>Size</th>
                 </tr>
               </thead>
               <tbody>
                  {displayedItems.map(item => (
                    <tr 
                      key={item.id} 
                      onClick={(e) => handleItemClick(e, item)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                      style={{ 
                        background: selectedIds.has(item.id) ? 'rgba(59,130,246,0.1)' : 'transparent',
                        borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                        color: '#334155', fontSize: '13px'
                      }}
                      className="itemListHover"
                    >
                      <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getSmallFileIcon(item.name, item.type)}
                        {renamingId === item.id ? (
                           <input 
                             autoFocus
                             value={editName}
                             onChange={e => setEditName(e.target.value)}
                             onBlur={() => commitRename(item.id, item.name)}
                             onKeyDown={e => {
                               if (e.key === 'Enter') commitRename(item.id, item.name);
                               if (e.key === 'Escape') setRenamingId(null);
                             }}
                             style={{ flex: 1, fontSize: '13px', padding: '2px 4px', outline: '2px solid #3b82f6', border: 'none', borderRadius: '2px' }}
                             onClick={e => e.stopPropagation()}
                             onDoubleClick={e => e.stopPropagation()}
                             onContextMenu={e => e.stopPropagation()}
                           />
                        ) : (
                           <span>{item.name}</span>
                        )}
                      </td>
                      <td style={{ padding: '8px' }}>{item.type === 'folder' ? 'File folder' : 'File'}</td>
                      <td style={{ padding: '8px' }}>{item.size ? `${Math.ceil(item.size / 1024)} KB` : '--'}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ padding: '4px 16px', background: '#f8fafc', borderTop: '1px solid #e5e7eb', fontSize: '11px', color: '#64748b', display: 'flex', gap: '16px' }}>
         <span>{displayedItems.length} items</span>
         {selectedIds.size > 0 && <span>{selectedIds.size} item(s) selected</span>}
      </div>

      {/* Context Menu Popup */}
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 1000, minWidth: '180px' }}>
          {contextMenu.targetId ? (
            <>
              <div onClick={(e) => { e.stopPropagation(); copyItem(contextMenu.targetId); closeContextMenu(); }} style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Copy size={16} color="#64748b"/> Copy</div>
              <div onClick={(e) => { e.stopPropagation(); startRename(contextMenu.targetId); closeContextMenu(); }} style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Edit2 size={16} color="#64748b"/> Rename</div>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
              <div onClick={(e) => { e.stopPropagation(); deleteItem(contextMenu.targetId); closeContextMenu(); }} style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px' }}><Trash2 size={16} color="#ef4444"/> Delete</div>
            </>
          ) : (
            <>
              <div onClick={(e) => { e.stopPropagation(); createFolder(currentFolderId, "New Folder"); closeContextMenu(); }} style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><FolderPlus size={16} color="#64748b"/> New Folder</div>
              <div onClick={(e) => { e.stopPropagation(); createFile(currentFolderId, "New Document.txt"); closeContextMenu(); }} style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Plus size={16} color="#64748b"/> New File</div>
              {clipboard && (
                <>
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                  <div onClick={(e) => { e.stopPropagation(); pasteItem(currentFolderId); closeContextMenu(); }} style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><ClipboardPaste size={16} color="#64748b"/> Paste</div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Hover Styles Injection */}
      <style>{`
        .breadcrumbHover:hover { background: rgba(0,0,0,0.05); }
        .btnHover:hover:not(:disabled) { background: rgba(0,0,0,0.05); }
        .navHover:hover { background: rgba(59,130,246,0.05); }
        .itemGridHover:hover:not(:active) { background: rgba(59,130,246,0.05); border-color: rgba(59,130,246,0.1) !important; }
        .itemListHover:hover:not(:active) { background: rgba(59,130,246,0.05); }
      `}</style>
    </div>
  );
};

export default FileManager;
