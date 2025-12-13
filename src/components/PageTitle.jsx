import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * PageTitle Component
 * Updates the browser tab title based on the current route
 */
const PageTitle = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const baseTitle = 'INFSPM Sidi Bel Abbès';
    let pageTitle = baseTitle;

    // Map routes to page titles
    const titleMap = {
      '/': t('nav.home') ? `${t('nav.home')} - ${baseTitle}` : baseTitle,
      '/about': t('nav.about') ? `${t('nav.about')} - ${baseTitle}` : `À propos - ${baseTitle}`,
      '/filieres': t('nav.filieres') ? `${t('nav.filieres')} - ${baseTitle}` : `Filières - ${baseTitle}`,
      '/specialites': t('nav.specialites') ? `${t('nav.specialites')} - ${baseTitle}` : `Spécialités - ${baseTitle}`,
      '/modules': t('nav.modules') ? `${t('nav.modules')} - ${baseTitle}` : `Modules - ${baseTitle}`,
      '/announcements': t('nav.announcements') ? `${t('nav.announcements')} - ${baseTitle}` : `Annonces - ${baseTitle}`,
      '/contact': t('nav.contact') ? `${t('nav.contact')} - ${baseTitle}` : `Contact - ${baseTitle}`,
      '/login': t('auth.login') ? `${t('auth.login')} - ${baseTitle}` : `Connexion - ${baseTitle}`,
      '/admin/dashboard': t('nav.dashboard') ? `${t('nav.dashboard')} Admin - ${baseTitle}` : `Tableau de bord Admin - ${baseTitle}`,
      '/student/dashboard': t('nav.dashboard') ? `${t('nav.dashboard')} Étudiant - ${baseTitle}` : `Tableau de bord Étudiant - ${baseTitle}`,
      '/student/schedule': 'Emploi du temps - ' + baseTitle,
    };

    // Find matching route
    const currentPath = location.pathname;
    pageTitle = titleMap[currentPath] || baseTitle;

    // Handle dynamic routes (e.g., /filieres/:id)
    if (currentPath.startsWith('/filieres/') && currentPath !== '/filieres') {
      pageTitle = `${t('nav.filieres') || 'Filière'} - ${baseTitle}`;
    }

    document.title = pageTitle;
  }, [location.pathname, t, i18n.language]);

  return null; // This component doesn't render anything
};

export default PageTitle;
