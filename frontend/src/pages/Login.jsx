import React, { useState } from 'react'; 
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper to extract readable error messages without changing the login logic
  const getReadableError = (err) => {
    try {
      if (err?.response) {
        const data = err.response.data;
        if (typeof data === 'string' && data.trim()) return data;
        if (data?.message) return data.message;
        if (Array.isArray(data?.errors) && data.errors.length) {
          return data.errors
            .map((e) => e?.msg || e?.message || (typeof e === 'string' ? e : 'Error'))
            .join(' • ');
        }
        // Fallback to HTTP status text if available
        if (err.response.status && err.response.statusText) {
          return `${err.response.status} ${err.response.statusText}`;
        }
        return 'An error occurred while logging in.';
      } else if (err?.request) {
        return 'No response from server. Please check your connection.';
      } else if (err?.message) {
        return err.message;
      }
      return 'Login failed.';
    } catch {
      return 'Login failed.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Authenticating...');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/login', form);
      localStorage.setItem('streemzaUser', JSON.stringify(res.data.user));
      setStatus('✨ Welcome back!');
      setTimeout(() => {
        const username = res.data?.user?.username;
        const role = (res.data?.user?.role || '').toLowerCase(); // <-- normalize
        if (role === 'creator') {
          navigate('/upload');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      const msg = getReadableError(err);
      setStatus(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements - matching your other pages */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-400/5 via-blue-400/3 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-400/5 via-purple-400/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/3 to-orange-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-emerald-400/4 to-teal-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>
      
      {/* Floating Particles - matching your other pages */}
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
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes width-expand {
          from { width: 0; }
          to { width: 96px; }
        }
        @keyframes fade-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-up-down {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header - matching your register page style */}
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
              <motion.span
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-gradient-to-r from-slate-800 via-violet-600 via-slate-800 to-slate-800 bg-clip-text text-transparent"
                style={{ backgroundSize: '300% 300%' }}
              >
                Welcome Back
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
              Sign in to continue your journey
            </motion.p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Welcome Section - matching your register page design */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-8 overflow-hidden order-2 lg:order-1"
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
              {/* Animated Title Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-purple-500/10 blur-3xl rounded-full animate-pulse"></div>
              
              <div className="relative text-center mb-8">
                <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent mb-4 tracking-tight">
                  <span
                    className="bg-gradient-to-r from-slate-800 via-violet-600 via-slate-800 to-slate-800 bg-clip-text text-transparent"
                    style={{ 
                      backgroundSize: '300% 300%',
                      animation: 'gradient-shift 4s ease infinite'
                    }}
                  >
                    Ready to Continue?
                  </span>
                </h1>
                
                <div 
                  className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 rounded-full mx-auto mb-4"
                  style={{
                    width: '96px',
                    animation: 'width-expand 1s ease 0.5s both'
                  }}
                />
                
                <p className="text-slate-600 text-lg font-medium">
                  <span style={{ animation: 'fade-pulse 2s ease infinite' }}>
                    Access your account and pick up right where you left off
                  </span>
                </p>
              </div>

              {/* Welcome Content */}
              <div className="text-center mb-8">
                <motion.div 
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="text-white text-3xl font-bold">
                    👋
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Your Dashboard Awaits</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Access your personalized experience and continue exploring all the features tailored just for you.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Zap, text: 'Access your dashboard', color: 'from-blue-500 to-cyan-500' },
                    { icon: Shield, text: 'Premium features unlocked', color: 'from-purple-500 to-violet-500' },
                    { icon: Sparkles, text: 'Secure & encrypted', color: 'from-green-500 to-emerald-500' },
                  ].map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
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
                          className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </motion.div>
                        <p className="text-slate-700 font-medium flex-1">{feature.text}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Login Form - matching your register page form style */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative backdrop-blur-2xl bg-white/40 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-8 overflow-hidden order-1 lg:order-2"
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

            <div className="relative">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Sign In
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Enter your credentials to access your account
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={form.email}
                      onChange={handleChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                      className="w-full pl-12 pr-12 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-slate-400 hover:text-violet-500 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-violet-600 bg-white/60 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-slate-600">Remember me</span>
                  </label>
                  <button 
                    type="button"
                    className="text-sm text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-300"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !form.email || !form.password}
                  whileHover={{ scale: (loading || !form.email || !form.password) ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform ${
                    loading || !form.email || !form.password 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:-translate-y-1'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Status Message */}
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center py-3 px-4 rounded-xl transition-all duration-300 ${
                      status.includes('✨') 
                        ? 'bg-green-100/80 text-green-800 border border-green-200' 
                        : status.includes('❌')
                        ? 'bg-red-100/80 text-red-800 border border-red-200'
                        : 'bg-blue-100/80 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {status}
                  </motion.div>
                )}

                {/* Register Link */}
                <div className="text-center pt-4">
                  <p className="text-slate-600 text-sm">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-300"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
