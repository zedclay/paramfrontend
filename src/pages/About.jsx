import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGraduationCap, FaUsers, FaBook, FaAward, FaBuilding } from 'react-icons/fa';

const About = () => {
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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-text-dark">À propos de l'Institut</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Institut Paramédical de Sidi Bel Abbès - Excellence en formation paramédicale
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-4">
            <FaGraduationCap className="text-primary text-4xl mr-4" />
            <h2 className="text-3xl font-bold text-text-dark">Notre Mission</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Former des professionnels paramédicaux compétents et engagés pour répondre aux besoins 
            de santé publique. L'institut s'engage à dispenser une formation de qualité, basée sur 
            les compétences professionnelles et les valeurs éthiques, afin de préparer les étudiants 
            à exercer leur métier avec excellence dans le domaine de la santé publique.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-4">
            <FaAward className="text-secondary text-4xl mr-4" />
            <h2 className="text-3xl font-bold text-text-dark">Notre Vision</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Être un institut de référence en formation paramédicale, reconnu pour l'excellence de 
            ses programmes, la qualité de son enseignement et l'impact de ses diplômés sur le système 
            de santé publique algérien. Nous aspirons à former une nouvelle génération de professionnels 
            paramédicaux capables d'évoluer dans un environnement de santé en constante mutation.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold mb-6 text-text-dark flex items-center">
          <FaBook className="text-primary mr-3" />
          Historique
        </h2>
        <div className="prose max-w-none text-gray-700">
          <p className="text-lg leading-relaxed mb-4">
            L'Institut Paramédical de Sidi Bel Abbès fait partie du réseau national des instituts de 
            formation paramédicale sous la tutelle de l'Institut National Pédagogique de Formation 
            Paramédicale (INPFP).
          </p>
          <p className="text-lg leading-relaxed mb-4">
            L'institut propose des formations de niveau Licence Professionnalisante dans différents 
            domaines paramédicaux, conformément aux standards nationaux de formation en santé publique. 
            Nos programmes sont conçus pour répondre aux besoins réels du secteur de la santé et 
            préparer les étudiants aux défis professionnels contemporains.
          </p>
          <p className="text-lg leading-relaxed">
            Depuis sa création, l'institut a formé des centaines de professionnels paramédicaux qui 
            contribuent activement au système de santé algérien, dans les établissements de santé 
            publique à travers le pays.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-primary text-white rounded-lg p-6 text-center">
          <FaUsers className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">9</div>
          <div className="text-lg">Filières</div>
        </div>
        <div className="bg-secondary text-white rounded-lg p-6 text-center">
          <FaGraduationCap className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">9</div>
          <div className="text-lg">Programmes</div>
        </div>
        <div className="bg-medical-green text-white rounded-lg p-6 text-center">
          <FaBook className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">3</div>
          <div className="text-lg">Années</div>
        </div>
        <div className="bg-accent text-white rounded-lg p-6 text-center">
          <FaBuilding className="text-5xl mx-auto mb-4" />
          <div className="text-4xl font-bold mb-2">1</div>
          <div className="text-lg">Campus</div>
        </div>
      </div>

      {/* Programs Overview */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold mb-6 text-text-dark">Nos Formations</h2>
        <p className="text-gray-700 mb-6 text-lg">
          L'institut propose des formations de niveau Licence Professionnalisante (3 ans) dans les 
          domaines suivants :
        </p>
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

      {/* Values */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6">Nos Valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Excellence</h3>
            <p>Nous visons l'excellence dans tous les aspects de la formation et de l'enseignement.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Éthique</h3>
            <p>L'intégrité et l'éthique professionnelle sont au cœur de notre formation.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Innovation</h3>
            <p>Nous adoptons des méthodes pédagogiques modernes et innovantes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
