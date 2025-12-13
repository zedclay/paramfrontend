import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaGlobe, FaBullhorn, FaChevronDown } from 'react-icons/fa';

const Layout = ({ children, locale, changeLocale }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academicDropdownOpen, setAcademicDropdownOpen] = useState(false);
  const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo.png" 
                alt="INFSPM Logo" 
                className="h-12 w-auto object-contain max-w-[120px]"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hidden">
                <span className="text-white font-bold text-xl">IP</span>
              </div>
              <span className="text-xl font-bold text-text-dark hidden md:block">
                {locale === 'ar' ? 'المعهد الوطني للتعليم العالي' : 'INFSPM SBA'}
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Home */}
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary transition-colors relative group"
                >
                  {t('nav.home')}
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                  />
                </Link>
              </motion.div>

              {/* About */}
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-primary transition-colors relative group"
                >
                  {t('nav.about')}
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                  />
                </Link>
              </motion.div>

              {/* Academic Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setAcademicDropdownOpen(true)}
                onMouseLeave={() => setAcademicDropdownOpen(false)}
              >
                <motion.div whileHover={{ y: -2 }}>
                  <button className="text-gray-700 hover:text-primary transition-colors relative group flex items-center">
                    {t('nav.academic')}
                    <FaChevronDown className={`ml-1 text-xs transition-transform ${academicDropdownOpen ? 'rotate-180' : ''}`} />
                    <motion.span
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                    />
                  </button>
                </motion.div>
                
                <AnimatePresence>
                  {academicDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/filieres"
                        className="block px-4 py-2 text-gray-700 hover:bg-primary hover:text-white transition-colors"
                      >
                        {t('nav.filieres')}
                      </Link>
                      <Link
                        to="/specialites"
                        className="block px-4 py-2 text-gray-700 hover:bg-primary hover:text-white transition-colors"
                      >
                        {t('nav.specialites')}
                      </Link>
                      <Link
                        to="/modules"
                        className="block px-4 py-2 text-gray-700 hover:bg-primary hover:text-white transition-colors"
                      >
                        {t('nav.modules')}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Announcements */}
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/announcements"
                  className="text-gray-700 hover:text-primary transition-colors relative group"
                >
                  {t('nav.announcements')}
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                  />
                </Link>
              </motion.div>

              {/* Contact */}
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-primary transition-colors relative group"
                >
                  {t('nav.contact')}
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                  />
                </Link>
              </motion.div>

              {/* Language Switcher - FR First with Dropdown */}
              <div
                className="relative border-l pl-4"
                onMouseEnter={() => setLanguageDropdownOpen(true)}
                onMouseLeave={() => setLanguageDropdownOpen(false)}
              >
                <button className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                  <FaGlobe className="text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {i18n.language === 'fr' ? 'FR' : i18n.language === 'en' ? 'EN' : 'AR'}
                  </span>
                  <FaChevronDown className={`text-xs text-gray-500 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {languageDropdownOpen && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => {
                          changeLocale('fr');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors ${i18n.language === 'fr' ? 'bg-primary text-white font-semibold' : 'text-gray-700'}`}
                      >
                        Français (FR)
                      </button>
                      <button
                        onClick={() => {
                          changeLocale('en');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors ${i18n.language === 'en' ? 'bg-primary text-white font-semibold' : 'text-gray-700'}`}
                      >
                        English (EN)
                      </button>
                      <button
                        onClick={() => {
                          changeLocale('ar');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors ${i18n.language === 'ar' ? 'bg-primary text-white font-semibold' : 'text-gray-700'}`}
                      >
                        العربية (AR)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 border-l pl-4">
                  <Link
                    to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                    className="text-primary hover:text-primary-dark"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Language Switcher for Mobile (Visible when menu closed) */}
              {!mobileMenuOpen && (
                <div className="relative">
                  <button
                    onClick={() => setMobileLanguageOpen(!mobileLanguageOpen)}
                    className="flex items-center space-x-1 px-2 py-1 text-gray-700"
                  >
                    <FaGlobe className="text-gray-600" />
                    <span className="text-sm font-medium">
                      {i18n.language === 'fr' ? 'FR' : i18n.language === 'en' ? 'EN' : 'AR'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {mobileLanguageOpen && (
                      <motion.div
                        className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg py-2 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => {
                            changeLocale('fr');
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors ${i18n.language === 'fr' ? 'bg-primary text-white font-semibold' : 'text-gray-700'}`}
                        >
                          FR
                        </button>
                        <button
                          onClick={() => {
                            changeLocale('en');
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors ${i18n.language === 'en' ? 'bg-primary text-white font-semibold' : 'text-gray-700'}`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => {
                            changeLocale('ar');
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors ${i18n.language === 'ar' ? 'bg-primary text-white font-semibold' : 'text-gray-700'}`}
                        >
                          AR
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <button
                className="text-gray-700 hover:text-primary transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4 max-h-[calc(100vh-120px)] overflow-y-auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Home */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0 * 0.05 }}
                >
                  <Link 
                    to="/" 
                    className="block py-2 text-gray-700 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.home')}
                  </Link>
                </motion.div>

                {/* About */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 * 0.05 }}
                >
                  <Link 
                    to="/about" 
                    className="block py-2 text-gray-700 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.about')}
                  </Link>
                </motion.div>

                {/* Academic Dropdown (Mobile) */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2 * 0.05 }}
                >
                  <button
                    onClick={() => setMobileAcademicOpen(!mobileAcademicOpen)}
                    className="w-full flex items-center justify-between py-2 text-gray-700 hover:text-primary transition"
                  >
                    <span>{t('nav.academic')}</span>
                    <FaChevronDown className={`text-xs transition-transform ${mobileAcademicOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAcademicOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 space-y-1"
                      >
                        <Link 
                          to="/filieres" 
                          className="block py-2 text-gray-600 hover:text-primary transition"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileAcademicOpen(false);
                          }}
                        >
                          {t('nav.filieres')}
                        </Link>
                        <Link 
                          to="/specialites" 
                          className="block py-2 text-gray-600 hover:text-primary transition"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileAcademicOpen(false);
                          }}
                        >
                          {t('nav.specialites')}
                        </Link>
                        <Link 
                          to="/modules" 
                          className="block py-2 text-gray-600 hover:text-primary transition"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileAcademicOpen(false);
                          }}
                        >
                          {t('nav.modules')}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Announcements */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 3 * 0.05 }}
                >
                  <Link 
                    to="/announcements" 
                    className="block py-2 text-gray-700 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.announcements')}
                  </Link>
                </motion.div>

                {/* Contact */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 4 * 0.05 }}
                >
                  <Link 
                    to="/contact" 
                    className="block py-2 text-gray-700 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.contact')}
                  </Link>
                </motion.div>

                {/* Language Switcher (Mobile) */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 5 * 0.05 }}
                  className="border-t pt-2 mt-2"
                >
                  <button
                    onClick={() => setMobileLanguageOpen(!mobileLanguageOpen)}
                    className="w-full flex items-center justify-between py-2 text-gray-700 hover:text-primary transition"
                  >
                    <span className="flex items-center space-x-2">
                      <FaGlobe className="text-gray-600" />
                      <span>{i18n.language === 'fr' ? 'FR' : i18n.language === 'en' ? 'EN' : 'AR'}</span>
                    </span>
                    <FaChevronDown className={`text-xs transition-transform ${mobileLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileLanguageOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 space-y-1"
                      >
                        <button
                          onClick={() => {
                            changeLocale('fr');
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full text-left block py-2 text-sm ${i18n.language === 'fr' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'} transition`}
                        >
                          Français (FR)
                        </button>
                        <button
                          onClick={() => {
                            changeLocale('en');
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full text-left block py-2 text-sm ${i18n.language === 'en' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'} transition`}
                        >
                          English (EN)
                        </button>
                        <button
                          onClick={() => {
                            changeLocale('ar');
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full text-left block py-2 text-sm ${i18n.language === 'ar' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'} transition`}
                        >
                          العربية (AR)
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

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
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <button onClick={handleLogout} className="block py-2 text-red-500">
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link 
                      to="/login" 
                      className="block py-2 text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
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
                <li><Link to="/about" className="text-gray-300 hover:text-white">{t('nav.about')}</Link></li>
                <li><Link to="/filieres" className="text-gray-300 hover:text-white">{t('nav.filieres')}</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">{t('nav.contact')}</Link></li>
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

