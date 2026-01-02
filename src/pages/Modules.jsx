import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaGraduationCap, FaClock } from 'react-icons/fa';
import { getMultilingualValueFromI18n } from '../utils/multilingual';

const Modules = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const specialiteId = searchParams.get('specialite_id');
  const [modules, setModules] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetchData();
  }, [specialiteId]);

  const fetchData = async () => {
    try {
      const [modulesRes, specialitesRes] = await Promise.all([
        axios.get(`/public/modules${specialiteId ? `?specialite_id=${specialiteId}` : ''}`),
        axios.get('/public/specialites'),
      ]);
      setModules(modulesRes.data.data);
      setSpecialites(specialitesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = async (id) => {
    try {
      const response = await axios.get(`/public/modules/${id}`);
      setSelectedModule(response.data.data);
    } catch (error) {
      console.error('Error fetching module details:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">{t('common.loading')}</div>;
  }

  if (selectedModule) {
    return (
      <div className="container mx-auto px-4 py-16">
        <button
          onClick={() => setSelectedModule(null)}
          className="mb-6 text-primary hover:text-primary-dark"
        >
          ← {t('modules.back') || 'Retour aux modules'}
        </button>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-primary font-semibold text-lg">{selectedModule.code}</span>
              <h1 className="text-4xl font-bold mt-2 text-text-dark">{getMultilingualValueFromI18n(selectedModule.title, i18n)}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {selectedModule.credits && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Crédits</div>
                <div className="text-2xl font-bold text-primary">{selectedModule.credits}</div>
              </div>
            )}
            {selectedModule.hours && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Heures</div>
                <div className="text-2xl font-bold text-primary">{selectedModule.hours}</div>
              </div>
            )}
            {selectedModule.speciality && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Spécialité</div>
                <div className="text-lg font-semibold text-text-dark">{getMultilingualValueFromI18n(selectedModule.speciality.name, i18n)}</div>
              </div>
            )}
          </div>

          {selectedModule.description && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-text-dark">Description</h3>
              <p className="text-gray-700 leading-relaxed">{getMultilingualValueFromI18n(selectedModule.description, i18n)}</p>
            </div>
          )}

          {selectedModule.speciality?.filiere && (
            <div className="border-t pt-6">
              <p className="text-gray-600">
                <strong>Filière:</strong> {getMultilingualValueFromI18n(selectedModule.speciality.filiere.name, i18n)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-text-dark">{t('nav.modules')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('modules.subtitle') || 'Découvrez nos modules de formation'}
        </p>
      </div>

      {/* Filter by Specialite */}
      {specialites.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => window.location.href = '/modules'}
            className={`px-4 py-2 rounded-lg ${!specialiteId ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Toutes
          </button>
          {specialites.map((specialite) => (
            <button
              key={specialite.id}
              onClick={() => window.location.href = `/modules?specialite_id=${specialite.id}`}
              className={`px-4 py-2 rounded-lg ${specialiteId == specialite.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {getMultilingualValueFromI18n(specialite.name, i18n)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => handleModuleClick(module.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-primary font-semibold">{module.code}</span>
              {module.credits && (
                <span className="text-sm text-gray-500 flex items-center">
                  <FaClock className="mr-1" /> {module.credits} crédits
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-3 text-text-dark">{getMultilingualValueFromI18n(module.title, i18n)}</h3>
            {module.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">{getMultilingualValueFromI18n(module.description, i18n)}</p>
            )}
            {module.speciality && (
              <p className="text-sm text-gray-500 mb-4">{getMultilingualValueFromI18n(module.speciality.name, i18n)}</p>
            )}
            <span className="text-primary font-medium">Voir détails →</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
