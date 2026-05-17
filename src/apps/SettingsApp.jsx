import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Monitor, Palette, User, Battery, Check, Sun, Moon, 
  Layout, Shield, HelpCircle, HardDrive, Cpu, RefreshCw
} from 'lucide-react';

const WALLPAPERS = [
  { id: 'none', name: 'Default (Gradient)', thumbnail: null },
  { id: 'ocean', name: 'Deep Ocean', thumbnail: '/wallpapers/ocean.png' },
  { id: 'aurora', name: 'Aurora Borealis', thumbnail: '/wallpapers/aurora.png' },
  { id: 'sunset', name: 'Golden Sunset', thumbnail: '/wallpapers/sunset.png' },
  { id: 'forest', name: 'Misty Forest', thumbnail: '/wallpapers/forest.png' },
  { id: 'minimal', name: 'Pastel Minimal', thumbnail: '/wallpapers/minimal.png' },
];

const COLOR_SCHEMES = [
  { id: 'rose',    name: 'Rose Red',    accent: '#f43f5e', preview: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  { id: 'purple',  name: 'Royal Purple',  accent: '#a855f7', preview: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
  { id: 'blue',    name: 'Classic Blue',    accent: '#3b82f6', preview: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'teal',    name: 'Ocean Teal',    accent: '#14b8a6', preview: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
  { id: 'amber',   name: 'Sunlit Amber',   accent: '#f59e0b', preview: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'emerald', name: 'Emerald Green', accent: '#10b981', preview: 'linear-gradient(135deg, #10b981, #059669)' },
];

const ICON_SIZES = [
  { id: 'small',  name: 'Small Desktop Icons' },
  { id: 'medium', name: 'Medium Desktop Icons' },
  { id: 'large',  name: 'Large Desktop Icons' },
];

const SettingsApp = () => {
  const {
    theme, setTheme,
    colorScheme, setColorScheme,
    wallpaper, setWallpaper,
    iconSizeId, setIconSizeId
  } = useOS();

  const [activeSection, setActiveSection] = useState('personalization');

  const menuItems = [
    { id: 'system', name: 'System', icon: Monitor, color: '#3b82f6' },
    { id: 'personalization', name: 'Personalization', icon: Palette, color: '#ec4899' },
    { id: 'battery', name: 'Power & Battery', icon: Battery, color: '#10b981' },
    { id: 'account', name: 'Accounts', icon: User, color: '#8b5cf6' },
  ];

  // Helper to resolve wallpaper preview
  const getWallpaperThumb = (wp) => {
    if (wp.id === 'none') {
      return (
        <div style={{
          width: '100%', height: '80px',
          background: 'linear-gradient(135deg, #3b82f6, #ec4899)',
          borderRadius: '6px'
        }} />
      );
    }
    return (
      <img 
        src={wp.thumbnail} 
        alt={wp.name} 
        style={{
          width: '100%', height: '80px',
          objectFit: 'cover', borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      />
    );
  };

  return (
    <div style={{
      height: '100%', display: 'flex',
      background: theme === 'dark' ? '#12121f' : '#f3f4f6',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      overflow: 'hidden'
    }}>
      
      {/* ===== SIDE NAVIGATION BAR ===== */}
      <div style={{
        width: '240px',
        borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)',
        display: 'flex', flexDirection: 'column', padding: '16px 8px'
      }}>
        {/* User Card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 8px', marginBottom: '20px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#fff',
            boxShadow: '0 4px 12px rgba(168,85,247,0.3)'
          }}>
            JK
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Justine</div>
            <div style={{ fontSize: '11px', color: theme === 'dark' ? '#888' : '#64748b' }}>Local Account</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  textAlign: 'left', width: '100%',
                  background: isActive 
                    ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                    : 'transparent',
                  color: isActive ? '#fff' : (theme === 'dark' ? '#cbd5e1' : '#475569'),
                  borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                  transition: 'all 0.15s ease'
                }}
                className="settings-nav-btn"
              >
                <Icon size={16} color={isActive ? item.color : (theme === 'dark' ? '#94a3b8' : '#64748b')} />
                <span style={{ fontWeight: isActive ? 600 : 500, color: isActive ? (theme === 'dark' ? '#fff' : '#000') : 'inherit' }}>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== MAIN CONTENT PANEL ===== */}
      <div style={{
        flex: 1, padding: '24px 32px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column'
      }}>
        
        {/* PERSONALIZATION PAGE */}
        {activeSection === 'personalization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Personalization</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                Customize your background images, themes, colors, and layouts.
              </p>
            </div>

            {/* Desktop Background Image Previews */}
            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600 }}>Select a Background Wallpaper</h3>
              
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px'
              }}>
                {WALLPAPERS.map(wp => {
                  const isSelected = wallpaper === wp.id;
                  return (
                    <div 
                      key={wp.id}
                      onClick={() => setWallpaper(wp.id)}
                      style={{
                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                        gap: '6px', padding: '6px', borderRadius: '8px',
                        background: isSelected 
                          ? (theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)')
                          : 'transparent',
                        outline: isSelected ? '2px solid #3b82f6' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                      className="wallpaper-thumb-card"
                    >
                      {getWallpaperThumb(wp)}
                      <div style={{
                        fontSize: '11px', fontWeight: 500, textAlign: 'center',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: isSelected ? (theme === 'dark' ? '#fff' : '#000') : 'inherit'
                      }}>
                        {wp.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Theme Mode Toggle (Light/Dark) */}
            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Choose your Mode</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                  Select whether system panels appear in Light or Dark theme.
                </p>
              </div>

              <div style={{
                display: 'flex', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                padding: '4px', borderRadius: '8px'
              }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    background: theme === 'light' ? '#fff' : 'transparent',
                    color: theme === 'light' ? '#000' : (theme === 'dark' ? '#888' : '#64748b'),
                    boxShadow: theme === 'light' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Sun size={14} /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    background: theme === 'dark' ? '#334155' : 'transparent',
                    color: theme === 'dark' ? '#fff' : '#64748b',
                    boxShadow: theme === 'dark' ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Moon size={14} /> Dark
                </button>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>Windows Accent Color</h3>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                Select an accent color for taskbar buttons, windows headers, and action icons.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {COLOR_SCHEMES.map(cs => {
                  const isSelected = colorScheme === cs.id;
                  return (
                    <button
                      key={cs.id}
                      onClick={() => setColorScheme(cs.id)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: cs.preview, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', outline: isSelected ? '2px solid #fff' : 'none',
                        outlineOffset: isSelected ? '2px' : '0px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'transform 0.15s ease'
                      }}
                      className="accent-swatch"
                      title={cs.name}
                    >
                      {isSelected && <Check size={18} color="#fff" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Icon Size Selection */}
            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Desktop Icon Size</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                  Scale the size of files and folders located directly on your desktop.
                </p>
              </div>

              <select 
                value={iconSizeId} 
                onChange={e => setIconSizeId(e.target.value)}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : '#fff',
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
                  color: theme === 'dark' ? '#fff' : '#000',
                  fontSize: '13px', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="small">Small </option>
                <option value="medium">Medium </option>
                <option value="large">Large </option>
              </select>
            </div>
          </div>
        )}

        {/* SYSTEM PAGE */}
        {activeSection === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>System Specifications</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                Hardware stats and platform specifications.
              </p>
            </div>

            {/* Spec Cards */}
            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Monitor size={36} color="#3b82f6" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>CompShop-PC</div>
                  <div style={{ fontSize: '12px', color: theme === 'dark' ? '#888' : '#64748b' }}>Virtual Simulation Host</div>
                </div>
              </div>

              <div style={{ height: '1px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: theme === 'dark' ? '#888' : '#64748b' }}>Device name</span>
                  <span style={{ fontWeight: 600 }}>CompShop-PC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: theme === 'dark' ? '#888' : '#64748b' }}>Processor</span>
                  <span style={{ fontWeight: 600 }}>AMD Ryzen 9 7900X 12-Core Processor @ 4.70 GHz</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: theme === 'dark' ? '#888' : '#64748b' }}>Installed RAM</span>
                  <span style={{ fontWeight: 600 }}>32.0 GB (31.9 GB usable)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: theme === 'dark' ? '#888' : '#64748b' }}>System Type</span>
                  <span style={{ fontWeight: 600 }}>128-bit Web OS, x128-based Web Emulator</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: theme === 'dark' ? '#888' : '#64748b' }}>OS Edition</span>
                  <span style={{ fontWeight: 600 }}>OS-Sim Windows 11 Fluent Pro</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POWER & BATTERY PAGE */}
        {activeSection === 'battery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Power & Battery</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                Battery usage status and power plans.
              </p>
            </div>

            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '24px',
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                fontSize: '48px', fontWeight: 700, color: '#10b981',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Battery size={48} strokeWidth={2.5} /> 100%
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Fully Charged</div>
              <div style={{ fontSize: '11px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                Connected to power source. Running in High Performance Mode.
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNTS PAGE */}
        {activeSection === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Accounts Info</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme === 'dark' ? '#888' : '#64748b' }}>
                Manage local simulation user settings.
              </p>
            </div>

            <div style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '20px',
              display: 'flex', alignItems: 'center', gap: '20px'
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 700, color: '#fff',
                boxShadow: '0 4px 12px rgba(168,85,247,0.3)'
              }}>
                JK
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Justine</div>
                <div style={{ fontSize: '12px', color: theme === 'dark' ? '#888' : '#64748b' }}>admin@justine-os.local</div>
                <div style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
                  background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
                  fontSize: '10px', fontWeight: 700, marginTop: '6px'
                }}>
                  SYSTEM ADMINISTRATOR
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .settings-nav-btn:hover {
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} !important;
        }
        .wallpaper-thumb-card:hover {
          transform: scale(1.02);
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
        }
        .accent-swatch:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default SettingsApp;
