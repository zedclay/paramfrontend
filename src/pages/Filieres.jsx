import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaArrowRight, FaGraduationCap } from 'react-icons/fa';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { getMultilingualValueFromI18n } from '../utils/multilingual';
import { getFiliereImage } from '../constants';

// Helper function to get full image URL with cache busting
const getImageUrl = (imageUrl, cacheBust = false) => {
  if (!imageUrl) return null;
  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (cacheBust) {
      return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    return imageUrl;
  }
  // If it starts with /storage, use it as-is (relative to current domain)
  if (imageUrl.startsWith('/storage')) {
    if (cacheBust) {
      return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    return imageUrl;
  }
  // If it doesn't start with /, it might be a relative path - keep it as is
  if (cacheBust) {
    return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
  return imageUrl;
};


const Filieres = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [filiereLoading, setFiliereLoading] = useState(false);

  useEffect(() => {
    fetchFilieres();
  }, []);

  useEffect(() => {
    if (id) {
      fetchFiliereDetails(id);
    } else {
      setSelectedFiliere(null);
    }
  }, [id]);

  const fetchFilieres = async () => {
    try {
      const response = await axios.get('/public/filieres', {
        params: { _t: Date.now() } // Cache busting
      });
      console.log('Filieres fetched:', response.data.data);
      // Log ALL image URLs for debugging (including null)
      response.data.data.forEach(f => {
        const name = getMultilingualValueFromI18n(f.name, i18n);
        if (f.image_url) {
          console.log(`✅ Filiere ${f.id} (${name}): image_url = ${f.image_url}`);
        } else {
          console.warn(`⚠️ Filiere ${f.id} (${name}): image_url = NULL (will use fallback: ${getFiliereImage(f.slug)})`);
        }
      });
      setFilieres(response.data.data);
    } catch (error) {
      console.error('Error fetching filieres:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiliereDetails = async (filiereId) => {
    setFiliereLoading(true);
    try {
      const response = await axios.get(`/public/filieres/${filiereId}`);
      setSelectedFiliere(response.data.data);
    } catch (error) {
      console.error('Error fetching filiere details:', error);
      // If filiere not found, redirect back to filieres list
      navigate('/filieres');
    } finally {
      setFiliereLoading(false);
    }
  };

  const handleFiliereClick = (filiereId) => {
    navigate(`/filieres/${filiereId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold mb-4 text-text-dark">{t('filieres.title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('filieres.subtitle')}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedFiliere ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <motion.button
              onClick={() => navigate('/filieres')}
              className="mb-6 text-primary hover:text-primary-dark flex items-center"
              whileHover={{ x: -5 }}
            >
              <FaArrowRight className="mr-2 rotate-180" /> {t('filieres.backToPrograms')}
            </motion.button>
            
            {filiereLoading ? (
              <CardSkeleton />
            ) : (
              <motion.div
                className="bg-white rounded-lg shadow-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Filière Header with Image */}
                <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={selectedFiliere.image_url ? getImageUrl(selectedFiliere.image_url, true) : getFiliereImage(selectedFiliere.slug)} 
                    alt={getMultilingualValueFromI18n(selectedFiliere.name, i18n)}
                    className="w-full h-full object-cover"
                    key={`${selectedFiliere.id}-${selectedFiliere.image_url || 'fallback'}-${selectedFiliere.slug}`}
                    onError={(e) => {
                      console.error('❌ Filière detail image failed to load:', {
                        filiere_id: selectedFiliere.id,
                        image_url: selectedFiliere.image_url || 'NULL',
                        fallback_used: !selectedFiliere.image_url,
                        attempted_url: e.target.src
                      });
                      // Try fallback if uploaded image fails
                      if (selectedFiliere.image_url && e.target.src !== getFiliereImage(selectedFiliere.slug)) {
                        e.target.onerror = null;
                        e.target.src = getFiliereImage(selectedFiliere.slug);
                      } else {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f0f0f0" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                      }
                    }}
                    onLoad={() => {
                      const imageSource = selectedFiliere.image_url ? 'uploaded' : 'fallback';
                      console.log(`✅ Detail image loaded successfully (${imageSource}):`, selectedFiliere.image_url || getFiliereImage(selectedFiliere.slug));
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">{getMultilingualValueFromI18n(selectedFiliere.name, i18n)}</h2>
                    <p className="text-white/90 text-lg">{getMultilingualValueFromI18n(selectedFiliere.description, i18n)?.substring(0, 150)}...</p>
                  </div>
                </div>
                
                {selectedFiliere.specialities && selectedFiliere.specialities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-2xl font-semibold mb-4 text-text-dark">{t('filieres.specialities')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedFiliere.specialities.map((speciality, index) => (
                        <AnimatedCard key={speciality.id} delay={index * 0.1}>
                          <motion.div
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-white"
                            whileHover={{ scale: 1.02, y: -5 }}
                          >
                            <div className="relative h-32 overflow-hidden">
                              <img 
                                src={selectedFiliere.image_url ? getImageUrl(selectedFiliere.image_url, true) : getFiliereImage(selectedFiliere.slug)} 
                                alt={getMultilingualValueFromI18n(speciality.name, i18n)}
                                className="w-full h-full object-cover"
                                key={`${selectedFiliere.id}-${selectedFiliere.image_url || 'fallback'}`}
                                onError={(e) => {
                                  // Try fallback
                                  if (selectedFiliere.image_url && e.target.src !== getFiliereImage(selectedFiliere.slug)) {
                                    e.target.onerror = null;
                                    e.target.src = getFiliereImage(selectedFiliere.slug);
                                  } else {
                                    e.target.style.display = 'none';
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-lg text-primary mb-2">{getMultilingualValueFromI18n(speciality.name, i18n)}</h4>
                              <p className="text-gray-600 text-sm">{getMultilingualValueFromI18n(speciality.description, i18n)?.substring(0, 100)}...</p>
                              {speciality.duration && (
                                <p className="text-sm text-gray-500 mt-2">{t('filieres.duration')}: {speciality.duration}</p>
                              )}
                            </div>
                          </motion.div>
                        </AnimatedCard>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filieres.map((filiere, index) => (
              <AnimatedCard key={filiere.id} delay={index * 0.1}>
                <motion.div
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleFiliereClick(filiere.id)}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                    {/* Always show image - use uploaded image_url if available, otherwise fallback to static image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={filiere.image_url ? getImageUrl(filiere.image_url, true) : getFiliereImage(filiere.slug)} 
                      alt={getMultilingualValueFromI18n(filiere.name, i18n)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      key={`${filiere.id}-${filiere.image_url || 'fallback'}-${filiere.slug}`}
                      onError={(e) => {
                        console.error('❌ Filière image failed to load:', {
                          filiere_id: filiere.id,
                          filiere_name: getMultilingualValueFromI18n(filiere.name, i18n),
                          image_url: filiere.image_url || 'NULL',
                          fallback_used: !filiere.image_url,
                          fallback_path: getFiliereImage(filiere.slug),
                          attempted_url: e.target.src
                        });
                        // Try fallback if uploaded image fails
                        if (filiere.image_url && e.target.src !== getFiliereImage(filiere.slug)) {
                          e.target.onerror = null;
                          e.target.src = getFiliereImage(filiere.slug);
                        } else {
                          // Show placeholder if both fail
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                        }
                      }}
                      onLoad={() => {
                        const imageSource = filiere.image_url ? 'uploaded' : 'fallback';
                        console.log(`✅ Image loaded successfully (${imageSource}):`, filiere.image_url || getFiliereImage(filiere.slug));
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{getMultilingualValueFromI18n(filiere.name, i18n)}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">{getMultilingualValueFromI18n(filiere.description, i18n)}</p>
                    <motion.button
                      className="text-primary hover:text-primary-dark flex items-center font-medium"
                      whileHover={{ x: 5 }}
                    >
                      {t('filieres.learnMore')} <FaArrowRight className="ml-2" />
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatedCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Filieres;
