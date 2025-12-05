import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaBook } from 'react-icons/fa';
import { CardSkeleton } from '../components/LoadingSkeleton';

const StudentSchedule = () => {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

  useEffect(() => {
    if (!isStudent) {
      navigate('/login');
      return;
    }
    fetchSemesters();
  }, [isStudent, navigate]);

  useEffect(() => {
    if (selectedSemester) {
      fetchSchedule(selectedSemester);
    }
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      // Get current semester from student's year
      if (user?.year_id) {
        const response = await axios.get(`/admin/years/${user.year_id}/semesters`);
        const semestersData = response.data.data || [];
        setSemesters(semestersData);
        // Auto-select current semester
        const currentSemester = semestersData.find(s => {
          const start = new Date(s.start_date);
          const end = new Date(s.end_date);
          const today = new Date();
          return today >= start && today <= end;
        }) || semestersData[0];
        if (currentSemester) {
          setSelectedSemester(currentSemester.id);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchSchedule = async (semesterId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/student/schedule`, {
        params: { semester_id: semesterId }
      });
      setSchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = {
      1: 'Lundi',
      2: 'Mardi',
      3: 'Mercredi',
      4: 'Jeudi',
      5: 'Vendredi',
      6: 'Samedi',
      7: 'Dimanche'
    };
    return days[dayOfWeek] || '';
  };

  const getCourseTypeLabel = (type) => {
    const labels = {
      cours: 'Cours',
      td: 'TD',
      tp: 'TP',
      examen: 'Examen'
    };
    return labels[type] || type;
  };

  const getCourseTypeColor = (type) => {
    const colors = {
      cours: 'bg-blue-100 text-blue-800',
      td: 'bg-green-100 text-green-800',
      tp: 'bg-orange-100 text-orange-800',
      examen: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const groupByDay = (items) => {
    const grouped = {};
    items?.forEach(item => {
      if (!grouped[item.day_of_week]) {
        grouped[item.day_of_week] = [];
      }
      grouped[item.day_of_week].push(item);
    });
    // Sort items by start time within each day
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  };

  if (!isStudent) {
    return null;
  }

  const groupedSchedule = groupByDay(schedule?.items || []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">Mon Emploi du Temps</h1>
              <p className="text-gray-600 mt-1">
                {user?.year?.name?.fr || `Année ${user?.year?.year_number || ''}`} - 
                {user?.group?.name ? ` Groupe ${user.group.name}` : ''}
              </p>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedSemester || ''}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Sélectionner un semestre</option>
                {semesters.map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name?.fr || `Semestre ${semester.semester_number}`} - {semester.academic_year}
                  </option>
                ))}
              </select>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 ${viewMode === 'week' ? 'bg-primary text-white' : 'bg-white'}`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 ${viewMode === 'day' ? 'bg-primary text-white' : 'bg-white'}`}
                >
                  Jour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : schedule && schedule.planning?.image_path ? (
          // Display image if available
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-text-dark">Emploi du Temps</h2>
            <div className="flex justify-center">
              <img 
                src={schedule.planning.image_path.startsWith('http') 
                  ? schedule.planning.image_path 
                  : `${window.location.protocol}//${window.location.host}/storage/${schedule.planning.image_path}`}
                alt="Emploi du temps" 
                className="max-w-full h-auto border rounded-lg shadow-lg"
              />
            </div>
          </div>
        ) : schedule && schedule.items && schedule.items.length > 0 ? (
          <div className="space-y-6">
            {viewMode === 'week' ? (
              // Week View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(dayOfWeek => (
                  <div key={dayOfWeek} className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-bold text-lg text-primary mb-4 text-center">
                      {getDayName(dayOfWeek)}
                    </h3>
                    <div className="space-y-3">
                      {groupedSchedule[dayOfWeek]?.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border-l-4 rounded p-3 ${
                            item.course_type === 'cours' ? 'border-blue-500 bg-blue-50' :
                            item.course_type === 'td' ? 'border-green-500 bg-green-50' :
                            item.course_type === 'tp' ? 'border-orange-500 bg-orange-50' :
                            'border-red-500 bg-red-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-text-dark">
                                {item.module?.title?.fr || item.module?.code}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {item.module?.code}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${getCourseTypeColor(item.course_type)}`}>
                              {getCourseTypeLabel(item.course_type)}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                              <FaClock className="mr-1" />
                              {item.start_time} - {item.end_time}
                            </div>
                            {item.room && (
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-1" />
                                {item.room}
                              </div>
                            )}
                            {item.teacher_name && (
                              <div className="flex items-center">
                                <FaUser className="mr-1" />
                                {item.teacher_name}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {(!groupedSchedule[dayOfWeek] || groupedSchedule[dayOfWeek].length === 0) && (
                        <p className="text-center text-gray-400 text-sm py-4">Aucun cours</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Day View - Show selected day or today
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-text-dark">
                  {getDayName(Object.keys(groupedSchedule)[0] || 1)}
                </h2>
                <div className="space-y-4">
                  {Object.keys(groupedSchedule).map(dayOfWeek => (
                    groupedSchedule[dayOfWeek].map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                        style={{
                          borderLeftColor: item.course_type === 'cours' ? '#3B82F6' :
                                         item.course_type === 'td' ? '#10B981' :
                                         item.course_type === 'tp' ? '#F97316' : '#EF4444'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FaBook className="text-primary" />
                              <h3 className="font-bold text-lg text-text-dark">
                                {item.module?.title?.fr || item.module?.code}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded ${getCourseTypeColor(item.course_type)}`}>
                                {getCourseTypeLabel(item.course_type)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{item.module?.code}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <FaClock className="mr-2 text-primary" />
                                {item.start_time} - {item.end_time}
                              </div>
                              {item.room && (
                                <div className="flex items-center text-gray-600">
                                  <FaMapMarkerAlt className="mr-2 text-primary" />
                                  {item.room}
                                </div>
                              )}
                              {item.teacher_name && (
                                <div className="flex items-center text-gray-600">
                                  <FaUser className="mr-2 text-primary" />
                                  {item.teacher_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun emploi du temps disponible</p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedSemester ? 'Aucun cours programmé pour ce semestre' : 'Sélectionnez un semestre'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;

