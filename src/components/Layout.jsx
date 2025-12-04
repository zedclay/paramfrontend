import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaGlobe, FaBullhorn } from 'react-icons/fa';

const Layout = ({ children, locale, changeLocale }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const translations = {
    fr: {
      home: 'Accueil',
      about: 'À propos',
      filieres: 'Filières',
      specialites: 'Spécialités',
      modules: 'Modules',
      announcements: 'Annonces',
      contact: 'Contact',
      login: 'Connexion',
      dashboard: 'Tableau de bord',
      logout: 'Déconnexion',
    },
    ar: {
      home: 'الرئيسية',
      about: 'من نحن',
      filieres: 'الشعب',
      specialites: 'التخصصات',
      modules: 'الوحدات',
      announcements: 'الإعلانات',
      contact: 'اتصل بنا',
      login: 'تسجيل الدخول',
      dashboard: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
    },
  };

  const t = translations[locale] || translations.fr;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-md sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-xl font-bold text-text-dark">
                {locale === 'ar' ? 'المعهد الوطني للتعليم العالي' : 'INFSPM SBA'}
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {[
                { to: '/', label: t.home },
                { to: '/about', label: t.about },
                { to: '/filieres', label: t.filieres },
                { to: '/specialites', label: t.specialites },
                { to: '/modules', label: t.modules },
                { to: '/announcements', label: t.announcements, icon: FaBullhorn },
                { to: '/contact', label: t.contact },
              ].map((item) => (
                <motion.div key={item.to} whileHover={{ y: -2 }}>
                  <Link
                    to={item.to}
                    className="text-gray-700 hover:text-primary transition-colors relative group"
                  >
                    {item.label}
                    <motion.span
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                    />
                  </Link>
                </motion.div>
              ))}

              {/* Language Switcher */}
              <div className="flex items-center space-x-2 border-l pl-4">
                <FaGlobe className="text-gray-600" />
                <button
                  onClick={() => changeLocale('fr')}
                  className={`px-2 py-1 rounded ${locale === 'fr' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                  FR
                </button>
                <button
                  onClick={() => changeLocale('ar')}
                  className={`px-2 py-1 rounded ${locale === 'ar' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                  AR
                </button>
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 border-l pl-4">
                  <Link
                    to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                    className="text-primary hover:text-primary-dark"
                  >
                    {t.dashboard}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                >
                  {t.login}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="md:hidden mt-4 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {[
                  { to: '/', label: t.home },
                  { to: '/about', label: t.about },
                  { to: '/filieres', label: t.filieres },
                  { to: '/specialites', label: t.specialites },
                  { to: '/modules', label: t.modules },
                  { to: '/announcements', label: t.announcements },
                  { to: '/contact', label: t.contact },
                ].map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={item.to} className="block py-2 text-gray-700 hover:text-primary transition">
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                {isAuthenticated ? (
                  <>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link
                        to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                        className="block py-2 text-primary"
                      >
                        {t.dashboard}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <button onClick={handleLogout} className="block py-2 text-red-500">
                        {t.logout}
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link to="/login" className="block py-2 text-primary">{t.login}</Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-text-dark text-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">
                {locale === 'ar' ? 'المعهد الوطني للتعليم العالي' : 'INFSPM Sidi Bel Abbès'}
              </h3>
              <p className="text-gray-300">
                {locale === 'ar'
                  ? 'معهد متخصص في التعليم العالي الطبي المساعد'
                  : 'Institut spécialisé dans la formation supérieure paramédicale'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                {locale === 'ar' ? 'روابط سريعة' : 'Liens rapides'}
              </h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white">{t.about}</Link></li>
                <li><Link to="/filieres" className="text-gray-300 hover:text-white">{t.filieres}</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">{t.contact}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                {locale === 'ar' ? 'اتصل بنا' : 'Contact'}
              </h4>
              <p className="text-gray-300">Sidi Bel Abbès, Algeria</p>
              <p className="text-gray-300">contact@institut-paramedical-sba.dz</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} INFSPM Sidi Bel Abbès. {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

