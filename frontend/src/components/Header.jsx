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

              {/* Notifications */}
              <div className="relative">
                <button
                  className="dropdown-trigger relative w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-slate-700/50 border border-gray-200/50 dark:border-slate-600/50 transition-all duration-300 group shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === 'notifications' ? null : 'notifications')
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                  )}
                </button>

                {dropdownOpen === 'notifications' && (
                  <div className="dropdown-menu absolute right-0 mt-3 w-96 bg-white/95 dark:bg-slate-800/90 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-700/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {/* Header with actions */}
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200">
                          Notifications
                        </h3>
                        {notifications.length > 0 && (
                          <button className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                          {notifications.length} new notification{notifications.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-slate-300 mb-1">All caught up!</h4>
                          <p className="text-sm text-gray-500 dark:text-slate-500">You have no new notifications</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                          {notifications.map((n, index) => (
                            <li
                              key={n._id}
                              className="px-5 py-4 hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex items-start gap-3">
                                {/* Notification icon */}
                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                                
                                {/* Notification content */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {n.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                                    Just now
                                  </p>
                                </div>
                                
                                {/* Unread indicator */}
                                <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-2 opacity-80"></div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                        <button className="w-full text-center text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors py-1">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <img
                    src={
                      user?.profilePic
                        ? `${process.env.REACT_APP_API_BASE_URL.replace('/api','')}${user.profilePic}`
                        : `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=ffffff&bold=true`
                    }
                    alt="avatar"
                    className="dropdown-trigger relative w-11 h-11 rounded-full cursor-pointer object-cover border-2 border-gray-200 dark:border-slate-600/50 hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === 'profile' ? null : 'profile')
                    }
                  />
                </div>
                {dropdownOpen === 'profile' && (
                  <div className="dropdown-menu absolute right-0 mt-3 w-52 bg-white/95 dark:bg-slate-800/90 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-700/40 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                      <Link
                        to={`/profile/${user?.username}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800/70 transition-colors duration-200">
                          <span className="text-violet-600 dark:text-violet-400">👤</span>
                        </div>
                        <span className="font-medium">Profile</span>
                      </Link>

                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/70 transition-colors duration-200">
                          <span className="text-yellow-600 dark:text-yellow-400">
                            {theme === 'dark' ? '☀️' : '🌙'}
                          </span>
                        </div>
                        <span className="font-medium">
                          {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                        </span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/70 transition-colors duration-200">
                          <span className="text-red-600 dark:text-red-400">🚪</span>
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
