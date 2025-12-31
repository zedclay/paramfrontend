import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaGavel, FaCalendarAlt, FaUser, FaArrowLeft, FaImage, FaFile, FaDownload } from 'react-icons/fa';
import { CardSkeleton } from '../components/LoadingSkeleton';

const RegulatoryTextDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [regulatoryText, setRegulatoryText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegulatoryText();
  }, [id, i18n.language]);

  const fetchRegulatoryText = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/public/regulatory-texts/${id}`);
      setRegulatoryText(response.data.data);
    } catch (error) {
      console.error('Error fetching regulatory text:', error);
      setError(error.response?.data?.error?.message || 'Texte réglementaire non trouvé');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !regulatoryText) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-text-dark">Texte réglementaire non trouvé</h1>
          <p className="text-gray-600 mb-8">{error || 'Ce texte réglementaire n\'existe pas ou n\'est plus disponible.'}</p>
          <Link
            to="/textes-reglementaires"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux texte réglementaires
          </Link>
        </div>
      </div>
    );
  }

  const locale = i18n.language || 'fr';
  const title = regulatoryText.title?.[locale] || regulatoryText.title?.fr || regulatoryText.title;
  const content = regulatoryText.content?.[locale] || regulatoryText.content?.fr || regulatoryText.content;

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link
            to="/textes-reglementaires"
          className="inline-flex items-center text-primary hover:text-primary-dark transition"
        >
          <FaArrowLeft className="mr-2" />
          Retour aux texte réglementaires
        </Link>
      </motion.div>

      {/* RegulatoryText Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {/* Principal Image if exists */}
        {regulatoryText.image_path && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={regulatoryText.image_url || `/storage/${regulatoryText.image_path}`}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FaGavel className="text-primary text-2xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text-dark mb-2">{title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      <span>
                        {regulatoryText.published_at
                          ? new Date(regulatoryText.published_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : new Date(regulatoryText.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                      </span>
                    </div>
                    {regulatoryText.author && (
                      <div className="flex items-center">
                        <FaUser className="mr-2" />
                        <span>{regulatoryText.author.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Files */}
          {(regulatoryText.image_path || regulatoryText.file_path) && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {regulatoryText.image_path && (
                <a
                  href={regulatoryText.image_url || `/storage/${regulatoryText.image_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                  <FaImage className="text-xl" />
                  <span>{regulatoryText.image_filename || 'Image'}</span>
                </a>
              )}
              {regulatoryText.file_path && (
                <a
                  href={regulatoryText.file_url || `/storage/${regulatoryText.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 transition"
                >
                  <FaFile className="text-xl" />
                  <span>{regulatoryText.file_filename || 'PDF'}</span>
                  <FaDownload className="text-sm" />
                </a>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>

          {/* Multiple Images Gallery */}
          {regulatoryText.images && regulatoryText.images.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-2xl font-bold mb-4 text-text-dark">Galerie d'images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regulatoryText.images.map((img) => (
                  <div key={img.id} className="relative group">
                    <a
                      href={img.image_url || `/storage/${img.image_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={img.image_url || `/storage/${img.image_path}`}
                        alt={img.image_filename || 'Image'}
                        className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {regulatoryText.target_audience && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {regulatoryText.target_audience === 'all'
                    ? 'Public : Tous'
                    : regulatoryText.target_audience === 'students'
                    ? 'Public : Étudiants'
                    : 'Public : Spécialité spécifique'}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegulatoryTextDetail;
