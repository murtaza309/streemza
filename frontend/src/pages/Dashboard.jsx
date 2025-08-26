import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [activeGenre, setActiveGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const location = useLocation();
  const navigate = useNavigate();
  const durationsRef = useRef({});
  const videoRefs = useRef({});
  const progressRefs = useRef({});

  const searchTerm = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search')?.toLowerCase() || '';
  }, [location.search]);

  const filteredVideos = useMemo(() => {
    let result = [...videos];
    if (activeGenre !== 'All') result = result.filter(v => v.genre === activeGenre);
    if (searchTerm) {
      result = result.filter(
        v =>
          v.title?.toLowerCase().includes(searchTerm) ||
          v.genre?.toLowerCase().includes(searchTerm)
      );
    }
    return result;
  }, [activeGenre, searchTerm, videos]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [videosRes, genresRes] = await Promise.all([
          axios.get('http://localhost:5000/api/videos'),
          axios.get('http://localhost:5000/api/genres')
        ]);
        setVideos(videosRes.data);
        setFiltered(videosRes.data);
        setGenres(['All', ...genresRes.data]);
      } catch (err) {
        console.error('Failed to fetch videos or genres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFiltered(filteredVideos);
  }, [filteredVideos]);

  const highlight = useCallback((text, keyword) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword ? (
        <mark
          key={i}
          className="bg-gradient-to-r from-violet-400 to-purple-400 px-2 py-1 rounded-md text-white font-semibold shadow-md"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  const formatDuration = useCallback((seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }, []);

  const formatViews = useCallback((num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num?.toString() || '0';
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (isNaN(parsed)) return '';
    const now = new Date();
    const diff = now - parsed;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getVideoSrc = (videoUrl) =>
    videoUrl?.startsWith('http') ? videoUrl : `http://localhost:5000/${videoUrl}`;

  const handleMouseEnter = (id) => {
    const vid = videoRefs.current[id];
    if (vid) {
      vid.currentTime = 0;
      vid.play();
    }
  };

  const handleMouseLeave = (id) => {
    const vid = videoRefs.current[id];
    if (vid) {
      vid.pause();
      vid.currentTime = 0;
    }
    if (progressRefs.current[id]) {
      progressRefs.current[id].style.width = '0%';
    }
  };

  const handleTimeUpdate = (id) => {
    const vid = videoRefs.current[id];
    if (vid && progressRefs.current[id]) {
      const percent = (vid.currentTime / vid.duration) * 100;
      progressRefs.current[id].style.width = `${percent}%`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-400/5 via-blue-400/3 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-400/5 via-purple-400/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/3 to-orange-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-emerald-400/4 to-teal-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.4; }
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 relative"
        >
          <div className="text-center mb-8 relative">
            {/* Animated Title Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-purple-500/10 blur-3xl rounded-full animate-pulse"></div>
            
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="relative text-6xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent mb-4 tracking-tight"
            >
              {searchTerm ? (
                <>
                  Results for{' '}
                  <motion.span 
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    "{searchTerm}"
                  </motion.span>
                </>
              ) : (
                <motion.span
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="bg-gradient-to-r from-slate-800 via-violet-600 via-slate-800 to-slate-800 bg-clip-text text-transparent"
                  style={{ backgroundSize: '300% 300%' }}
                >
                  Video Library
                </motion.span>
              )}
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '96px' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 rounded-full mx-auto mb-4"
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-slate-600 text-lg font-medium"
            >
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {filtered.length} {filtered.length === 1 ? 'video' : 'videos'} available
              </motion.span>
            </motion.p>
          </div>
        </motion.div>

        {/* Genre Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-8 mb-12 overflow-hidden"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-purple-500/20">
            <div className="w-full h-full bg-white/30 backdrop-blur-2xl rounded-3xl"></div>
          </div>
          
          {/* Moving Gradient Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-purple-500/5 rounded-3xl"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ backgroundSize: '400% 400%' }}
          />
          
          <div className="relative flex flex-wrap justify-center gap-2">
            {genres.map((genre, index) => (
              <motion.button
                key={genre}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveGenre(genre)}
                className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-400 overflow-hidden group ${
                  activeGenre === genre
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/25'
                    : 'bg-white/60 hover:bg-white/80 text-slate-600 hover:text-slate-900 border border-white/60 hover:border-white/80 backdrop-blur-xl'
                }`}
              >
                {activeGenre === genre && (
                  <motion.div
                    layoutId="activeGenre"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                
                <span className="relative z-10">{genre}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Video Grid */}
        {loading ? (
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Loading videos...
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={
              viewMode === 'grid'
                ? 'grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
                : 'space-y-6'
            }
          >
            {filtered.map((video, index) => {
              const videoSrc = getVideoSrc(video.videoUrl);
              return (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 120,
                    damping: 20
                  }}
                  whileHover={{ 
                    y: -12,
                    scale: 1.03,
                    rotateX: 5,
                    rotateY: 5,
                    transition: { 
                      duration: 0.4, 
                      type: "spring", 
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  className="group relative overflow-hidden backdrop-blur-3xl border shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.2)] transition-all duration-700 ease-out transform-gpu perspective-1000"
                  style={{
                    borderRadius: '28px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    borderImage: 'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05)) 1'
                  }}
                  onMouseEnter={() => handleMouseEnter(video._id)}
                  onMouseLeave={() => handleMouseLeave(video._id)}
                >
                  {/* Holographic Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: 'linear-gradient(45deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1), rgba(168,85,247,0.1), rgba(59,130,246,0.1))',
                      backgroundSize: '400% 400%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />

                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-[1px] rounded-[27px] bg-gradient-to-br from-white/8 via-white/4 to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating Light Orbs */}
                  <motion.div
                    className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-violet-400/15 to-cyan-400/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100"
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                      x: [0, 10, 0],
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-tr from-purple-400/12 to-pink-400/12 rounded-full blur-xl opacity-0 group-hover:opacity-100"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [360, 180, 0],
                      x: [0, -8, 0],
                      y: [0, 8, 0],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />

                  <Link to={`/video/${video._id}`} className="block relative z-10">
                    {/* Video Container with Enhanced Effects */}
                    <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden" style={{ borderRadius: '28px 28px 0 0' }}>
                      <video
                        ref={(el) => (videoRefs.current[video._id] = el)}
                        className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-105"
                        src={videoSrc}
                        muted
                        preload="metadata"
                        playsInline
                        onLoadedMetadata={(e) => {
                          if (e.target.duration && !isNaN(e.target.duration)) {
                            durationsRef.current[video._id] = e.target.duration;
                          }
                        }}
                        onTimeUpdate={() => handleTimeUpdate(video._id)}
                      />

                      {/* Dynamic Gradient Overlay */}
                      <motion.div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, transparent 40%, rgba(6,182,212,0.1) 100%)'
                        }}
                        animate={{
                          background: [
                            'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, transparent 40%, rgba(6,182,212,0.1) 100%)',
                            'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, transparent 40%, rgba(168,85,247,0.1) 100%)',
                            'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, transparent 40%, rgba(6,182,212,0.1) 100%)',
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      {/* Ultra Premium Play Button */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-600"
                        initial={{ scale: 0, rotate: -180 }}
                        whileHover={{ scale: 1 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative"
                        >
                          {/* Multiple Pulsing Rings */}
                          <motion.div
                            className="absolute inset-0 w-24 h-24 rounded-full border border-white/20"
                            animate={{
                              scale: [1, 1.8, 1],
                              opacity: [0.4, 0, 0.4],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="absolute inset-0 w-24 h-24 rounded-full border border-white/15"
                            animate={{
                              scale: [1, 1.6, 1],
                              opacity: [0.3, 0, 0.3],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          />
                          <motion.div
                            className="absolute inset-0 w-24 h-24 rounded-full border border-white/10"
                            animate={{
                              scale: [1, 1.4, 1],
                              opacity: [0.2, 0, 0.2],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                          />
                          
                          {/* Main Button */}
                          <motion.div
                            className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                            style={{
                              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255,255,255,0.3)'
                            }}
                            animate={{
                              boxShadow: [
                                '0 20px 40px rgba(0,0,0,0.15)',
                                '0 25px 50px rgba(139,92,246,0.2)',
                                '0 20px 40px rgba(0,0,0,0.15)',
                              ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <motion.div
                              animate={{ 
                                x: [0, 3, 0],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-0 h-0 border-l-[14px] border-l-slate-800 border-y-[12px] border-y-transparent ml-2"
                            />
                          </motion.div>
                        </motion.div>
                      </motion.div>

                      {/* Cinematic Progress Bar */}
                      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 backdrop-blur-sm">
                        <motion.div
                          ref={(el) => (progressRefs.current[video._id] = el)}
                          className="h-1.5 relative overflow-hidden"
                          style={{ width: '0%' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400"></div>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Premium Content Section */}
                    <div className="relative p-7">
                      {/* Subtle Content Glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-white/2 to-transparent rounded-b-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <motion.h3 
                        className="relative text-base font-semibold text-slate-900 line-clamp-2 mb-5 leading-relaxed tracking-[-0.02em] transition-colors duration-300"
                        style={{ lineHeight: '1.4' }}
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {highlight(video.title, searchTerm)}
                      </motion.h3>

                      {/* Enhanced Footer */}
                      <div className="relative flex items-center justify-between">
                        <motion.div 
                          whileHover={{ 
                            scale: 1.08, 
                            x: 4,
                            y: -2
                          }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="relative px-4 py-2 rounded-2xl text-xs font-semibold border transition-all duration-300"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
                            backdropFilter: 'blur(10px)',
                            borderColor: 'rgba(255,255,255,0.6)',
                            color: '#475569'
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(145deg, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.1) 100%)'
                            }}
                          />
                          <span className="relative">{video.genre}</span>
                        </motion.div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                          <motion.span 
                            className="flex items-center gap-2"
                            whileHover={{ scale: 1.05, x: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <motion.div 
                              className="w-3.5 h-3.5 rounded-full relative overflow-hidden"
                              animate={{ 
                                rotate: [0, 360],
                              }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400"></div>
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{
                                  rotate: [0, 360],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              />
                            </motion.div>
                            {formatViews(video.views || 0)}
                          </motion.span>
                          <motion.span 
                            className="text-slate-300"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            •
                          </motion.span>
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                          >
                            {formatDate(video.createdAt)}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;