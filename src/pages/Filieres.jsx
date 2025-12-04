import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaArrowRight, FaGraduationCap } from 'react-icons/fa';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';

const Filieres = () => {
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
        <h1 className="text-5xl font-bold mb-4 text-text-dark">Nos Filières</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez nos programmes de formation paramédicale
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
              <FaArrowRight className="mr-2 rotate-180" /> Retour aux filières
            </motion.button>
            
            {filiereLoading ? (
              <CardSkeleton />
            ) : (
              <motion.div
                className="bg-white rounded-lg shadow-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-bold mb-4 text-text-dark">{selectedFiliere.name?.fr}</h2>
                <p className="text-lg text-gray-700 mb-6">{selectedFiliere.description?.fr}</p>
                
                {selectedFiliere.specialities && selectedFiliere.specialities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-2xl font-semibold mb-4 text-text-dark">Spécialités</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedFiliere.specialities.map((speciality, index) => (
                        <AnimatedCard key={speciality.id} delay={index * 0.1}>
                          <motion.div
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                            whileHover={{ scale: 1.02, y: -5 }}
                          >
                            <h4 className="font-semibold text-lg text-primary mb-2">{speciality.name?.fr}</h4>
                            <p className="text-gray-600 text-sm">{speciality.description?.fr?.substring(0, 100)}...</p>
                            {speciality.duration && (
                              <p className="text-sm text-gray-500 mt-2">Durée: {speciality.duration}</p>
                            )}
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
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50"
                  onClick={() => handleFiliereClick(filiere.id)}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaGraduationCap className="text-3xl text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3 text-text-dark text-center">{filiere.name?.fr}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{filiere.description?.fr}</p>
                  <motion.button
                    className="text-primary hover:text-primary-dark flex items-center font-medium mx-auto"
                    whileHover={{ x: 5 }}
                  >
                    En savoir plus <FaArrowRight className="ml-2" />
                  </motion.button>
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
