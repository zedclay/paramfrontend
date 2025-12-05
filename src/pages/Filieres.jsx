import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaArrowRight, FaGraduationCap } from 'react-icons/fa';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { IMAGE_PATHS, getFiliereImage } from '../constants';

const Filieres = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [filiereLoading, setFiliereLoading] = useState(false);

  // Get image for filiere card - uses specific image for each filière

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
      const response = await axios.get('/public/filieres');
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
                    src={getFiliereImage(selectedFiliere.slug || selectedFiliere.id)} 
                    alt={selectedFiliere.name?.fr}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = IMAGE_PATHS.FILIERES.NURSING;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">{selectedFiliere.name?.fr}</h2>
                    <p className="text-white/90 text-lg">{selectedFiliere.description?.fr?.substring(0, 150)}...</p>
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
                                src={getFiliereImage(selectedFiliere.slug || selectedFiliere.id)} 
                                alt={speciality.name?.fr}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = IMAGE_PATHS.FILIERES.NURSING;
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-lg text-primary mb-2">{speciality.name?.fr}</h4>
                              <p className="text-gray-600 text-sm">{speciality.description?.fr?.substring(0, 100)}...</p>
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
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getFiliereImage(filiere.slug || filiere.id)} 
                      alt={filiere.name?.fr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Filière image failed to load:', filiere.slug || filiere.id);
                        e.target.src = IMAGE_PATHS.FILIERES.NURSING; // Fallback
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{filiere.name?.fr}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">{filiere.description?.fr}</p>
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
