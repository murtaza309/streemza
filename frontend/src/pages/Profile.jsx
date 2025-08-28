import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../api";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Calendar, Camera, MapPin, Globe, Award, Play, Clock, Shield, Settings, Users, Film } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    role: 'consumer'
  });

  const currentUser = JSON.parse(localStorage.getItem('streemzaUser')) || {};
  const isSelf = profile?._id === currentUser?.id || profile?._id === currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/username/${id}`);
        setProfile(res.data);
        setSubscriberCount(res.data.subscribers?.length || 0);
                  // Default non-creators to About tab
          if ((res.data.role || '').toLowerCase() !== 'creator') {
            setActiveTab('about');
          }
                  
        // Format date properly for the input field
        let formattedDate = '';
        if (res.data.dateOfBirth) {
          const date = new Date(res.data.dateOfBirth);
          formattedDate = date.toISOString().split('T')[0];
        }
        
        setEditForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          username: res.data.username || '',
          dateOfBirth: formattedDate,
          password: '',
          confirmPassword: '',
          role: res.data.role || 'consumer'
        });
        setPreviewImage(res.data.profilePic ? `${process.env.REACT_APP_API_BASE_URL}${res.data.profilePic}` : '');

        const videoRes = await api.get(`/videos`);
        const userVideos = videoRes.data.filter(v => v.creator._id === res.data._id);
        setVideos(userVideos);
      } catch (err) {
        console.error('❌ Failed to fetch user profile', err);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSubscribe = async () => {
    try {
      await api.post(`/subscribe/${id}`, { userId: currentUser.id });
      setSubscriberCount(prev => prev + 1);
      setIsSubscribed(true);
    } catch (err) {
      console.error('❌ Subscribe failed:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Check if passwords match when password is provided
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('firstName', editForm.firstName);
      formData.append('lastName', editForm.lastName);
      formData.append('username', editForm.username);
      formData.append('email', editForm.email);
      formData.append('dateOfBirth', editForm.dateOfBirth);
      formData.append('role', editForm.role);
      if (editForm.password) {
        formData.append('password', editForm.password);
      }
      if (selectedFile) {
        formData.append('profilePic', selectedFile);
      }
      formData.append('userId', currentUser.id);

      const res = await api.put(`/users/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

      toast.success('Profile updated successfully');
      
      // Update profile state with response data or form data
      const updatedProfile = {
        ...profile,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        username: editForm.username,
        email: editForm.email,
        dateOfBirth: editForm.dateOfBirth,
        role: editForm.role,
        profilePic: res.data?.profilePic || profile.profilePic
      };
      
      setProfile(updatedProfile);
      
      // Update localStorage if this is the current user
      const storedUser = JSON.parse(localStorage.getItem('streemzaUser') || '{}');
      if (storedUser.id === profile._id || storedUser._id === profile._id) {
        const updatedStoredUser = {
          ...storedUser,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          username: editForm.username,
          email: editForm.email,
          dateOfBirth: editForm.dateOfBirth,
          role: editForm.role
        };
        localStorage.setItem('streemzaUser', JSON.stringify(updatedStoredUser));
      }
      
      setShowModal(false);
      
      // Reset password fields
      setEditForm(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      console.error('❌ Update failed:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const formatViews = (num) => {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const uploadDate = new Date(date);
    const diffInSeconds = Math.floor((now - uploadDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const passwordsMatch = editForm.password === editForm.confirmPassword && editForm.confirmPassword !== '';

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full mx-auto mb-6"
          />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Full name fallback logic
  const fullName = profile.firstName || profile.lastName
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : null;

  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-gray-50'} relative overflow-hidden transition-colors duration-300`}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-1/2 -left-1/2 w-full h-full ${isDarkMode ? 'bg-gradient-to-br from-violet-400/3 via-blue-400/2 to-transparent' : 'bg-gradient-to-br from-violet-400/5 via-blue-400/3 to-transparent'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full ${isDarkMode ? 'bg-gradient-to-tl from-cyan-400/3 via-purple-400/2 to-transparent' : 'bg-gradient-to-tl from-cyan-400/5 via-purple-400/3 to-transparent'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/4 left-1/3 w-96 h-96 ${isDarkMode ? 'bg-gradient-to-br from-pink-400/2 to-orange-400/2' : 'bg-gradient-to-br from-pink-400/3 to-orange-400/3'} rounded-full blur-2xl animate-bounce`} style={{ animationDuration: '6s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full ${isDarkMode ? 'opacity-30' : 'opacity-20'}`}
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

      {/* Dark Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-6 right-6 z-40 w-14 h-14 ${isDarkMode ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-white'} rounded-full shadow-2xl flex items-center justify-center transition-all duration-300`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </motion.button>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Enhanced Profile Header with Cover */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl"
        >
          {/* Cover Photo Section */}
          <div className={`h-64 ${isDarkMode ? 'bg-gradient-to-r from-slate-800 via-violet-900 to-slate-800' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600'} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Cover overlay pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>

            {isSelf && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black/50 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Cover</span>
              </motion.button>
            )}
          </div>

          {/* Profile Info Section */}
          <div className={`relative ${isDarkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-xl p-8 -mt-20`}>
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
              {/* Enhanced Profile Picture */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", stiffness: 100 }}
                className="relative group -mt-16"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg scale-110"></div>
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src={
                    profile.profilePic
                      `${process.env.REACT_APP_API_BASE_URL.replace('/api','')}${profile.profilePic}`
                      : `https://ui-avatars.com/api/?name=${profile.username}&background=6366f1&color=ffffff&bold=true&size=200`
                  }
                  alt="avatar"
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                />
                
                {/* Role Badge */}
                <div className={`absolute -bottom-2 -right-2 ${
                  profile.role === 'admin' ? 'bg-red-500' :
                  profile.role === 'creator' ? 'bg-orange-500' : 'bg-green-500'
                } rounded-full p-2 shadow-lg`}>
                  {profile.role === 'admin' ? <Shield className="w-4 h-4 text-white" /> :
                   profile.role === 'creator' ? <Award className="w-4 h-4 text-white" /> :
                   <User className="w-4 h-4 text-white" />}
                </div>
              </motion.div>

              {/* Enhanced Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <div>
                    {fullName && (
                      <motion.h2
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}
                      >
                        {fullName}
                      </motion.h2>
                    )}
                    <motion.h1
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`text-4xl font-black ${isDarkMode ? 'bg-gradient-to-r from-slate-200 via-violet-400 to-slate-200' : 'bg-gradient-to-r from-slate-800 via-violet-600 to-slate-800'} bg-clip-text text-transparent mb-2`}
                    >
                      {profile.username}
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-lg flex items-center gap-2 justify-center lg:justify-start`}
                    >
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </motion.p>
                  </div>
                  
                  {/* Verification Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className={`px-4 py-2 ${profile.role === 'admin' ? 'bg-red-100 text-red-800' : profile.role === 'creator' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'} rounded-full text-sm font-semibold flex items-center gap-2 w-fit mx-auto lg:mx-0`}
                  >
                    {profile.role === 'admin' ? <Shield className="w-4 h-4" /> :
                     profile.role === 'creator' ? <Award className="w-4 h-4" /> :
                     <User className="w-4 h-4" />}
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </motion.div>
                </div>

                {/* Enhanced Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                >
                  <div className={`${isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-600' : 'border-white/50'} rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-1`}>{subscriberCount}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} flex items-center justify-center gap-1`}>
                      <Users className="w-3 h-3" />
                      Subscribers
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-600' : 'border-white/50'} rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-1`}>{videos.length}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} flex items-center justify-center gap-1`}>
                      <Film className="w-3 h-3" />
                      Videos
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-600' : 'border-white/50'} rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-1`}>{formatViews(totalViews)}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} flex items-center justify-center gap-1`}>
                      <Play className="w-3 h-3" />
                      Views
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-600' : 'border-white/50'} rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                      {profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : '--'}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} flex items-center justify-center gap-1`}>
                      <Calendar className="w-3 h-3" />
                      Age
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4"
                >
                  {isSelf ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowModal(true)}
                      className="relative overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Edit Profile
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.button>
                  ) : (
                    !isSubscribed && (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubscribe}
                        className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl group"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Subscribe
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>
                    )
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-lg border ${isDarkMode ? 'border-slate-700' : 'border-white/50'}`}
        >
          <div className="flex gap-2 overflow-x-auto">
                  {[
           ...(profile?.role && profile.role.toLowerCase() === 'creator'
          ? [{ id: 'videos', label: 'Videos', icon: Film, count: videos.length }]
          : []),
               { id: 'about', label: 'About', icon: User },
               { id: 'community', label: 'Community', icon: Users },
             ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                    : `${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : `${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Content Sections */}
        {activeTab === 'videos' && (profile?.role || '').toLowerCase() === 'creator' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`relative ${isDarkMode ? 'bg-slate-800/30' : 'bg-white/30'} backdrop-blur-2xl border ${isDarkMode ? 'border-slate-700/40' : 'border-white/40'} shadow-2xl rounded-3xl p-8 overflow-hidden`}
          >
            <motion.div 
              className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-slate-700/20 via-violet-900/20 to-slate-700/20' : 'bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-violet-500/5'} rounded-3xl`}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ backgroundSize: '400% 400%' }}
            />

            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-slate-200 to-slate-400' : 'bg-gradient-to-r from-slate-800 to-slate-600'} bg-clip-text text-transparent mb-8`}
              >
                {isSelf ? 'Your Videos' : `${profile.username}'s Videos`}
              </motion.h2>

              {videos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-32 h-32 mx-auto mb-8 ${isDarkMode ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-slate-400 to-slate-600'} rounded-full flex items-center justify-center shadow-2xl`}
                  >
                    <Film className="w-16 h-16 text-white" />
                  </motion.div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-4`}>
                    No videos yet
                  </h3>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-lg max-w-md mx-auto`}>
                    {isSelf 
                      ? "Start your content journey by uploading your first video!" 
                      : `${profile.username} hasn't uploaded any videos yet.`
                    }
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -8,
                        scale: 1.03,
                        transition: { duration: 0.3 }
                      }}
                      className={`group relative overflow-hidden ${isDarkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-3xl border ${isDarkMode ? 'border-slate-700/60' : 'border-white/60'} shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.2)] transition-all duration-500 rounded-3xl`}
                    >
                      {/* Enhanced Video Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden rounded-t-3xl relative">
                        <video
                          src={`${process.env.REACT_APP_API_BASE_URL}/${video.videoUrl}`}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          preload="metadata"
                        />
                        
                        {/* Video Duration */}
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(120)} {/* You can add actual duration if available */}
                        </div>
                        
                        {/* Enhanced Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/60 via-black/20 to-black/40">
                          <motion.div
                            initial={{ scale: 0 }}
                            whileHover={{ scale: 1.2 }}
                            className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
                          >
                            <Play className="w-8 h-8 text-slate-800 ml-1" fill="currentColor" />
                          </motion.div>
                        </div>

                        {/* View Count Overlay */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                          {formatViews(video.views)}
                        </div>
                      </div>

                      {/* Enhanced Video Info */}
                      <div className="p-6">
                        <h3 className={`font-bold ${isDarkMode ? 'text-slate-200 group-hover:text-violet-400' : 'text-slate-800 group-hover:text-violet-600'} text-lg mb-3 line-clamp-2 leading-tight transition-colors duration-300`}>
                          {video.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gradient-to-r from-violet-100 to-purple-100'} rounded-full`}
                          >
                            <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              {formatViews(video.views)} views
                            </span>
                          </motion.div>
                        </div>

                        {/* Upload Date */}
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
                          <Calendar className="w-3 h-3" />
                          {formatTimeAgo(video.createdAt || new Date())}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${isDarkMode ? 'bg-slate-800/30' : 'bg-white/30'} backdrop-blur-2xl border ${isDarkMode ? 'border-slate-700/40' : 'border-white/40'} shadow-2xl rounded-3xl p-8`}
          >
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-8`}>About {profile.username}</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className={`${isDarkMode ? 'bg-slate-700/30' : 'bg-white/50'} rounded-2xl p-6`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-4 flex items-center gap-2`}>
                  <User className="w-5 h-5" />
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Full Name</label>
                    <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} font-semibold`}>
                      {fullName || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Role</label>
                    <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} font-semibold capitalize`}>
                      {profile.role}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Member Since</label>
                    <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} font-semibold`}>
                      {new Date(profile.createdAt || new Date()).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-slate-700/30' : 'bg-white/50'} rounded-2xl p-6`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-4 flex items-center gap-2`}>
                  <Award className="w-5 h-5" />
                  Channel Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Views</label>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {formatViews(totalViews)}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Subscribers</label>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {subscriberCount}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Videos Uploaded</label>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {videos.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${isDarkMode ? 'bg-slate-800/30' : 'bg-white/30'} backdrop-blur-2xl border ${isDarkMode ? 'border-slate-700/40' : 'border-white/40'} shadow-2xl rounded-3xl p-8`}
          >
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-8`}>Community</h2>
            
            <div className="text-center py-16">
              <Users className={`w-20 h-20 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} mx-auto mb-6`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                Community features coming soon
              </h3>
              <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Connect with other users and build your community
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Edit Profile Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative ${isDarkMode ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-2xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} shadow-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}
          >
            {/* Enhanced Modal Header */}
            <div className={`relative p-8 pb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <motion.div 
                className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-slate-700/20 via-violet-900/20 to-slate-700/20' : 'bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-purple-500/10'}`}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{ backgroundSize: '400% 400%' }}
              />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className={`text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-slate-200 to-slate-400' : 'bg-gradient-to-r from-slate-800 to-slate-600'} bg-clip-text text-transparent`}>
                    Edit Profile
                  </h3>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                    Update your profile information and settings
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className={`w-10 h-10 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} rounded-full flex items-center justify-center transition-colors duration-200`}
                >
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleUpdate} className="relative p-8 space-y-8">
                {/* Profile Picture Section */}
                <div className="text-center">
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6`}>
                    Profile Picture
                  </h4>
                  <label
                    htmlFor="profilePic"
                    className="relative group cursor-pointer inline-block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-2xl"
                    >
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                      Click to upload new photo
                    </p>
                    <input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* Personal Information Section */}
                <div className={`${isDarkMode ? 'bg-slate-700/30' : 'bg-slate-50/50'} rounded-2xl p-6`}>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6 flex items-center gap-2`}>
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>First Name</label>
                      <div className="relative">
                        <User className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="text"
                          name="firstName"
                          value={editForm.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                          placeholder="First name"
                        />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Last Name</label>
                      <div className="relative">
                        <User className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="text"
                          name="lastName"
                          value={editForm.lastName}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Username</label>
                      <div className="relative">
                        <User className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="text"
                          name="username"
                          value={editForm.username}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Date of Birth</label>
                      <div className="relative">
                        <Calendar className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="date"
                          name="dateOfBirth"
                          value={editForm.dateOfBirth}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Settings Section */}
                <div className={`${isDarkMode ? 'bg-slate-700/30' : 'bg-slate-50/50'} rounded-2xl p-6`}>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6 flex items-center gap-2`}>
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Email</label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Role</label>
                      <div className="relative">
                        <User className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          name="role"
                          value={editForm.role}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200' : 'bg-white/60 border-gray-200/50 text-slate-800'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                        >
                          <option value="consumer">Consumer</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </motion.select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className={`${isDarkMode ? 'bg-slate-700/30' : 'bg-slate-50/50'} rounded-2xl p-6`}>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6 flex items-center gap-2`}>
                    <Shield className="w-5 h-5" />
                    Security
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>New Password (optional)</label>
                      <div className="relative">
                        <Lock className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={editForm.password}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-12 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-4 top-4 ${isDarkMode ? 'text-slate-500 hover:text-violet-400' : 'text-slate-400 hover:text-violet-500'} transition-colors duration-300`}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="group">
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Confirm Password</label>
                      <div className="relative">
                        <Lock className={`absolute left-4 top-4 h-5 w-5 ${isDarkMode ? 'text-slate-500 group-hover:text-violet-400' : 'text-slate-400 group-hover:text-violet-500'} transition-colors duration-300`} />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={editForm.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-12 py-4 ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 text-slate-200 placeholder-slate-500' : 'bg-white/60 border-gray-200/50 text-slate-800 placeholder-slate-500'} backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute right-4 top-4 ${isDarkMode ? 'text-slate-500 hover:text-violet-400' : 'text-slate-400 hover:text-violet-500'} transition-colors duration-300`}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {editForm.confirmPassword && editForm.password !== editForm.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-500 font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Passwords do not match
                        </motion.p>
                      )}
                      {editForm.confirmPassword && passwordsMatch && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-green-500 font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Passwords match
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex gap-4 pt-6 ${isDarkMode ? 'border-t border-slate-700' : 'border-t border-gray-200'}`}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className={`flex-1 px-8 py-4 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
