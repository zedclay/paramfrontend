// Application Constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PUBLIC: {
    FILIERES: '/public/filieres',
    SPECIALITES: '/public/specialites',
    MODULES: '/public/modules',
    ANNOUNCEMENTS: '/public/announcements',
    CONTACT: '/public/contact',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    FILIERES: '/admin/filieres',
    SPECIALITES: '/admin/specialites',
    MODULES: '/admin/modules',
    STUDENTS: '/admin/students',
    ANNOUNCEMENTS: '/admin/announcements',
    PLANNINGS: '/admin/plannings',
    YEARS: '/admin/years',
    SEMESTERS: '/admin/semesters',
    GROUPS: '/admin/groups',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    SCHEDULE: '/student/schedule',
    NOTES: '/student/notes',
    PROFILE: '/student/profile',
  },
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  FILIERES: '/filieres',
  SPECIALITES: '/specialites',
  MODULES: '/modules',
  ANNOUNCEMENTS: '/announcements',
  CONTACT: '/contact',
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_SCHEDULE: '/student/schedule',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
};

export const IMAGE_PATHS = {
  LOGO: '/images/logo.png',
  HERO: {
    SLIDE1: '/images/hero/hero-1.jpg',
    SLIDE2: '/images/hero/hero-2.jpg',
    SLIDE3: '/images/hero/hero-3.jpg',
  },
  ABOUT: {
    BUILDING: '/images/about/institute-building.jpg',
    STUDENTS: '/images/about/students-studying.jpg',
    LABORATORY: '/images/about/laboratory.jpg',
    GRADUATION: '/images/about/graduation.jpg',
  },
  FILIERES: {
    // Legacy paths (kept for backward compatibility)
    NURSING: '/images/filières/nursing.jpg',
    EQUIPMENT: '/images/filières/medical-equipment.jpg',
    TEAM: '/images/filières/healthcare-team.jpg',
    // Specific filière images by slug
    'soins-infirmiers': '/images/filieres/soins-infirmiers.jpg',
    'techniques-laboratoire': '/images/filieres/techniques-laboratoire.jpg',
    'kinesitherapie': '/images/filieres/kinesitherapie.jpg',
    'radiologie-medicale': '/images/filieres/radiologie-medicale.jpg',
    'radiologie-imagerie-medicale': '/images/filieres/radiologie-imagerie-medicale.jpg',
    'ergotherapie': '/images/filieres/ergotherapie.jpg',
    'assistance-medicale': '/images/filieres/assistance-medicale.jpg',
    'assistance-sociale': '/images/filieres/assistance-sociale.jpg',
    'psychomotricite': '/images/filieres/psychomotricite.jpg',
    'sage-femme': '/images/filieres/sage-femme.jpg',
  },
  SPECIALITES: {
    // Default image
    DEFAULT: '/images/filieres/soins-infirmiers.jpg',
  },
  CONTACT: {
    LOCATION: '/images/contact/location.jpg',
  },
};

/**
 * Get image path for a filière by its slug or ID
 * @param {string|number} identifier - Filière slug or ID
 * @returns {string} Image path
 */
export const getFiliereImage = (identifier) => {
  if (!identifier) return IMAGE_PATHS.FILIERES.NURSING;
  
  // If it's a slug (string)
  if (typeof identifier === 'string') {
    // Try exact match first
    if (IMAGE_PATHS.FILIERES[identifier]) {
      return IMAGE_PATHS.FILIERES[identifier];
    }
    // Try partial match (slug contains the key)
    const slugLower = identifier.toLowerCase();
    for (const [key, path] of Object.entries(IMAGE_PATHS.FILIERES)) {
      if (key !== 'NURSING' && key !== 'EQUIPMENT' && key !== 'TEAM' && slugLower.includes(key.toLowerCase())) {
        return path;
      }
    }
    return IMAGE_PATHS.FILIERES.NURSING;
  }
  
  // If it's an ID (number), map to slug
  const idToSlug = {
    1: 'soins-infirmiers',
    2: 'techniques-laboratoire',
    3: 'kinesitherapie',
    4: 'radiologie-medicale',
    5: 'radiologie-imagerie-medicale',
    6: 'ergotherapie',
    7: 'assistance-medicale',
    8: 'assistance-sociale',
    9: 'psychomotricite',
    10: 'sage-femme',
  };
  
  const slug = idToSlug[identifier];
  return slug ? IMAGE_PATHS.FILIERES[slug] : IMAGE_PATHS.FILIERES.NURSING;
};

/**
 * Get image path for a speciality
 * @param {object} speciality - Speciality object with slug or filiere
 * @returns {string} Image path
 */
export const getSpecialiteImage = (speciality) => {
  if (!speciality) return IMAGE_PATHS.SPECIALITES.DEFAULT;
  
  // Use filière image if available
  if (speciality.filiere?.slug) {
    return getFiliereImage(speciality.filiere.slug);
  }
  
  // Use speciality slug if available
  if (speciality.slug) {
    return IMAGE_PATHS.SPECIALITES[speciality.slug] || IMAGE_PATHS.SPECIALITES.DEFAULT;
  }
  
  return IMAGE_PATHS.SPECIALITES.DEFAULT;
};

export const STATISTICS = {
  DEFAULT_STUDENTS: '500+',
  DEFAULT_MODULES: '50+',
  DEFAULT_YEARS: '15+',
};

export const DATE_FORMATS = {
  FR: 'fr-FR',
  EN: 'en-US',
  AR: 'ar-DZ',
};

