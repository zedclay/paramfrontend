import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaBook, 
  FaStethoscope, 
  FaHeartbeat, 
  FaHospital,
  FaAward,
  FaChalkboardTeacher,
  FaLaptopMedical,
  FaHandsHelping,
  FaCheckCircle,
  FaArrowRight,
  FaBullhorn,
  FaCalendarAlt,
  FaUserMd,
  FaQuoteLeft,
  FaSignature
} from 'react-icons/fa';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { IMAGE_PATHS, getFiliereImage } from '../constants';

const Home = () => {
  const { t } = useTranslation();
  const [filieres, setFilieres] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filieresRes, announcementsRes] = await Promise.all([
        axios.get('/public/filieres'),
        axios.get('/public/announcements'),
      ]);
      setFilieres(filieresRes.data.data);
      setAnnouncements(announcementsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const heroSlides = [
    {
      title: t('home.hero.slide1.title'),
      subtitle: t('home.hero.slide1.subtitle'),
      icon: FaStethoscope,
      gradient: 'from-blue-600 to-cyan-500',
      image: '/images/hero/hero-1.jpg',
    },
    {
      title: t('home.hero.slide2.title'),
      subtitle: t('home.hero.slide2.subtitle'),
      icon: FaHeartbeat,
      gradient: 'from-emerald-600 to-teal-500',
      image: '/images/hero/hero-2.jpg',
    },
    {
      title: t('home.hero.slide3.title'),
      subtitle: t('home.hero.slide3.subtitle'),
      icon: FaHospital,
      gradient: 'from-purple-600 to-pink-500',
      image: '/images/hero/hero-3.jpg',
    },
  ];

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
    <div>
      {/* Hero Slider */}
      <section className="relative h-[600px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="h-full"
        >
          {heroSlides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <SwiperSlide key={index}>
                <motion.div
                  className={`h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center text-white relative overflow-hidden`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover opacity-40"
                      onError={(e) => {
                        console.error('Image failed to load:', slide.image);
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
                  </div>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                  </div>
                  
                  <motion.div
                    className="text-center px-4 relative z-10"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                      className="mb-6"
                    >
                      <Icon className="text-8xl mx-auto drop-shadow-lg" />
                    </motion.div>
                    <motion.h1
                      className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      className="text-2xl md:text-3xl drop-shadow-md mb-8"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      <Link to="/filieres">
                        <motion.button
                          className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {t('home.discoverPrograms')}
                        </motion.button>
                      </Link>
                      <Link to="/contact">
                        <motion.button
                          className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/30 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {t('home.contactUs')}
                        </motion.button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { icon: FaGraduationCap, number: filieres.length || 4, label: t('home.statistics.filieres'), color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { icon: FaUsers, number: '500+', label: t('home.statistics.students'), color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
              { icon: FaBook, number: '50+', label: t('home.statistics.modules'), color: 'text-purple-600', bgColor: 'bg-purple-50' },
              { icon: FaAward, number: '15+', label: t('home.statistics.yearsExperience'), color: 'text-orange-600', bgColor: 'bg-orange-50' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <AnimatedCard
                  key={index}
                  delay={index * 0.1}
                  className="text-center"
                >
                  <motion.div
                    className={`${stat.bgColor} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                    >
                      <Icon className={`text-5xl ${stat.color} mx-auto mb-3`} />
                    </motion.div>
                    <motion.h3
                      className="text-3xl font-bold text-text-dark mb-1"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {stat.number}
                    </motion.h3>
                    <p className="text-gray-600 font-medium text-sm">{stat.label}</p>
                  </motion.div>
                </AnimatedCard>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedCard delay={0.1}>
              <motion.div
                className="relative"
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                initial={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 h-full">
                  <h2 className="text-4xl font-bold text-text-dark mb-6">
                    {t('home.aboutTitle')}
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {t('home.aboutDescription')}
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {t('home.mission')}
                  </p>
                  <Link to="/about">
                    <motion.button
                      className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-dark transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('home.learnMore')} <FaArrowRight />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </AnimatedCard>
            
            <AnimatedCard delay={0.2}>
              <motion.div
                className="grid grid-cols-2 gap-4"
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                initial={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
              >
                {[
                  { icon: FaChalkboardTeacher, title: t('home.aboutFeatures.expertTeachers'), color: 'bg-blue-500' },
                  { icon: FaLaptopMedical, title: t('home.aboutFeatures.modernEquipment'), color: 'bg-emerald-500' },
                  { icon: FaHandsHelping, title: t('home.aboutFeatures.personalizedSupport'), color: 'bg-purple-500' },
                  { icon: FaAward, title: t('home.aboutFeatures.recognizedCertification'), color: 'bg-orange-500' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      className={`${item.color} rounded-xl p-6 text-white hover:shadow-xl transition-shadow`}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="text-3xl mb-3" />
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Director's Message */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Director Image */}
                <AnimatedCard delay={0.1}>
                  <motion.div
                    className="relative h-full min-h-[400px] lg:min-h-[600px] bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5"
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    initial={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="relative w-full max-w-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                        <img 
                          src="/images/director/director.jpg" 
                          alt="Directeur de l'Institut"
                          className="relative w-full h-auto rounded-2xl shadow-2xl object-cover border-4 border-white"
                          onError={(e) => {
                            console.error('Director image failed to load');
                            // Fallback to a placeholder or hide
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-8 right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-8 left-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
                  </motion.div>
                </AnimatedCard>

                {/* Director's Message */}
                <AnimatedCard delay={0.2}>
                  <motion.div
                    className="p-8 lg:p-12 flex flex-col justify-center h-full"
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    initial={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Title */}
                    <div className="mb-8">
                      <motion.div
                        className="flex items-center gap-3 mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <FaQuoteLeft className="text-primary text-2xl" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark">
                          Le Mot du Directeur
                        </h2>
                      </motion.div>
                      <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    </div>

                    {/* Message Content */}
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                      <motion.p
                        className="text-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                      >
                        Chers visiteurs, étudiants et partenaires,
                      </motion.p>
                      
                      <motion.p
                        className="text-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        C'est avec une immense fierté et un grand plaisir que je vous souhaite la bienvenue sur le portail numérique de l'<strong>Institut National de Formation Supérieure Paramédicale de Sidi Bel Abbès</strong>.
                      </motion.p>

                      <motion.p
                        className="text-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                      >
                        Notre établissement s'inscrit au cœur de la stratégie nationale de santé, avec pour noble mission de former l'élite paramédicale de demain. Ici, à Sidi Bel Abbès, nous sommes conscients que la qualité des soins repose avant tout sur la compétence, le dévouement et l'éthique des hommes et des femmes qui assistent les patients au quotidien.
                      </motion.p>

                      <motion.p
                        className="text-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                      >
                        Notre projet pédagogique ne se limite pas à la transmission de savoirs théoriques et techniques. Il vise également à inculquer à nos étudiants les valeurs fondamentales de notre profession : <strong>l'humanisme, la responsabilité et le respect de la vie humaine</strong>. Grâce à un corps enseignant qualifié et à des partenariats solides avec les structures hospitalières de la Wilaya, nous assurons une formation alliant excellence académique et réalité du terrain.
                      </motion.p>

                      <motion.p
                        className="text-lg"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                      >
                        Ce site web se veut un trait d'union entre l'administration, le corps enseignant et les étudiants, mais aussi une fenêtre ouverte sur nos activités et nos ambitions.
                      </motion.p>

                      <motion.p
                        className="text-lg font-semibold text-primary"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                      >
                        Ensemble, relevons le défi d'un système de santé performant au service du citoyen.
                      </motion.p>

                      {/* Signature */}
                      <motion.div
                        className="mt-8 pt-6 border-t border-gray-200"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.0 }}
                      >
                        <div className="flex items-center gap-3">
                          <FaSignature className="text-primary text-xl" />
                          <div>
                            <p className="font-bold text-text-dark text-lg">Le Directeur</p>
                            <p className="text-gray-600 text-sm">Institut National de Formation Supérieure Paramédicale</p>
                            <p className="text-gray-600 text-sm">Sidi Bel Abbès</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatedCard>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-4 text-text-dark"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('home.whyChooseUs')}
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t('home.whyChooseUsSubtitle')}
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaGraduationCap,
                title: t('home.features.qualityTraining.title'),
                description: t('home.features.qualityTraining.description'),
                color: 'text-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                icon: FaHospital,
                title: t('home.features.modernInfrastructure.title'),
                description: t('home.features.modernInfrastructure.description'),
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50'
              },
              {
                icon: FaUserMd,
                title: t('home.features.practicalExperience.title'),
                description: t('home.features.practicalExperience.description'),
                color: 'text-purple-600',
                bgColor: 'bg-purple-50'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimatedCard key={index} delay={index * 0.1}>
                  <motion.div
                    className={`${feature.bgColor} rounded-2xl p-8 h-full hover:shadow-xl transition-shadow`}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`${feature.color} mb-4`}>
                      <Icon className="text-5xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-dark mb-3">{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filières */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-4xl font-bold mb-4 text-text-dark"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {t('home.programsTitle')}
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {t('home.programsSubtitle')}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filieres.map((filiere, index) => (
              <AnimatedCard key={filiere.id} delay={index * 0.1}>
                <Link to={`/filieres/${filiere.id}`}>
                  <motion.div
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden relative group border-2 border-transparent hover:border-primary/20"
                    whileHover={{ scale: 1.03, y: -8 }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Filière Image */}
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={getFiliereImage(filiere.slug || filiere.id)} 
                        alt={filiere.name?.fr}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Filière image failed to load:', filiere.slug || filiere.id);
                          e.target.src = IMAGE_PATHS.FILIERES.NURSING; // Fallback
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-text-dark relative z-10 group-hover:text-primary transition-colors">
                      {filiere.name?.fr}
                    </h3>
                    <p className="text-gray-600 relative z-10 line-clamp-3 mb-4">
                      {filiere.description?.fr?.substring(0, 120)}...
                    </p>
                    
                    {/* Arrow indicator */}
                    <motion.div
                      className="flex items-center text-primary font-semibold relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      {t('filieres.learnMore')} <FaArrowRight className="ml-2" />
                    </motion.div>
                  </motion.div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
          {filieres.length > 0 && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/filieres">
                <motion.button
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.viewAllPrograms')} <FaArrowRight />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <motion.h2
                  className="text-4xl font-bold mb-2 text-text-dark"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {t('home.announcementsTitle')}
                </motion.h2>
                <motion.p
                  className="text-gray-600"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  {t('home.announcementsSubtitle')}
                </motion.p>
              </div>
              <Link to="/announcements">
                <motion.button
                  className="text-primary font-semibold hover:text-primary-dark flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  {t('home.viewAllAnnouncements')} <FaArrowRight />
                </motion.button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 6).map((announcement, index) => (
                <AnimatedCard key={announcement.id} delay={index * 0.1}>
                  <motion.div
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-primary h-full flex flex-col"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FaBullhorn className="text-primary text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-text-dark line-clamp-2">
                          {announcement.title?.fr}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <FaCalendarAlt />
                          <span>
                            {announcement.published_at
                              ? new Date(announcement.published_at).toLocaleDateString('fr-FR')
                              : new Date(announcement.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 flex-1 line-clamp-3 mb-4">
                      {announcement.content?.fr?.substring(0, 150)}...
                    </p>
                    <Link to="/announcements" className="text-primary font-semibold text-sm hover:text-primary-dark flex items-center gap-1">
                      {t('home.readMore')} <FaArrowRight className="text-xs" />
                    </Link>
                  </motion.div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary-dark to-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/filieres">
                <motion.button
                  className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.explorePrograms')}
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.contactUs')}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

