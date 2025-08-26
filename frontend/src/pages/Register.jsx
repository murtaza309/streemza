import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, User, Mail, Lock, Calendar } from 'lucide-react';
import api from "../api";
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    role: 'consumer',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const hasMinLength = formData.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const ValidationItem = ({ isValid, text }) => (
    <div className={`flex items-center space-x-3 transition-all duration-300 ${isValid ? 'text-green-600' : 'text-slate-500'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        isValid ? 'bg-green-100' : 'bg-slate-100'
      }`}>
        {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  const handleSubmit = async () => {
    if (!(hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && passwordsMatch)) {
      alert('Please meet all password requirements before submitting.');
      return;
    }

    try {
      setLoading(true);
const res = await api.post('/register', {
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  username: formData.username,
  dateOfBirth: formData.dateOfBirth,
  password: formData.password,
  role: formData.role
});
alert('Account created successfully!');

// Auto-login and redirect to profile (no other logic changed)
try {
  if (res?.data?.user) {
    localStorage.setItem('streemzaUser', JSON.stringify(res.data.user));
  } else {
    const loginRes = await api.post('/login', {
      email: formData.email,
      password: formData.password
    });
    localStorage.setItem('streemzaUser', JSON.stringify(loginRes.data.user));
  }
} catch (_) {
  // keep flow unchanged if auto-login fails
}
const role = (res?.data?.user?.role || formData.role || '').toLowerCase();
if (role === 'creator') {
  navigate('/upload');
} else {
  // dashboard / homepage
  navigate('/');
  // If your dashboard route is '/dashboard', use:
  // navigate('/dashboard');
}

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Orbs - keeping original */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-400/5 via-blue-400/3 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-400/5 via-purple-400/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/3 to-orange-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-br from-emerald-400/4 to-teal-400/3 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>
      
      {/* Floating Particles - keeping original */}
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
        {/* Header - keeping original design exactly */}
        <div className="mb-12 relative">
          <div className="text-center mb-8 relative">
            {/* Animated Title Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-purple-500/10 blur-3xl rounded-full animate-pulse"></div>
            
            <h1 className="relative text-6xl font-black bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent mb-4 tracking-tight">
              <span
                className="bg-gradient-to-r from-slate-800 via-violet-600 via-slate-800 to-slate-800 bg-clip-text text-transparent"
                style={{ 
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 4s ease infinite'
                }}
              >
                Create Account
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
                Join us today and get started
              </span>
            </p>
          </div>
        </div>

        <style jsx>{`
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
        `}</style>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form Section */}
          <div className="relative backdrop-blur-2xl bg-white/40 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-8 overflow-hidden">
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-purple-500/20">
              <div className="w-full h-full bg-white/40 backdrop-blur-2xl rounded-3xl"></div>
            </div>
            
            <div 
              className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-purple-500/5 rounded-3xl"
              style={{
                backgroundSize: '400% 400%',
                animation: 'gradient-flow 8s ease infinite'
              }}
            />

            <div className="relative space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Role</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full appearance-none pl-12 pr-10 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="creator">Creator</option>
                    <option value="consumer">Consumer</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Enter password"
                    required
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

              {/* Confirm Password */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-violet-500 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    Passwords do not match
                  </p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <div className="mt-2">
                    <ValidationItem isValid={passwordsMatch} text="Passwords match" />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`relative w-full overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </span>
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-slate-600 text-sm">
                  Already have an account?{' '}
                  <a href="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-300">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Password Requirements & Info Section */}
          <div className="relative backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-violet-500/20">
              <div className="w-full h-full bg-white/30 backdrop-blur-2xl rounded-3xl"></div>
            </div>
            
            <div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-violet-500/5 rounded-3xl"
              style={{
                backgroundSize: '400% 400%',
                animation: 'gradient-flow 6s ease infinite'
              }}
            />

            <div className="relative">
              {/* Icon & Title */}
              <div className="text-center mb-8">
                <div 
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    animation: 'float-up-down 3s ease-in-out infinite'
                  }}
                >
                  <div className="text-white text-3xl font-bold">
                    🔐
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6 text-center">
                Password Requirements
              </h3>

              <div className="space-y-4 mb-8">
                <ValidationItem isValid={hasMinLength} text="At least 8 characters" />
                <ValidationItem isValid={hasUpperCase} text="One uppercase letter" />
                <ValidationItem isValid={hasLowerCase} text="One lowercase letter" />
                <ValidationItem isValid={hasNumber} text="One number" />
                <ValidationItem isValid={hasSpecialChar} text="One special character" />
              </div>

              {/* Welcome Message */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Welcome to Our Platform</h4>
                <p className="text-slate-600 leading-relaxed">
                  Join thousands of users who trust us with their journey. Create your account and start exploring today with our secure and modern platform.
                </p>
              </div>
              
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-flow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes float-up-down {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Register;
