import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaUsers, FaFileAlt, FaChartLine, FaBullhorn, FaSearch, FaEdit, FaTrash, FaUpload, FaGraduationCap, FaCalendarAlt, FaImage } from 'react-icons/fa';
import StudentsManagement from '../components/admin/StudentsManagement';
import NotesManagement from '../components/admin/NotesManagement';
import ContentManagement from '../components/admin/ContentManagement';
import AnnouncementsManagement from '../components/admin/AnnouncementsManagement';
import AcademicManagement from '../components/admin/AcademicManagement';
import PlanningManagement from '../components/admin/PlanningManagement';
import HeroCarouselManagement from '../components/admin/HeroCarouselManagement';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-text-dark">Tableau de bord administrateur</h1>
          <p className="text-gray-600 mt-1">Bienvenue, {user?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: FaChartLine },
              { id: 'academic', label: 'Structure Académique', icon: FaGraduationCap },
              { id: 'planning', label: 'Emplois du Temps', icon: FaCalendarAlt },
              { id: 'students', label: 'Étudiants', icon: FaUsers },
              { id: 'notes', label: 'Notes', icon: FaFileAlt },
              { id: 'content', label: 'Contenu', icon: FaEdit },
              { id: 'announcements', label: 'Annonces', icon: FaBullhorn },
              { id: 'carousel', label: 'Carousel', icon: FaImage },
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
        {activeTab === 'dashboard' && (
          <div>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Étudiants</p>
                      <p className="text-3xl font-bold text-text-dark mt-2">{stats.statistics?.total_students || 0}</p>
                    </div>
                    <FaUsers className="text-4xl text-primary opacity-50" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Étudiants Actifs</p>
                      <p className="text-3xl font-bold text-text-dark mt-2">{stats.statistics?.active_students || 0}</p>
                    </div>
                    <FaUsers className="text-4xl text-medical-green opacity-50" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Notes</p>
                      <p className="text-3xl font-bold text-text-dark mt-2">{stats.statistics?.total_notes || 0}</p>
                    </div>
                    <FaFileAlt className="text-4xl text-secondary opacity-50" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Annonces</p>
                      <p className="text-3xl font-bold text-text-dark mt-2">{stats.statistics?.total_announcements || 0}</p>
                    </div>
                    <FaBullhorn className="text-4xl text-primary opacity-50" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-text-dark">Derniers téléchargements</h2>
              <div className="space-y-4">
                {stats?.recent_uploads?.length > 0 ? (
                  stats.recent_uploads.map((note) => (
                    <div key={note.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-semibold">{note.title}</p>
                        <p className="text-sm text-gray-500">Par {note.uploader?.name} • {new Date(note.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm text-gray-500">{note.download_count || 0} téléchargements</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Aucun téléchargement récent</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && <AcademicManagement />}
        {activeTab === 'planning' && <PlanningManagement />}
        {activeTab === 'students' && <StudentsManagement />}
        {activeTab === 'notes' && <NotesManagement />}
        {activeTab === 'content' && <ContentManagement />}
        {activeTab === 'announcements' && <AnnouncementsManagement />}
        {activeTab === 'carousel' && <HeroCarouselManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
