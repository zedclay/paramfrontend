import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaUsers, FaBook, FaAward, FaBuilding, FaQuoteLeft, FaSignature } from 'react-icons/fa';
import { IMAGE_PATHS } from '../constants';
import AnimatedCard from '../components/AnimatedCard';

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
        <h1 className="text-5xl font-bold mb-4 text-text-dark">Présentation de l'établissement</h1>
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
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                L'institut a pour mission la satisfaction des besoins du secteur de la santé en matière de formation paramédicale, en priorité, et des besoins des secteurs nationaux en cadres paramédicaux qualifiés. A ce titre, il est chargé, notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>d'assurer la formation supérieure des paramédicaux de santé publique ;</li>
                <li>d'adopter les supports et les moyens pédagogiques innovants permettant l'application optimale des programmes de formation ;</li>
                <li>d'évaluer régulièrement la mise en œuvre des programmes de formation et de faire des propositions visant leur amélioration ;</li>
                <li>de contribuer au développement de la recherche scientifique dans son domaine d'activité ;</li>
                <li>d'organiser des sessions de formation continue, de perfectionnement et de recyclage, en vue de parfaire les compétences professionnelles des paramédicaux de santé publique ;</li>
                <li>de proposer des programmes de formation spécialisée, de perfectionnement et de recyclage ;</li>
                <li>d'organiser et de suivre le déroulement des examens et concours, conformément à la réglementation en vigueur ;</li>
                <li>de dispenser des formations complémentaires, en vue d'accéder à certains grades ou à la promotion aux grades supérieurs ;</li>
                <li>de participer à l'élaboration, à l'adaptation et à l'harmonisation des programmes pédagogiques de formation dans les domaines, filières et spécialités en rapport avec son activité ;</li>
                <li>de contribuer à l'élaboration des travaux d'études relatifs à son domaine de compétence ;</li>
                <li>d'organiser et/ou de participer aux journées d'études, séminaires, conférences et colloques nationaux traitant de questions entrant dans le domaine de ses compétences ;</li>
                <li>d'entretenir et de promouvoir des relations de coopération et d'échange avec des institutions et organismes nationaux ayant les mêmes missions.</li>
              </ul>
            </div>
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
                <h2 className="text-2xl font-bold text-white">ORGANISATION ET FONCTIONNEMENT</h2>
              </div>
            </div>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              L'institut est administré par un conseil d'orientation, dirigé par un directeur et doté d'un conseil scientifique.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative h-64 lg:h-auto min-h-[300px]">
            <img 
              src="/images/contact/contact-image.jpg" 
              alt="Introduction"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-text-dark flex items-center">
              <FaBook className="text-primary mr-3" />
              Introduction
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-4">
                L'institut est un établissement public à caractère administratif, doté de la personnalité morale et de l'autonomie financière. Il est créé par décret exécutif sur rapport conjoint du ministre chargé de la santé et du ministre chargé de l'enseignement supérieur.
              </p>
              <p className="text-lg leading-relaxed font-bold">
                Décret exécutif n° 22-220 du 14 Dhou El Kaâda 1443 correspondant au 14 juin 2022 fixant les missions, l'organisation et le fonctionnement des instituts nationaux de formation supérieure paramédicale.
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


      {/* Values */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 mb-16">
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

      {/* Director's Message */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FaQuoteLeft className="text-primary text-3xl" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-dark mb-3">
                Le Mot du Directeur
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
            </motion.div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Director Image - Left Side */}
                <motion.div
                  className="lg:col-span-2 relative bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 p-8 lg:p-12 flex items-center justify-center"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative w-full max-w-xs">
                    {/* Decorative background circles */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
                    
                    {/* Image container */}
                    <div className="relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl opacity-50"></div>
                      <img 
                        src="/images/director/director.png" 
                        alt="Directeur de l'Institut"
                        className="relative w-full h-auto rounded-xl shadow-lg object-cover border-4 border-white"
                        onError={(e) => {
                          console.error('Director image failed to load');
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Message Content - Right Side */}
                <motion.div
                  className="lg:col-span-3 p-8 lg:p-12"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {/* Message paragraphs */}
                  <div className="space-y-5 text-gray-700 leading-relaxed" dir="rtl">
                    <p className="text-base text-right">
                      بسم الله الرحمن الرحيم
                    </p>
                    <p className="text-base text-right">
                      Je voudrais vous souhaiter la bienvenue sur ce site Web, à travers lequel nous aimerions adresser un mot à tous les visiteurs, et tous ceux qui s'intéressent à la formation paramédicale, à noter le début aux efforts considérables consentis par le Ministère de la Santé, de la Population et de la Réforme Hospitalière : « Direction de la Formation », qui travaille en premier lieu, à élever le niveau de formation à tous les stades de l'enseignement paramédical, pour construire un système éducatif de haute qualité qui s'appuie sur l'élément de connaissance comme axe principal du processus de formation, dont le but est de préparer nos étudiants en travaillant au développement de leurs capacités cognitives pour créer une génération capable de faire face aux défis imposés par la réalité sanitaire et sociale et de répondre aux besoins des individus.
                    </p>
                    <p className="text-base text-right">
                      Notre mission de gérer l'Institut National de Formation Supérieure Paramédicale Sidi Bel Abbes, nous rend heureux d'être au service de notre pays, car nous sommes fiers de la confiance placée en notre personne pour contribuer aux efforts de construction de cet édifice scientifique et travailler à surmonter les difficultés et les obstacles que peuvent rencontrer ses membres dans le domaine de la formation.
                    </p>
                    <p className="text-base text-right">
                      Sur la base de cette vision, l'administration de l'institut accorde une grande attention à l'exploitation de toutes les capacités et à fournir tout le soutien possible pour pousser nos chers étudiants à puiser dans les sources de la science et des connaissances, et à travailler pour formuler une politique intégrée permettant au corps enseignant de pratiquer leurs activités pédagogiques dans des conditions appropriées qui les aident à diffuser et enrichir les connaissances dans une bonne atmosphère.
                    </p>
                    <p className="text-base text-right">
                      Ce que nous recherchons à l'Institut National de Formation Supérieure Paramédicale Sidi Bel Abbes n'est pas impossible, il peut nous être accessible grâce au soutien, et à l'intensification des efforts de tous, enseignants, étudiants et administration…, et travaillant ensemble dans un esprit d'équipe.
                    </p>
                    <p className="text-base text-right">
                      En conclusion, nous espérons que ce site Web sera un lien de communication avec votre institut pour connaître son actualité et mettre à jour ses développements, souhaitant bonne chance à tous ceux qui sont en charge de servir notre système de formation, et réussite à tous nos étudiants.
                    </p>
                  </div>

                  {/* Signature */}
                  <div className="mt-10 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <FaSignature className="text-primary text-2xl" />
                      </div>
                      <div>
                        <p className="font-bold text-text-dark text-xl mb-1">Mohammed BENADIS</p>
                        <p className="text-gray-600 text-sm font-medium">Directeur de l'Institut National de Formation Supérieure Paramédicale Sidi Bel Abbès</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
