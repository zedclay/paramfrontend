import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaDownload, FaCalendarAlt, FaUser, FaImage, FaFile } from 'react-icons/fa';
import { CardSkeleton } from '../components/LoadingSkeleton';
import AnimatedCard from '../components/AnimatedCard';

const Telechargement = () => {
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await axios.get('/public/downloads');
      setDownloads(response.data.data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <FaDownload className="text-primary text-5xl" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-text-dark">Téléchargement</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Documents et fichiers à télécharger
        </p>
      </motion.div>

      {/* Downloads List */}
      {downloads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((download, index) => (
            <Link key={download.id} to={`/telechargement/${download.id}`}>
              <AnimatedCard delay={index * 0.1}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full flex flex-col cursor-pointer">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <div className="bg-primary/10 p-2 rounded-lg mr-3">
                        <FaDownload className="text-primary text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-dark line-clamp-2">
                          {download.title?.fr || download.title}
                        </h3>
                        {/* Show image thumbnail if exists */}
                        {download.image_path && (
                          <div className="mt-2 w-full h-32 overflow-hidden rounded">
                            <img
                              src={download.image_url || `/storage/${download.image_path}`}
                              alt={download.title?.fr || download.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 mb-4">
                    <p className="text-gray-600 line-clamp-4">
                      {download.content?.fr || download.content || ''}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-4 mt-auto">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        <span>
                          {download.published_at
                            ? new Date(download.published_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : new Date(download.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                        </span>
                      </div>
                      {download.author && (
                        <div className="flex items-center">
                          <FaUser className="mr-1" />
                          <span className="text-xs">{download.author.name}</span>
                        </div>
                      )}
                    </div>
                    {/* Show file indicators */}
                    {(download.image_path || download.file_path) && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        {download.image_path && <FaImage />}
                        {download.file_path && <FaFile />}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </Link>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <FaDownload className="text-gray-400 text-5xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Aucun téléchargement pour le moment</h3>
          <p className="text-gray-500">
            Les fichiers seront publiés ici lorsqu'ils seront disponibles.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Telechargement;
