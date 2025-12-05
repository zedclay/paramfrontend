import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBullhorn, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { CardSkeleton } from '../components/LoadingSkeleton';
import AnimatedCard from '../components/AnimatedCard';

const Announcements = () => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/public/announcements');
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
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
            <FaBullhorn className="text-primary text-5xl" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-text-dark">{t('nav.announcements')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('announcements.subtitle') || 'Restez informé des dernières nouvelles et annonces de l\'Institut Paramédical'}
        </p>
      </motion.div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement, index) => (
            <AnimatedCard key={announcement.id} delay={index * 0.1}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-lg mr-3">
                      <FaBullhorn className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-dark line-clamp-2">
                        {announcement.title?.fr || announcement.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-4">
                  <p className="text-gray-600 line-clamp-4">
                    {announcement.content?.fr || announcement.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t pt-4 mt-auto">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      <span>
                        {announcement.published_at
                          ? new Date(announcement.published_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : new Date(announcement.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                      </span>
                    </div>
                    {announcement.author && (
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        <span className="text-xs">{announcement.author.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <FaBullhorn className="text-gray-400 text-5xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">{t('announcements.noAnnouncements') || 'Aucune annonce pour le moment'}</h3>
          <p className="text-gray-500">
            {t('announcements.noAnnouncementsDesc') || 'Les annonces seront publiées ici lorsqu\'elles seront disponibles.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Announcements;

