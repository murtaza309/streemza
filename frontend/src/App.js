import React from 'react';  
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile'; // ✅ added
import { Toaster } from 'react-hot-toast';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/upload" element={<Layout><Upload /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/video/:id" element={<Layout><VideoPlayer /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/profile/:id" element={<Layout><Profile /></Layout>} /> {/* ✅ added */}
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
