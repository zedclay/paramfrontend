import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Home from './pages/Home';
import About from './pages/About';
import Filieres from './pages/Filieres';
import Specialites from './pages/Specialites';
import Modules from './pages/Modules';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import DownloadDetail from './pages/DownloadDetail';
import RegulatoryTextDetail from './pages/RegulatoryTextDetail';
import Contact from './pages/Contact';
import Telechargement from './pages/Telechargement';
import TextesReglementaires from './pages/TextesReglementaires';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentSchedule from './pages/StudentSchedule';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PageTitle from './components/PageTitle';
import { AuthProvider } from './contexts/AuthContext';

// Configure axios base URL
// Priority: 1. Localhost detection (force localhost in dev), 2. Environment variable, 3. Auto-detect
let apiUrl;

// Check if we're in development mode (Vite sets this)
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const hostname = window.location.hostname;
const port = window.location.port;

// FORCE localhost for local development - this takes priority over everything
if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || port === '5173') {
  // Always use localhost:8000 for local development
  apiUrl = 'http://localhost:8000/api';
  console.log('🔵 Localhost detected - FORCING localhost API URL:', apiUrl);
} else if (import.meta.env.VITE_API_URL) {
  // Use explicit environment variable if set (only in production)
  apiUrl = import.meta.env.VITE_API_URL;
  console.log('🟢 Using VITE_API_URL from .env:', apiUrl);
} else if (isDev) {
  // Development mode but not localhost (e.g., network IP)
  apiUrl = `http://${hostname}:8000/api`;
  console.log('🟡 Dev mode detected, using:', apiUrl);
} else {
  // Production: detect based on current URL
  const host = window.location.protocol + '//' + window.location.host;
  apiUrl = host + '/api';
  console.log('🔴 Production mode, using:', apiUrl);
}

// Clean up the URL (remove any /public/index.php if accidentally included)
apiUrl = apiUrl.replace(/\/public\/index\.php\/api/g, '/api');
apiUrl = apiUrl.replace(/\/api\/api/g, '/api'); // Remove duplicate /api
apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash

// Final safety check: if we're on localhost but URL points to production, force localhost
if ((hostname === 'localhost' || hostname === '127.0.0.1') && apiUrl.includes('infspsb.com')) {
  console.warn('⚠️ WARNING: Detected production URL on localhost! Forcing localhost...');
  apiUrl = 'http://localhost:8000/api';
}

axios.defaults.baseURL = apiUrl;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Log API URL for debugging
console.log('=== API Configuration ===');
console.log('Hostname:', hostname);
console.log('Port:', port);
console.log('Is Dev:', isDev);
console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('Final API Base URL:', apiUrl);
console.log('========================');

function App() {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(i18n.language || 'fr');

  useEffect(() => {
    // Sync i18n with locale state
    const savedLocale = localStorage.getItem('i18nextLng') || 'fr';
    setLocale(savedLocale);
    i18n.changeLanguage(savedLocale);
    document.documentElement.setAttribute('dir', savedLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', savedLocale);
  }, [i18n]);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    i18n.changeLanguage(newLocale);
    localStorage.setItem('i18nextLng', newLocale);
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
  };

  return (
    <AuthProvider>
      <Router>
        <PageTitle />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout locale={locale} changeLocale={changeLocale}><Home /></Layout>} />
          <Route path="/about" element={<Layout locale={locale} changeLocale={changeLocale}><About /></Layout>} />
          <Route path="/filieres" element={<Layout locale={locale} changeLocale={changeLocale}><Filieres /></Layout>} />
          <Route path="/filieres/:id" element={<Layout locale={locale} changeLocale={changeLocale}><Filieres /></Layout>} />
          <Route path="/specialites" element={<Layout locale={locale} changeLocale={changeLocale}><Specialites /></Layout>} />
          <Route path="/modules" element={<Layout locale={locale} changeLocale={changeLocale}><Modules /></Layout>} />
          <Route path="/announcements" element={<Layout locale={locale} changeLocale={changeLocale}><Announcements /></Layout>} />
          <Route path="/announcements/:id" element={<Layout locale={locale} changeLocale={changeLocale}><AnnouncementDetail /></Layout>} />
          <Route path="/telechargement" element={<Layout locale={locale} changeLocale={changeLocale}><Telechargement /></Layout>} />
          <Route path="/telechargement/:id" element={<Layout locale={locale} changeLocale={changeLocale}><DownloadDetail /></Layout>} />
          <Route path="/textes-reglementaires" element={<Layout locale={locale} changeLocale={changeLocale}><TextesReglementaires /></Layout>} />
          <Route path="/textes-reglementaires/:id" element={<Layout locale={locale} changeLocale={changeLocale}><RegulatoryTextDetail /></Layout>} />
          <Route path="/contact" element={<Layout locale={locale} changeLocale={changeLocale}><Contact /></Layout>} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Student routes - Protected */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <Layout locale={locale} changeLocale={changeLocale}>
                  <StudentDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/schedule" 
            element={
              <ProtectedRoute requiredRole="student">
                <Layout locale={locale} changeLocale={changeLocale}>
                  <StudentSchedule />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes - Protected */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout locale={locale} changeLocale={changeLocale}>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
