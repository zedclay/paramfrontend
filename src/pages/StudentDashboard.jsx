import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaDownload, FaEye, FaBook, FaCalendarAlt, FaGraduationCap, FaUsers } from 'react-icons/fa';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/LoadingSkeleton';

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    if (!isStudent) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    fetchNotes(); // Load notes for overview tab
  }, [isStudent, navigate]);

  useEffect(() => {
    if (activeTab === 'notes') {
      fetchNotes(); // Refresh notes when switching to notes tab
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/student/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data structure if API fails
      setDashboardData({
        announcements: [],
        enrolled_modules: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await axios.get('/student/notes');
      setNotes(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDownload = async (noteId) => {
    try {
      // Fetch the file directly with authentication and download parameter
      const response = await axios.get(`/student/notes/${noteId}/serve?download=true`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'note.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading note:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors du téléchargement';
      alert(`Erreur: ${errorMessage}`);
    }
  };

  const handlePreview = async (noteId) => {
    try {
      // Fetch the file directly with authentication
      const response = await axios.get(`/student/notes/${noteId}/serve`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Create a blob URL and open it
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error previewing note:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Erreur lors de l\'aperçu';
      alert(`Erreur: ${errorMessage}`);
    }
  };

  if (!isStudent) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-text-dark">Tableau de bord étudiant</h1>
          <p className="text-gray-600 mt-1">Bienvenue, {user?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: FaBook },
              { id: 'schedule', label: 'Emploi du Temps', icon: FaCalendarAlt },
              { id: 'notes', label: 'Mes Notes', icon: FaFileAlt },
              { id: 'modules', label: 'Mes Modules', icon: FaBook },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-2">Bienvenue, {user?.name}!</h2>
              <p className="text-white/90">Voici un aperçu de votre tableau de bord étudiant.</p>
              {user && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {user.filiere && (
                    <div>
                      <p className="text-white/70">Filière</p>
                      <p className="font-semibold">{user.filiere.name?.fr || user.filiere.name}</p>
                    </div>
                  )}
                  {user.speciality && (
                    <div>
                      <p className="text-white/70">Spécialité</p>
                      <p className="font-semibold">{user.speciality.name?.fr || user.speciality.name}</p>
                    </div>
                  )}
                  {user.year && (
                    <div>
                      <p className="text-white/70">Année</p>
                      <p className="font-semibold">{user.year.name?.fr || `Année ${user.year.year_number}`}</p>
                    </div>
                  )}
                  {user.group && (
                    <div>
                      <p className="text-white/70">Groupe</p>
                      <p className="font-semibold">{user.group.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Mes Notes</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{notes.length}</p>
                  </div>
                  <FaFileAlt className="text-4xl text-primary opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Mes Modules</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{dashboardData?.enrolled_modules?.length || 0}</p>
                  </div>
                  <FaBook className="text-4xl text-secondary opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Annonces</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{dashboardData?.announcements?.length || 0}</p>
                  </div>
                  <FaFileAlt className="text-4xl text-medical-green opacity-50" />
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-text-dark">Annonces récentes</h2>
              {dashboardData?.announcements && dashboardData.announcements.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold text-lg text-text-dark">{announcement.title?.fr || announcement.title}</h3>
                      <p className="text-gray-600 mt-1">{announcement.content?.fr || announcement.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune annonce pour le moment.</p>
              )}
            </div>

            {/* Enrolled Modules */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-text-dark">Mes Modules</h2>
              {dashboardData?.enrolled_modules && dashboardData.enrolled_modules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.enrolled_modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => setActiveTab('modules')}>
                      <h3 className="font-semibold text-primary">{module.code}</h3>
                      <p className="text-text-dark font-medium mt-1">{module.title?.fr || module.title}</p>
                      {module.speciality && (
                        <p className="text-sm text-gray-500 mt-2">{module.speciality.title?.fr || module.speciality.name?.fr || module.speciality.code}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun module assigné pour le moment.</p>
              )}
            </div>

            {/* Recent Notes Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-text-dark">Notes récentes</h2>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Voir toutes →
                </button>
              </div>
              {notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.slice(0, 4).map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-text-dark text-sm">{note.title}</h3>
                        <FaFileAlt className="text-primary text-xl" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{new Date(note.created_at).toLocaleDateString()}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(note.id)}
                          className="flex-1 bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-200 transition"
                        >
                          Aperçu
                        </button>
                        <button
                          onClick={() => handleDownload(note.id)}
                          className="flex-1 bg-primary text-white py-1 px-2 rounded text-xs hover:bg-primary-dark transition"
                        >
                          Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune note disponible.</p>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-dark">Mes Notes</h2>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded-lg px-4 py-2">
                    <option>Tous les modules</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {notesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note, index) => (
                    <AnimatedCard key={note.id} delay={index * 0.05}>
                      <motion.div
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-dark mb-1">{note.title}</h3>
                            {note.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{note.description}</p>
                            )}
                          </div>
                          {note.mime_type === 'application/pdf' ? (
                            <FaFileAlt className="text-red-500 text-2xl" />
                          ) : (
                            <FaFileAlt className="text-blue-500 text-2xl" />
                          )}
                        </div>
                        
                        {note.module && (
                          <p className="text-xs text-gray-500 mb-3">{note.module.code} - {note.module.title?.fr}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                          <span>{(note.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handlePreview(note.id)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaEye className="mr-2" /> Aperçu
                          </motion.button>
                          <motion.button
                            onClick={() => handleDownload(note.id)}
                            className="flex-1 bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary-dark transition flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaDownload className="mr-2" /> Télécharger
                          </motion.button>
                        </div>
                      </motion.div>
                    </AnimatedCard>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="text-center py-12 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaFileAlt className="text-5xl mx-auto mb-4 opacity-50" />
                  <p>Aucune note disponible</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <FaCalendarAlt className="text-5xl text-primary mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 mb-4">Voir votre emploi du temps complet</p>
              <Link
                to="/student/schedule"
                className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Ouvrir l'emploi du temps
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-text-dark">Mes Modules</h2>
            {dashboardData?.enrolled_modules && dashboardData.enrolled_modules.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.enrolled_modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-primary">{module.code}</h3>
                        <p className="text-text-dark font-medium mt-1">{module.title?.fr}</p>
                        {module.description && (
                          <p className="text-gray-600 mt-2">{module.description.fr}</p>
                        )}
                        {module.speciality && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500">
                              <strong>Spécialité:</strong> {module.speciality.title?.fr || module.speciality.name?.fr || module.speciality.code}
                            </p>
                            {module.speciality.filiere && (
                              <p className="text-sm text-gray-500">
                                <strong>Filière:</strong> {module.speciality.filiere.name?.fr || module.speciality.filiere.title?.fr}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {module.credits && <p className="text-sm text-gray-500">{module.credits} crédits</p>}
                        {module.hours && <p className="text-sm text-gray-500">{module.hours} heures</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun module assigné</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
