import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import About from './pages/About';
import Filieres from './pages/Filieres';
import Specialites from './pages/Specialites';
import Modules from './pages/Modules';
import Announcements from './pages/Announcements';
import Contact from './pages/Contact';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

function App() {
  const [locale, setLocale] = useState('fr');

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocale(savedLocale);
      document.documentElement.setAttribute('dir', savedLocale === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', savedLocale);
    }
  }, []);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout locale={locale} changeLocale={changeLocale}><Home /></Layout>} />
          <Route path="/about" element={<Layout locale={locale} changeLocale={changeLocale}><About /></Layout>} />
          <Route path="/filieres" element={<Layout locale={locale} changeLocale={changeLocale}><Filieres /></Layout>} />
          <Route path="/filieres/:id" element={<Layout locale={locale} changeLocale={changeLocale}><Filieres /></Layout>} />
          <Route path="/specialites" element={<Layout locale={locale} changeLocale={changeLocale}><Specialites /></Layout>} />
          <Route path="/modules" element={<Layout locale={locale} changeLocale={changeLocale}><Modules /></Layout>} />
          <Route path="/announcements" element={<Layout locale={locale} changeLocale={changeLocale}><Announcements /></Layout>} />
          <Route path="/contact" element={<Layout locale={locale} changeLocale={changeLocale}><Contact /></Layout>} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Student routes */}
          <Route path="/student/dashboard" element={<Layout locale={locale} changeLocale={changeLocale}><StudentDashboard /></Layout>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<Layout locale={locale} changeLocale={changeLocale}><AdminDashboard /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
