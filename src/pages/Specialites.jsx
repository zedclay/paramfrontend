import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaClock, FaBuilding } from 'react-icons/fa';
import { IMAGE_PATHS, getFiliereImage, getSpecialiteImage } from '../constants';

const Specialites = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const filiereId = searchParams.get('filiere_id');
  const [specialites, setSpecialites] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialite, setSelectedSpecialite] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filiereId]);

  const fetchData = async () => {
    try {
      const [specialitesRes, filieresRes] = await Promise.all([
        axios.get(`/public/specialites${filiereId ? `?filiere_id=${filiereId}` : ''}`),
        axios.get('/public/filieres'),
      ]);
      setSpecialites(specialitesRes.data.data);
      setFilieres(filieresRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialiteClick = async (id) => {
    try {
      const response = await axios.get(`/public/specialites/${id}`);
      setSelectedSpecialite(response.data.data);
    } catch (error) {
      console.error('Error fetching specialite details:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">{t('common.loading')}</div>;
  }

  if (selectedSpecialite) {
    return (
      <div className="container mx-auto px-4 py-16">
        <button
          onClick={() => setSelectedSpecialite(null)}
          className="mb-6 text-primary hover:text-primary-dark"
        >
          ← {t('specialites.back') || 'Retour aux spécialités'}
        </button>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
          {/* Speciality Header with Image */}
          <div className="relative h-64 overflow-hidden">
            <img 
              src={getSpecialiteImage(selectedSpecialite)} 
              alt={selectedSpecialite.name?.fr}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = IMAGE_PATHS.SPECIALITES.DEFAULT;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">{selectedSpecialite.name?.fr}</h1>
              <p className="text-white/90 text-lg">{selectedSpecialite.description?.fr?.substring(0, 150)}...</p>
            </div>
          </div>
          <div className="p-8">
            <p className="text-lg text-gray-700 mb-6">{selectedSpecialite.description?.fr}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {selectedSpecialite.duration && (
              <div className="flex items-center">
                <FaClock className="text-primary mr-3" />
                <span className="text-gray-700"><strong>Durée:</strong> {selectedSpecialite.duration}</span>
              </div>
            )}
            {selectedSpecialite.filiere && (
              <div className="flex items-center">
                <FaBook className="text-primary mr-3" />
                <span className="text-gray-700"><strong>Filière:</strong> {selectedSpecialite.filiere.name?.fr}</span>
              </div>
            )}
          </div>

          {selectedSpecialite.establishments && selectedSpecialite.establishments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-text-dark">Établissements</h3>
              <div className="space-y-4">
                {selectedSpecialite.establishments.map((establishment) => (
                  <div key={establishment.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-primary mb-2">{establishment.name?.fr}</h4>
                    {establishment.address && <p className="text-gray-600">{establishment.address}</p>}
                    {establishment.contact_email && <p className="text-gray-600">Email: {establishment.contact_email}</p>}
                    {establishment.contact_phone && <p className="text-gray-600">Téléphone: {establishment.contact_phone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSpecialite.modules && selectedSpecialite.modules.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-text-dark">Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSpecialite.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-primary">{module.code}</h4>
                      {module.credits && <span className="text-sm text-gray-500">{module.credits} crédits</span>}
                    </div>
                    <p className="text-gray-700 font-medium">{module.title?.fr}</p>
                    {module.description && (
                      <p className="text-gray-600 text-sm mt-2">{module.description.fr?.substring(0, 100)}...</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-text-dark">{t('nav.specialites')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('specialites.subtitle') || 'Explorez nos spécialisations paramédicales'}
        </p>
      </div>

      {/* Filter by Filiere */}
      {filieres.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => window.location.href = '/specialites'}
            className={`px-4 py-2 rounded-lg ${!filiereId ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Toutes
          </button>
          {filieres.map((filiere) => (
            <button
              key={filiere.id}
              onClick={() => window.location.href = `/specialites?filiere_id=${filiere.id}`}
              className={`px-4 py-2 rounded-lg ${filiereId == filiere.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {filiere.name?.fr}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialites.map((specialite) => (
          <div
            key={specialite.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer group"
            onClick={() => handleSpecialiteClick(specialite.id)}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={getSpecialiteImage(specialite)} 
                alt={specialite.name?.fr}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = IMAGE_PATHS.SPECIALITES.DEFAULT;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{specialite.name?.fr}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 line-clamp-3">{specialite.description?.fr}</p>
              <div className="flex items-center justify-between">
                {specialite.duration && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <FaClock className="mr-1" /> {specialite.duration}
                  </span>
                )}
                <span className="text-primary font-medium">En savoir plus →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Specialites;
