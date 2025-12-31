/**
 * Standardized API error handling utility
 */

import logger from './logger';

/**
 * Extract error message from API error response
 * @param {Error} error - The error object from axios
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'Une erreur inconnue est survenue';
  }

  // Network error
  if (!error.response) {
    logger.error('Network error:', error.message);
    return 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
  }

  // API error response
  const { status, data } = error.response;

  // Extract error message from Laravel error format
  if (data?.error?.message) {
    return data.error.message;
  }

  if (data?.error?.details && typeof data.error.details === 'object') {
    // Return first validation error
    const firstError = Object.values(data.error.details)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }

  if (data?.message) {
    return data.message;
  }

  // Default messages based on status code
  const statusMessages = {
    400: 'Requête invalide',
    401: 'Non autorisé. Veuillez vous reconnecter.',
    403: 'Accès refusé',
    404: 'Ressource introuvable',
    422: 'Données invalides',
    429: 'Trop de requêtes. Veuillez patienter.',
    500: 'Erreur serveur. Veuillez réessayer plus tard.',
    503: 'Service indisponible',
  };

  return statusMessages[status] || `Erreur ${status}`;
};

/**
 * Handle API error and return standardized error object
 * @param {Error} error - The error object from axios
 * @returns {{message: string, code: string|null, status: number|null}}
 */
export const handleApiError = (error) => {
  const message = getErrorMessage(error);
  const code = error?.response?.data?.error?.code || null;
  const status = error?.response?.status || null;

  logger.error('API Error:', { message, code, status, error });

  return { message, code, status };
};

export default handleApiError;
