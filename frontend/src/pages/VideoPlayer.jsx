import React, { useEffect, useState, useRef } from 'react';
import api from "../api";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../components/Container';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [uploader, setUploader] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [suggested, setSuggested] = useState([]);
  const viewTrackedRef = useRef(false);
  const user = JSON.parse(localStorage.getItem('streemzaUser'));

  const fetchVideo = async () => {
    const res = await api.get(`/videos/${id}`);
    setVideo(res.data);

    if (res.data.creator?.username) {
      const userRes = await api.get(`/users/username/${res.data.creator.username}`);
      setUploader(userRes.data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchVideo();
        const c = await api.get(`/videos/${id}/comments`);
        setComments(c.data);
        const s = await api.get(`/videos`);
        setSuggested(s.data.filter(v => v._id !== id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleComment = async (e) => {
  e.preventDefault();
  if (!user) return navigate('/login');
  if (!text) return;

  try {
    await api.post(`/videos/${id}/comments`, {
      text,
      userId: user.id,
    });
    setText('');
    const updated = await api.get(`/videos/${id}/comments`);
    setComments(updated.data);
  } catch (err) {
    console.error(err);
  }
};

  const handleLike = async () => {
    if (!user) return navigate('/login');
    await api.post(`/videos/${id}/like`, { userId: user.id });
    await fetchVideo();
  };

  const handleUnlike = async () => {
    if (!user) return navigate('/login');
    await api.post(`/videos/${id}/unlike`, { userId: user.id });
    await fetchVideo();
  };

  const handleTimeUpdate = async (e) => {
    if (!viewTrackedRef.current && e.target.currentTime > 5) {
      try {
        await api.put(`/videos/views/${id}`);
        setVideo(prev => ({
          ...prev,
          views: (prev?.views || 0) + 1
        }));
        viewTrackedRef.current = true;
      } catch (err) {
        console.error('Failed to increment views:', err);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: video?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubscribe = async () => {
    if (!user) return navigate('/login');
    try {
      const isSubscribed = uploader?.subscribers?.includes(user.id);

      if (isSubscribed) {
        await api.post(`/unsubscribe/${uploader._id}`, {
          userId: user.id
        });
      } else {
        await api.post(`/subscribe/${uploader._id}`,  {
          userId: user.id
        });
      }
      await fetchVideo();
    } catch (err) {
      console.error('Subscription action failed:', err);
    }
  };

  const isLiked = video?.likes?.includes(user?.id);
  const isUnliked = video?.unlikes?.includes(user?.id);
  const isSubscribed = uploader?.subscribers?.includes(user?.id);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const glassCardStyle = "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 shadow-2xl";
  const gradientText = "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent";

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent,transparent)] pointer-events-none" />
      
      <Container>
        {video ? (
          <motion.div className="py-8 px-4 relative" variants={itemVariants}>
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Main Video Section */}
              <div className="flex-1 space-y-8">
                {/* Video Player with Glass Effect */}
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  variants={itemVariants}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl transform rotate-1" />
                  <div className={`relative rounded-3xl overflow-hidden ${glassCardStyle} p-2`}>
                    <video
  className="w-full aspect-video object-cover rounded-2xl"
  src={video.videoUrl}
  controls
  onTimeUpdate={handleTimeUpdate}
/>
                  </div>
                </motion.div>

                {/* Video Title with Gradient */}
                <motion.div className="space-y-6" variants={itemVariants}>
                  <h1 className={`text-3xl lg:text-4xl font-bold ${gradientText} leading-tight`}>
                    {video.title}
                  </h1>
                  
                  {/* Animated Stats */}
                  <motion.div 
                    className="flex items-center gap-6 text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold">{(video.views || 0).toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Enhanced Channel & Actions Bar */}
                <motion.div 
                  className={`${glassCardStyle} rounded-3xl p-6`}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Channel Info with Hover Effects */}
                    <Link 
                      to={`/profile/${uploader?.username}`} 
                      className="flex items-center gap-4 group"
                    >
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                        <img
                          src={uploader?.profilePic
                           ? `${process.env.REACT_APP_API_BASE_URL.replace('/api','')}${uploader.profilePic}`
                           : `https://ui-avatars.com/api/?name=${uploader?.username || 'User'}&background=6366f1&color=ffffff&bold=true`}
                          alt="Channel"
                          className="relative w-14 h-14 rounded-full object-cover border-2 border-white/50 dark:border-gray-700/50"
                        />
                      </motion.div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-lg">
                          {uploader?.username || 'Unknown'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          {(uploader?.subscribers?.length || 0).toLocaleString()} subscribers
                        </p>
                      </div>
                    </Link>

                    {/* Animated Action Buttons */}
                    <div className="flex items-center gap-4">
                      {/* Like/Dislike with Cool Animation */}
                      <div className="flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/30 dark:border-gray-700/30">
                        <motion.button 
                          onClick={handleLike}
                          className={`flex items-center gap-3 px-5 py-3 font-semibold transition-all ${
                            isLiked ? 'text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30' : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.svg 
                            className="w-5 h-5" 
                            fill={isLiked ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                          </motion.svg>
                          {video.likes?.length || 0}
                        </motion.button>
                        <div className="w-px h-8 bg-gray-300/50 dark:bg-gray-600/50"></div>
                        <motion.button 
                          onClick={handleUnlike}
                          className={`flex items-center gap-3 px-5 py-3 font-semibold transition-all ${
                            isUnliked ? 'text-red-500 bg-red-100/50 dark:bg-red-900/30' : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.svg 
                            className="w-5 h-5" 
                            fill={isUnliked ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={isUnliked ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/>
                          </motion.svg>
                          {video.unlikes?.length || 0}
                        </motion.button>
                      </div>

                      {/* Share Button with Gradient */}
                      <motion.button 
                        onClick={handleShare}
                        className="flex items-center gap-3 px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                        </svg>
                        Share
                      </motion.button>

                      {/* Animated Subscribe Button */}
                      {user && uploader && user.id !== uploader._id && (
                        <motion.button 
                          onClick={handleSubscribe}
                          className={`px-8 py-3 font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl ${
                            isSubscribed 
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' 
                              : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                          }`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          animate={isSubscribed ? {} : { boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.4)", "0 0 0 10px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Description */}
                <motion.div 
                  className={`${glassCardStyle} rounded-3xl p-8`}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                    {video.description || 'No description provided.'}
                  </p>
                </motion.div>

                {/* Comments Section with Enhanced Design */}
                <motion.div className="space-y-8" variants={itemVariants}>
                  <div className="flex items-center gap-4">
                    <h2 className={`text-2xl font-bold ${gradientText}`}>
                      {comments.length} Comments
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                  </div>

                  {/* Enhanced Comment Input */}
                  <motion.div 
                    className={`${glassCardStyle} rounded-3xl p-8`}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex gap-6">
                      <motion.img
                        src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=6366f1&color=ffffff&bold=true`}
                        alt="Your Avatar"
                        className="w-12 h-12 rounded-full shadow-lg border-2 border-white/50 flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="flex-1">
                        <motion.textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          rows="4"
                          className="w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none resize-none transition-all placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                          placeholder={user ? 'Add a public comment...' : 'Login to comment'}
                          onFocus={() => {
                            if (!user) navigate('/login');
                          }}
                          whileFocus={{ scale: 1.02 }}
                        />
                        <AnimatePresence>
                          {user && text && (
                            <motion.div 
                              className="flex justify-end mt-6 gap-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <motion.button 
                                onClick={() => setText('')} 
                                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Cancel
                              </motion.button>
                              <motion.button 
                                onClick={handleComment} 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Comment
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced Comments List */}
                  <div className="space-y-6">
                    <AnimatePresence>
                      {comments.map((c, index) => (
                        <motion.div 
                          key={c._id} 
                          className={`flex gap-6 p-6 ${glassCardStyle} rounded-3xl hover:shadow-xl transition-all`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -2, scale: 1.01 }}
                        >
                          <motion.img
                            src={`https://ui-avatars.com/api/?name=${c.user?.username || 'User'}&background=6366f1&color=ffffff&bold=true`}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full shadow-lg border-2 border-white/50 flex-shrink-0"
                            whileHover={{ scale: 1.1 }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <p className="font-bold text-gray-900 dark:text-white">
                                @{c.user?.username || 'User'}
                              </p>
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{c.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Suggested Videos Sidebar */}
              <motion.div 
                className="w-full xl:w-[420px] space-y-6"
                variants={itemVariants}
              >
                <div className="flex items-center gap-4">
                  <h3 className={`text-2xl font-bold ${gradientText}`}>Up Next</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                </div>
                <div className="space-y-4">
                  {suggested.slice(0, 10).map((vid, index) => (
                    <motion.div
                      key={vid._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        to={`/video/${vid._id}`} 
                        className={`flex gap-4 p-4 rounded-2xl ${glassCardStyle} hover:shadow-xl transition-all group block`}
                      >
                        <motion.div 
                          className="relative w-44 h-28 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <video 
  className="w-full h-full object-cover" 
  src={vid.videoUrl}
  muted 
/>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <motion.div 
                            className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            Video
                          </motion.div>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {vid.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                            {vid.creator?.username || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-purple-500" />
                              {(vid.views || 0).toLocaleString()} views
                            </span>
                            <span>{new Date(vid.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center justify-center min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p 
                className="text-gray-600 dark:text-gray-400 text-xl font-semibold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading video...
              </motion.p>
            </div>
          </motion.div>
        )}
      </Container>
    </motion.div>
  );
};

export default VideoPlayer;
