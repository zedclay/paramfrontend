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
  FaUserMd
} from 'react-icons/fa';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { IMAGE_PATHS, getFiliereImage } from '../constants';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [filieres, setFilieres] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const locale = i18n.language || 'fr';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filieresRes, announcementsRes, slidesRes] = await Promise.all([
        axios.get('/public/filieres'),
        axios.get('/public/announcements'),
        axios.get('/public/hero-slides').catch(() => ({ data: { data: [] } })), // Fallback if API not ready
      ]);
      setFilieres(filieresRes.data.data);
      setAnnouncements(announcementsRes.data.data);
      
      // Transform slides from API to component format
      const slides = (slidesRes.data.data || []).map((slide, index) => {
        const IconMap = {
          stethoscope: FaStethoscope,
          heartbeat: FaHeartbeat,
          hospital: FaHospital,
        };
        
        // Determine image path: prefer image_url, then check if image_path is static, otherwise use storage
        let imagePath = '/images/hero/hero-1.jpg'; // default fallback
        if (slide.image_url) {
          imagePath = slide.image_url;
        } else if (slide.image_path) {
          // If image_path starts with /images/, use it directly (static file)
          if (slide.image_path.startsWith('/images/')) {
            imagePath = slide.image_path;
          } else {
            // Otherwise it's a Laravel storage path
            imagePath = `/storage/${slide.image_path}`;
          }
        }
        
        return {
          id: slide.id,
          title: slide.title?.[locale] || slide.title?.fr || slide.title || '',
          subtitle: slide.subtitle?.[locale] || slide.subtitle?.fr || slide.subtitle || '',
          icon: FaStethoscope, // Default icon, can be extended
          gradient: slide.gradient || 'from-blue-600 to-cyan-500',
          image: imagePath,
        };
      });

      // Always show 11 slides - use API slides if available, otherwise use defaults
      const gradients = [
        'from-blue-600 to-cyan-500',
        'from-emerald-600 to-teal-500',
        'from-purple-600 to-pink-500',
        'from-orange-600 to-red-500',
        'from-indigo-600 to-purple-500',
        'from-green-600 to-emerald-500',
        'from-rose-600 to-pink-500',
        'from-cyan-600 to-blue-500',
        'from-yellow-600 to-orange-500',
        'from-violet-600 to-purple-500',
        'from-teal-600 to-cyan-500',
      ];
      
      // Create 11 slides: use API data if available, otherwise use defaults
      const finalSlides = Array.from({ length: 11 }, (_, i) => {
        const apiSlide = slides[i];
        if (apiSlide) {
          return apiSlide;
        }
        // Fallback to default slide with static image path
        return {
          id: `default-${i + 1}`,
          title: t('home.hero.slide1.title'),
          subtitle: t('home.hero.slide1.subtitle'),
          icon: FaStethoscope,
          gradient: gradients[i % gradients.length],
          image: `/images/hero/hero-${i + 1}.jpg`,
        };
      });
      
      console.log(`Hero slides: API returned ${slides.length}, creating ${finalSlides.length} total slides`);
      setHeroSlides(finalSlides);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to default slides on error - show all 11 images
      const gradients = [
        'from-blue-600 to-cyan-500',
        'from-emerald-600 to-teal-500',
        'from-purple-600 to-pink-500',
        'from-orange-600 to-red-500',
        'from-indigo-600 to-purple-500',
        'from-green-600 to-emerald-500',
        'from-rose-600 to-pink-500',
        'from-cyan-600 to-blue-500',
        'from-yellow-600 to-orange-500',
        'from-violet-600 to-purple-500',
        'from-teal-600 to-cyan-500',
      ];
      
      const errorFallbackSlides = Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        title: t('home.hero.slide1.title'),
        subtitle: t('home.hero.slide1.subtitle'),
        icon: FaStethoscope,
        gradient: gradients[i % gradients.length],
        image: `/images/hero/hero-${i + 1}.jpg`,
      }));
      
      setHeroSlides(errorFallbackSlides);
    } finally {
      setLoading(false);
    }
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

