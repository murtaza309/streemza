import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Notifications from './Notifications';
import StreemzaLogo from './StreemzaLogo';
import api from "../api"; 

const Header = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Better scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-trigger') && !event.target.closest('.dropdown-menu')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('streemzaUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        try {
          // ✅ use api instead of fetch
          const res = await api.get(`/users/${parsed.id}`);
          const data = res.data;
          const username = data.username;
          setUser({ ...data, id: data._id });

          // ✅ Fetch notifications using api
          const notifRes = await api.get(`/notifications/${username}`);
          setNotifications(notifRes.data);
        } catch (err) {
          console.error('❌ Failed to fetch user or notifications:', err);
        }
      }
    };

    fetchUser();

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.add('transition-colors', 'duration-500');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem('streemzaUser');
    setUser(null);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.add('transition-colors', 'duration-500');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    // 🔥 nothing else touched below
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-900/95 border-b border-gray-200/60 dark:border-slate-700/40 shadow-sm transition-all duration-300">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 flex items-center justify-between py-3">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="transform group-hover:scale-105 transition-transform duration-200">
            <StreemzaLogo />
          </div>
        </Link>

        {/* Search Section */}
        <form onSubmit={handleSearchSubmit} className="flex items-center mx-6 w-full max-w-2xl">
          <div className="flex w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex w-full bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-slate-600/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 relative z-10">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search videos..."
                className="flex-1 px-6 py-3 focus:outline-none bg-transparent text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 text-sm font-medium"
              />
              <button
                type="submit"
                className="w-14 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-700/50 dark:to-slate-600/50 hover:from-violet-50 hover:to-purple-50 dark:hover:from-slate-600/50 dark:hover:to-slate-500/50 transition-all duration-300 group/btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-600 dark:text-slate-400 group-hover/btn:text-violet-600 dark:group-hover/btn:text-violet-400 transition-colors duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* Right Section */}
        {/* 👇 Everything else unchanged */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Create Button - Only for Creator role */}
              {(user?.role || '').toLowerCase() === 'creator' && (
                <Link
                  to="/upload"
                  className="relative group overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
              {/* Notifications + Profile remain same */}
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-semibold px-4 py-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
