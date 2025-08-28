import React, { useState, useEffect, useRef } from 'react';
import api from "../api";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    ageRating: 'PG',
    genre: '',
    video: null,
    creatorId: '',
  });

  const [status, setStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('streemzaUser'));
    if (user && user.id) {
      setForm((prev) => ({ ...prev, creatorId: user.id }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const file = files ? files[0] : null;

    if (name === 'video' && file) {
      handleFileSelect(file);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setPreviewUrl(URL.createObjectURL(file));
      setForm((prev) => ({
        ...prev,
        title: prev.title || file.name.split('.').slice(0, -1).join('.'),
        video: file,
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');
    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    for (let key in form) {
      data.append(key, form[key]);
    }

    try {
      await api.post('/videos/upload', data, {
  onUploadProgress: (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setUploadProgress(progress);
  }
});
      
      setStatus('✅ Video uploaded successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
      setForm({
        title: '',
        description: '',
        ageRating: 'PG',
        genre: '',
        video: null,
        creatorId: form.creatorId,
      });
      setPreviewUrl('');
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      setStatus('❌ Upload failed. Please try again.');
    }

    setUploading(false);
  };

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Documentary', 'Fantasy',
    'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Biography',
    'Crime', 'Musical', 'Short Film'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-400/5 via-blue-400/3 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-400/5 via-purple-400/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/3 to-orange-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
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
          className="mb-12 text-center"
        >
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-6xl font-black bg-gradient-to-r from-slate-800 via-violet-600 to-slate-800 bg-clip-text text-transparent mb-4 tracking-tight"
          >
            <motion.span
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="bg-gradient-to-r from-slate-800 via-violet-600 via-slate-800 to-slate-800 bg-clip-text text-transparent"
              style={{ backgroundSize: '300% 300%' }}
            >
              Upload Your Video
            </motion.span>
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
            Share your story with the world
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative backdrop-blur-2xl bg-white/40 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-8 overflow-hidden"
          >
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-purple-500/20">
              <div className="w-full h-full bg-white/40 backdrop-blur-2xl rounded-3xl"></div>
            </div>
            
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-purple-500/5 rounded-3xl"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              }}
              transition={{ duration: 8, repeat: Infinity }}
              style={{ backgroundSize: '400% 400%' }}
            />

            <form onSubmit={handleSubmit} className="relative space-y-6">
              {/* File Upload Area */}
              <div
                className={`relative group transition-all duration-500 ${dragActive ? 'scale-105' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  name="video"
                  onChange={handleChange}
                  className="hidden"
                />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl p-12 border-2 border-dashed transition-all duration-500 ${
                    dragActive
                      ? 'border-violet-400 bg-violet-50/50 scale-105'
                      : previewUrl
                      ? 'border-green-400 bg-green-50/30'
                      : 'border-gray-300 hover:border-violet-400 bg-gray-50/30 hover:bg-violet-50/30'
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <video
                        src={previewUrl}
                        controls
                        className="w-full max-h-64 rounded-xl shadow-lg object-cover"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </motion.div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        Drop your video here
                      </h3>
                      <p className="text-slate-600 mb-2">
                        or <span className="text-violet-600 font-semibold">click to browse</span>
                      </p>
                      <p className="text-sm text-slate-500">
                        Supports MP4, WebM • Max 500MB
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  name="title"
                  type="text"
                  placeholder="Video Title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                />

                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  name="description"
                  placeholder="Description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </motion.select>

                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="ageRating"
                    onChange={handleChange}
                    value={form.ageRating}
                    className="w-full px-6 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="PG">PG</option>
                    <option value="18+">18+</option>
                    <option value="R">R</option>
                  </motion.select>
                </div>
              </div>

              {/* Upload Button */}
              <motion.button
                type="submit"
                disabled={uploading || !form.video}
                whileHover={{ scale: uploading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-full overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform ${
                  uploading || !form.video ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'
                }`}
              >
                {uploading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Video
                    </>
                  )}
                </span>
              </motion.button>

              {/* Status Message */}
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center py-3 px-4 rounded-xl ${
                    status.includes('✅') 
                      ? 'bg-green-100/80 text-green-800 border border-green-200' 
                      : status.includes('❌')
                      ? 'bg-red-100/80 text-red-800 border border-red-200'
                      : 'bg-blue-100/80 text-blue-800 border border-blue-200'
                  }`}
                >
                  {status}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Guidelines Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-8 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-violet-500/20">
              <div className="w-full h-full bg-white/30 backdrop-blur-2xl rounded-3xl"></div>
            </div>
            
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-violet-500/5 rounded-3xl"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ backgroundSize: '400% 400%' }}
            />

            <div className="relative">
              {/* Illustration */}
              <motion.div
                className="text-center mb-8"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <motion.svg
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </motion.svg>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4 text-center"
              >
                Upload Guidelines
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-slate-600 text-center mb-8 leading-relaxed"
              >
                Follow these guidelines to ensure your content gets approved quickly and reaches your audience effectively.
              </motion.p>

              <div className="space-y-4">
                {[
                  { icon: '✅', text: 'Upload only original content you own', color: 'from-green-500 to-emerald-500' },
                  { icon: '📝', text: 'Keep titles and descriptions accurate', color: 'from-blue-500 to-cyan-500' },
                  { icon: '📦', text: 'Maximum video size: 500MB', color: 'from-orange-500 to-amber-500' },
                  { icon: '🎬', text: 'Supported formats: MP4, WebM', color: 'from-teal-500 to-cyan-500' },
                ].map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-r ${rule.color} flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      {rule.icon}
                    </motion.div>
                    <p className="text-slate-700 font-medium flex-1">{rule.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
