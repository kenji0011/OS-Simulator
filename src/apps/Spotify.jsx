import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Heart, Search, Music, Home, Library, Compass, Clock, 
  Shuffle, Repeat, ListMusic, PlusCircle, Check
} from 'lucide-react';
import { useOS } from '../context/OSContext';

const PLAYLISTS = [
  {
    id: 'coding',
    name: 'Late Night Coding',
    description: 'Deep focus beats and synthetic soundscapes for keyboard warriors.',
    cover: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    tracks: [
      { id: 'c1', title: 'Compile Time Errors', artist: 'The Synthesizers', album: 'Null Pointer', duration: '6:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverColor: 'linear-gradient(135deg, #6366f1, #3b82f6)' },
      { id: 'c2', title: 'Binary Search Beat', artist: 'Algorithm', album: 'Big O', duration: '7:05', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
      { id: 'c3', title: 'Merge Sort Melody', artist: 'Sorting Hat', album: 'Stack Overflow', duration: '5:44', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverColor: 'linear-gradient(135deg, #10b981, #059669)' },
      { id: 'c4', title: 'Garbage Collection', artist: 'JVM Vibe', album: 'Memory Leak', duration: '5:02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverColor: 'linear-gradient(135deg, #f59e0b, #d97706)' }
    ]
  },
  {
    id: 'lofi',
    name: 'Lofi Chill Vibes',
    description: 'Relaxing ambient melodies for coding, studying, or winding down.',
    cover: 'linear-gradient(135deg, #701a75 0%, #4c1d95 100%)',
    tracks: [
      { id: 'l1', title: 'Sipping Tea in Rain', artist: 'Nostalgia', album: 'Coffee Shop Beats', duration: '5:44', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverColor: 'linear-gradient(135deg, #a855f7, #ec4899)' },
      { id: 'l2', title: 'Midnight Coffee', artist: 'Sleepless', album: 'Cafe Stories', duration: '6:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverColor: 'linear-gradient(135deg, #f43f5e, #fda4af)' },
      { id: 'l3', title: 'Cozy Fireplace', artist: 'Hearth', album: 'Cabin in Woods', duration: '5:02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverColor: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }
    ]
  },
  {
    id: 'synthwave',
    name: 'Synthwave Essentials',
    description: 'High energy 80s synthetic vibes to power your workflow.',
    cover: 'linear-gradient(135deg, #9d174d 0%, #1e1b4b 100%)',
    tracks: [
      { id: 's1', title: 'Cyberpunk Skyline', artist: 'Retrowave', album: 'Neon City', duration: '7:05', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverColor: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
      { id: 's2', title: 'Grid Runner', artist: 'Tron Legacy', album: 'Grid', duration: '5:02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverColor: 'linear-gradient(135deg, #8b5cf6, #d8b4fe)' },
      { id: 's3', title: 'Analog Dreamer', artist: 'Moog Master', album: 'Oscillators', duration: '6:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverColor: 'linear-gradient(135deg, #f43f5e, #10b981)' }
    ]
  }
];

const Spotify = () => {
  const { theme } = useOS();
  const [activeTab, setActiveTab] = useState('home');
  const [currentPlaylist, setCurrentPlaylist] = useState(PLAYLISTS[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [likedTracks, setLikedTracks] = useState(new Set(['c2', 'l1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef(new Audio());
  const progressBarRef = useRef(null);

  const currentTrack = currentPlaylist.tracks[currentTrackIndex] || currentPlaylist.tracks[0];

  // Sync Audio source
  useEffect(() => {
    if (currentTrack) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  // Audio Play/Pause trigger
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Volume & Mute control
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Track state listeners
  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, isShuffle, isRepeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current.pause();
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * currentPlaylist.tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % currentPlaylist.tracks.length);
    }
  };

  const handlePrev = () => {
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + currentPlaylist.tracks.length) % currentPlaylist.tracks.length);
    }
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleLike = (trackId) => {
    const updated = new Set(likedTracks);
    if (updated.has(trackId)) updated.delete(trackId);
    else updated.add(trackId);
    setLikedTracks(updated);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter songs for search
  const allTracks = PLAYLISTS.flatMap(p => p.tracks.map(t => ({ ...t, playlist: p })));
  const searchedTracks = searchQuery.trim() === '' 
    ? [] 
    : allTracks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#121212',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      {/* ===== Top Main Workspace ===== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* ----- Sidebar ----- */}
        <div style={{
          width: '230px',
          background: '#000000',
          padding: '20px 8px 10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flexShrink: 0,
          borderRight: '1px solid #282828'
        }}>
          {/* Spotify Branding Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            marginBottom: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1DB954',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.076-.336.135-.668.47-.743 3.856-.88 7.15-.51 9.817 1.127.295.18.387.563.207.858zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.073-1.185-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.666-1.112 8.248-.57 11.338 1.33.367.227.487.708.26 1.075zm.105-2.81c-.273.447-.857.593-1.304.32-3.18-1.89-8.42-2.107-11.437-1.193-.504.153-1.035-.137-1.188-.64-.153-.505.137-1.035.64-1.188 3.593-1.09 9.382-.84 13.01 1.314.446.265.592.85.32 1.304z" />
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>SpotiFly</span>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              onClick={() => setActiveTab('home')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                width: '100%', padding: '10px 16px', border: 'none', borderRadius: '4px',
                background: activeTab === 'home' ? '#282828' : 'transparent',
                color: activeTab === 'home' ? '#fff' : '#b3b3b3',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                transition: 'color 0.2s'
              }}
            >
              <Home size={20} />
              Home
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                width: '100%', padding: '10px 16px', border: 'none', borderRadius: '4px',
                background: activeTab === 'search' ? '#282828' : 'transparent',
                color: activeTab === 'search' ? '#fff' : '#b3b3b3',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                transition: 'color 0.2s'
              }}
            >
              <Search size={20} />
              Search
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                width: '100%', padding: '10px 16px', border: 'none', borderRadius: '4px',
                background: activeTab === 'library' ? '#282828' : 'transparent',
                color: activeTab === 'library' ? '#fff' : '#b3b3b3',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                transition: 'color 0.2s'
              }}
            >
              <Library size={20} />
              Your Library
            </button>
          </div>

          {/* Playlists Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <span style={{ 
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', 
              color: '#b3b3b3', letterSpacing: '1px', paddingLeft: '12px' 
            }}>Playlists</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
              {PLAYLISTS.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    setCurrentPlaylist(pl);
                    setCurrentTrackIndex(0);
                    setActiveTab('home');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', width: '100%', border: 'none', background: 'transparent',
                    color: currentPlaylist.id === pl.id && activeTab === 'home' ? '#1DB954' : '#b3b3b3',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}
                >
                  <ListMusic size={16} />
                  {pl.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ----- Main Display Panel ----- */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom, #1e1e1e 0%, #121212 40%, #121212 100%)',
          overflowY: 'auto',
          padding: '24px'
        }}>
          
          {/* TAB 1: HOME & PLAYLISTS */}
          {activeTab === 'home' && (
            <div>
              {/* Header Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '24px',
                padding: '20px 0 30px 0',
                background: 'transparent'
              }}>
                <div style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '8px',
                  background: currentPlaylist.cover,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Music size={60} color="rgba(255,255,255,0.3)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Playlist</span>
                  <h1 style={{ fontSize: '48px', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>{currentPlaylist.name}</h1>
                  <p style={{ fontSize: '13px', color: '#b3b3b3', margin: 0 }}>{currentPlaylist.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#b3b3b3', marginTop: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>SpotiFly Sim</span>
                    <span>•</span>
                    <span>{currentPlaylist.tracks.length} songs</span>
                  </div>
                </div>
              </div>

              {/* Control Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <button
                  onClick={handlePlayPause}
                  style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: '#1DB954', border: 'none', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s, background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPlaying ? (
                    <Pause size={24} fill="#fff" color="#fff" />
                  ) : (
                    <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: '4px' }} />
                  )}
                </button>
              </div>

              {/* Tracks Grid Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 4fr 3fr 1fr',
                padding: '8px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                color: '#b3b3b3',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px'
              }}>
                <span>#</span>
                <span>Title</span>
                <span>Album</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Clock size={16} /></div>
              </div>

              {/* Tracks List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {currentPlaylist.tracks.map((track, index) => {
                  const isCurrent = currentPlaylist.id === currentPlaylist.id && currentTrackIndex === index;
                  return (
                    <div
                      key={track.id}
                      onDoubleClick={() => {
                        setCurrentTrackIndex(index);
                        setIsPlaying(true);
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 4fr 3fr 1fr',
                        padding: '10px 16px',
                        alignItems: 'center',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: isCurrent ? 'rgba(255,255,255,0.06)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isCurrent ? 'rgba(255,255,255,0.06)' : 'transparent'}
                    >
                      <span style={{ color: isCurrent ? '#1DB954' : '#b3b3b3', fontWeight: 600 }}>{index + 1}</span>
                      
                      {/* Title & Artist */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '4px',
                          background: track.coverColor, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justify: 'center'
                        }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{
                            color: isCurrent ? '#1DB954' : '#fff',
                            fontWeight: 600,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>{track.title}</span>
                          <span style={{ color: '#b3b3b3', fontSize: '12px' }}>{track.artist}</span>
                        </div>
                      </div>

                      {/* Album */}
                      <span style={{ color: '#b3b3b3' }}>{track.album}</span>

                      {/* Heart & Duration */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          style={{ background: 'none', border: 'none', color: likedTracks.has(track.id) ? '#1DB954' : '#b3b3b3', cursor: 'pointer' }}
                        >
                          <Heart size={16} fill={likedTracks.has(track.id) ? '#1DB954' : 'none'} />
                        </button>
                        <span style={{ color: '#b3b3b3' }}>{track.duration}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SEARCH */}
          {activeTab === 'search' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Search</h2>
              
              {/* Search input box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#242424',
                borderRadius: '30px',
                padding: '10px 20px',
                gap: '12px',
                width: '100%',
                maxWidth: '400px',
                marginBottom: '30px',
                border: '1px solid transparent'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <Search size={20} color="#b3b3b3" />
                <input 
                  type="text"
                  placeholder="Artists, songs, or albums"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>

              {searchQuery.trim() === '' ? (
                <div>
                  <h3 style={{ fontSize: '16px', color: '#b3b3b3', marginBottom: '16px' }}>Browse All</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                    {PLAYLISTS.map((pl, idx) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setCurrentPlaylist(pl);
                          setCurrentTrackIndex(0);
                          setActiveTab('home');
                        }}
                        style={{
                          height: '140px', borderRadius: '8px', padding: '16px',
                          background: pl.cover, cursor: 'pointer', position: 'relative',
                          overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <span style={{ fontSize: '16px', fontWeight: 800, wordWrap: 'break-word', display: 'block' }}>{pl.name}</span>
                        <div style={{
                          position: 'absolute', bottom: '-10px', right: '-10px',
                          width: '70px', height: '70px', background: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px', transform: 'rotate(25deg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Music size={30} color="rgba(255,255,255,0.2)" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '16px', color: '#b3b3b3', marginBottom: '16px' }}>Search Results</h3>
                  {searchedTracks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {searchedTracks.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => {
                            setCurrentPlaylist(track.playlist);
                            const idx = track.playlist.tracks.findIndex(t => t.id === track.id);
                            setCurrentTrackIndex(idx !== -1 ? idx : 0);
                            setIsPlaying(true);
                            setActiveTab('home');
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            padding: '10px 16px', borderRadius: '6px', cursor: 'pointer',
                            background: 'rgba(255,255,255,0.03)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: track.coverColor }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600 }}>{track.title}</span>
                            <span style={{ fontSize: '12px', color: '#b3b3b3' }}>{track.artist} • {track.playlist.name}</span>
                          </div>
                          <span style={{ color: '#b3b3b3', fontSize: '13px' }}>{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#b3b3b3', fontSize: '14px', padding: '20px 0' }}>No matches found for "{searchQuery}".</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: YOUR LIBRARY */}
          {activeTab === 'library' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Your Library</h2>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Liked Songs Box */}
                <div 
                  onClick={() => {
                    const likedPlaylist = {
                      id: 'liked',
                      name: 'Liked Songs',
                      description: 'Your favorite tracks in one convenient playlist.',
                      cover: 'linear-gradient(135deg, #450a0a 0%, #1e1b4b 100%)',
                      tracks: PLAYLISTS.flatMap(p => p.tracks).filter(t => likedTracks.has(t.id))
                    };
                    if (likedPlaylist.tracks.length > 0) {
                      setCurrentPlaylist(likedPlaylist);
                      setCurrentTrackIndex(0);
                      setActiveTab('home');
                    }
                  }}
                  style={{
                    width: '320px', height: '180px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #450a0a 0%, #1e1b4b 100%)',
                    padding: '20px', cursor: 'pointer', display: 'flex',
                    flexDirection: 'column', justifyContent: 'flex-end',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Heart size={40} fill="#fff" style={{ marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Liked Songs</h3>
                  <span style={{ fontSize: '13px', color: '#b3b3b3', marginTop: '6px' }}>{likedTracks.size} liked songs</span>
                </div>

                {/* Playlist list cards */}
                {PLAYLISTS.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      setCurrentPlaylist(pl);
                      setCurrentTrackIndex(0);
                      setActiveTab('home');
                    }}
                    style={{
                      width: '180px', padding: '16px', borderRadius: '8px',
                      background: '#181818', border: '1px solid #282828',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ width: '100%', height: '148px', borderRadius: '6px', background: pl.cover }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                      <span style={{ fontSize: '12px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ===== Bottom Playback Bar ===== */}
      <div style={{
        height: '90px',
        background: '#181818',
        borderTop: '1px solid #282828',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        
        {/* Left: Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%', overflow: 'hidden' }}>
          {currentTrack && (
            <>
              <div style={{
                width: '56px', height: '56px', borderRadius: '4px',
                background: currentTrack.coverColor, flexShrink: 0
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                <span style={{
                  fontSize: '13px', fontWeight: 600, color: '#fff',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{currentTrack.title}</span>
                <span style={{
                  fontSize: '11px', color: '#b3b3b3',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{currentTrack.artist}</span>
              </div>
              <button 
                onClick={() => toggleLike(currentTrack.id)}
                style={{ background: 'none', border: 'none', color: likedTracks.has(currentTrack.id) ? '#1DB954' : '#b3b3b3', cursor: 'pointer', flexShrink: 0 }}
              >
                <Heart size={16} fill={likedTracks.has(currentTrack.id) ? '#1DB954' : 'none'} />
              </button>
            </>
          )}
        </div>

        {/* Center: Controls & Seek */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '8px', width: '40%'
        }}>
          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              style={{ background: 'none', border: 'none', color: isShuffle ? '#1DB954' : '#b3b3b3', cursor: 'pointer' }}
            >
              <Shuffle size={16} />
            </button>
            <button 
              onClick={handlePrev}
              style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
            >
              <SkipBack size={18} fill="#b3b3b3" />
            </button>
            <button
              onClick={handlePlayPause}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#fff', border: 'none', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: '#000'
              }}
            >
              {isPlaying ? (
                <Pause size={16} fill="#000" color="#000" />
              ) : (
                <Play size={16} fill="#000" color="#000" style={{ marginLeft: '2px' }} />
              )}
            </button>
            <button 
              onClick={handleNext}
              style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
            >
              <SkipForward size={18} fill="#b3b3b3" />
            </button>
            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              style={{ background: 'none', border: 'none', color: isRepeat ? '#1DB954' : '#b3b3b3', cursor: 'pointer' }}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Seek Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', fontSize: '11px', color: '#a7a7a7' }}>
            <span>{formatTime(currentTime)}</span>
            <div 
              ref={progressBarRef}
              onClick={handleSeek}
              style={{
                flex: 1, height: '4px', background: '#4f4f4f', borderRadius: '2px',
                cursor: 'pointer', position: 'relative'
              }}
            >
              <div style={{
                width: `${(currentTime / (duration || 1)) * 100}%`,
                height: '100%', background: '#b3b3b3', borderRadius: '2px',
                transition: 'width 0.1s linear'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.background = '#1DB954'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#b3b3b3'}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Extras */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '12px', width: '30%'
        }}>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (val > 0) setIsMuted(false);
            }}
            style={{
              width: '90px',
              height: '4px',
              background: '#4f4f4f',
              borderRadius: '2px',
              cursor: 'pointer',
              accentColor: '#1DB954'
            }}
          />
        </div>

      </div>

    </div>
  );
};

export default Spotify;
