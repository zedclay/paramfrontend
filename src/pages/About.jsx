import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaGraduationCap, FaUsers, FaBook, FaAward, FaBuilding } from 'react-icons/fa';
import { IMAGE_PATHS } from '../constants';

const About = () => {
  const { t } = useTranslation();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      // TODO: Create /public/about endpoint
      // const response = await axios.get('/public/about');
      // setAboutData(response.data.data);
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">{t('common.loading')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-text-dark">{t('about.title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={IMAGE_PATHS.ABOUT.STUDENTS} 
              alt={t('about.mission.title')}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center mb-2">
                <FaGraduationCap className="text-white text-3xl mr-3" />
                <h2 className="text-2xl font-bold text-white">{t('about.mission.title')}</h2>
              </div>
            </div>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={IMAGE_PATHS.ABOUT.GRADUATION} 
              alt={t('about.vision.title')}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center mb-2">
                <FaAward className="text-white text-3xl mr-3" />
                <h2 className="text-2xl font-bold text-white">{t('about.vision.title')}</h2>
              </div>
            </div>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              {t('about.vision.description')}
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative h-64 lg:h-auto min-h-[300px]">
            <img 
              src={IMAGE_PATHS.ABOUT.BUILDING} 
              alt={t('about.history.title')}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-text-dark flex items-center">
              <FaBook className="text-primary mr-3" />
              {t('about.history.title')}
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-4">
                {t('about.history.p1')}
              </p>
              <p className="text-lg leading-relaxed mb-4">
                {t('about.history.p2')}
              </p>
              <p className="text-lg leading-relaxed">
                {t('about.history.p3')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-primary text-white rounded-lg p-6 text-center">
          <FaUsers className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">9</div>
          <div className="text-lg">{t('about.statistics.filieres')}</div>
        </div>
        <div className="bg-secondary text-white rounded-lg p-6 text-center">
          <FaGraduationCap className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">9</div>
          <div className="text-lg">{t('about.statistics.programs')}</div>
        </div>
        <div className="bg-medical-green text-white rounded-lg p-6 text-center">
          <FaBook className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">3</div>
          <div className="text-lg">{t('about.statistics.years')}</div>
        </div>
        <div className="bg-accent text-white rounded-lg p-6 text-center">
          <FaBuilding className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">1</div>
          <div className="text-lg">{t('about.statistics.campus')}</div>
        </div>
      </div>

      {/* Programs Overview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-16">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={IMAGE_PATHS.ABOUT.LABORATORY} 
            alt={t('about.programs.title')}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="text-3xl font-bold mb-2 text-white">{t('about.programs.title')}</h2>
            <p className="text-white/90 text-lg">
              {t('about.programs.description')}
            </p>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Licence Professionnalisante Infirmier de Santé Publique',
            'Licence Professionnalisante Kinésithérapeute de Santé Publique',
            'Licence Professionnalisante Laborantins Santé Publique',
            'Licence Professionnalisante Manipulateur en Imagerie Médicale',
            'Licence Professionnalisante Ergothérapeute de Santé Publique',
            'Licence Professionnalisante Assistant Médical de Santé Publique',
            'Licence Professionnalisante Assistant Social de Santé Publique',
            'Licence Professionnalisante Psychomotricité de Santé Publique',
            'Programme de Formation des Sages-Femmes de Santé Publique',
          ].map((program, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-semibold text-text-dark">{program}</h3>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6">{t('about.values.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('about.values.excellence.title')}</h3>
            <p>{t('about.values.excellence.description')}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('about.values.ethics.title')}</h3>
            <p>{t('about.values.ethics.description')}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('about.values.innovation.title')}</h3>
            <p>{t('about.values.innovation.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
