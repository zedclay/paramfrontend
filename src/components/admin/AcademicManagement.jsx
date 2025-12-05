import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaCalendarAlt, FaUsers, FaBook, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { CardSkeleton } from '../LoadingSkeleton';

const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState('years');
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);
  const [specialities, setSpecialities] = useState([]);

  useEffect(() => {
    fetchSpecialities();
  }, []);

  useEffect(() => {
    if (selectedSpeciality) {
      if (activeTab === 'years') {
        fetchYears();
        fetchSemesters(); // Need years for semester form
      }
      if (activeTab === 'semesters') {
        fetchSemesters();
        fetchYears(); // Need years for semester form
      }
      if (activeTab === 'groups') {
        fetchGroups();
        fetchYears(); // Need years for group form
      }
    }
  }, [selectedSpeciality, activeTab]);

  const fetchSpecialities = async () => {
    try {
      const response = await axios.get('/admin/specialites');
      setSpecialities(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedSpeciality(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching specialities:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchYears = async () => {
    if (!selectedSpeciality) return;
    setLoading(true);
    try {
      console.log('Fetching years for speciality:', selectedSpeciality);
      console.log('API Base URL:', axios.defaults.baseURL);
      console.log('Full URL:', `${axios.defaults.baseURL}/admin/years?speciality_id=${selectedSpeciality}`);
      
      const response = await axios.get('/admin/years', {
        params: { speciality_id: selectedSpeciality }
      });
      setYears(response.data.data || []);
    } catch (error) {
      console.error('Error fetching years:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error URL:', error.config?.url);
      console.error('Full error config:', error.config);
      
      let errorMessage = 'Erreur lors du chargement des années';
      if (error.response?.status === 404) {
        errorMessage = `Route non trouvée (404). Vérifiez que l'API est accessible à: ${axios.defaults.baseURL}/admin/years`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    if (!selectedSpeciality) return;
    setLoading(true);
    try {
      const response = await axios.get('/admin/semesters', {
        params: { speciality_id: selectedSpeciality }
      });
      setSemesters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (!selectedSpeciality) return;
    setLoading(true);
    try {
      const response = await axios.get('/admin/groups', {
        params: { speciality_id: selectedSpeciality }
      });
      setGroups(response.data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    try {
      const response = await axios.delete(`/admin/${type}/${id}`);
      if (response.data.success) {
        if (type === 'years') fetchYears();
        if (type === 'semesters') fetchSemesters();
        if (type === 'groups') fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erreur lors de la suppression';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const handleCreate = () => {
    setFormData({});
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async (type) => {
    try {
      let dataToSend = {...formData};
      
      // Validation
      if (type === 'years' && !dataToSend.year_number) {
        alert('Veuillez entrer un numéro d\'année');
        return;
      }
      if (type === 'semesters' && (!dataToSend.year_id || !dataToSend.semester_number)) {
        alert('Veuillez remplir tous les champs requis');
        return;
      }
      if (type === 'groups' && (!dataToSend.year_id || !dataToSend.name)) {
        alert('Veuillez remplir tous les champs requis');
        return;
      }
      
      if (editingId) {
        // Update
        const response = await axios.put(`/admin/${type}/${editingId}`, dataToSend);
        if (response.data.success) {
          alert(`${type === 'years' ? 'Année' : type === 'semesters' ? 'Semestre' : 'Groupe'} modifié avec succès`);
        }
      } else {
        // Create
        if (type === 'years') {
          dataToSend.speciality_id = selectedSpeciality;
          if (!dataToSend.name) {
            dataToSend.name = {fr: `Année ${dataToSend.year_number}`, ar: `السنة ${dataToSend.year_number}`};
          }
        }
        if (type === 'groups') {
          dataToSend.speciality_id = selectedSpeciality;
        }
        if (type === 'semesters') {
          if (!dataToSend.name) {
            dataToSend.name = {
              fr: `Semestre ${dataToSend.semester_number}`,
              ar: dataToSend.semester_number === 1 ? 'الفصل الأول' : 'الفصل الثاني'
            };
          }
        }
        console.log('Sending data:', dataToSend);
        const response = await axios.post(`/admin/${type}`, dataToSend);
        if (response.data.success) {
          alert(`${type === 'years' ? 'Année' : type === 'semesters' ? 'Semestre' : 'Groupe'} créé avec succès`);
        }
      }
      setShowForm(false);
      setFormData({});
      setEditingId(null);
      if (type === 'years') fetchYears();
      if (type === 'semesters') fetchSemesters();
      if (type === 'groups') fetchGroups();
    } catch (error) {
      console.error('Error saving:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      const errorDetails = error.response?.data?.error?.details;
      if (errorDetails) {
        console.error('Validation errors:', errorDetails);
        alert(`Erreur: ${errorMsg}\nDétails: ${JSON.stringify(errorDetails)}`);
      } else {
        alert(`Erreur: ${errorMsg}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Speciality Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner une spécialité
        </label>
        <select
          value={selectedSpeciality || ''}
          onChange={(e) => setSelectedSpeciality(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">Sélectionner...</option>
          {specialities.map(spec => (
            <option key={spec.id} value={spec.id}>
              {spec.name?.fr || spec.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex space-x-1 px-4">
            {[
              { id: 'years', label: 'Années', icon: FaGraduationCap },
              { id: 'semesters', label: 'Semestres', icon: FaCalendarAlt },
              { id: 'groups', label: 'Groupes', icon: FaUsers },
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

        <div className="p-6">
          {!selectedSpeciality ? (
            <p className="text-center text-gray-500 py-8">
              Veuillez sélectionner une spécialité
            </p>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {activeTab === 'years' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Années académiques</h3>
                    <button 
                      onClick={handleCreate}
                      className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition"
                    >
                      <FaPlus className="mr-2" /> Ajouter
                    </button>
                  </div>
                  {showForm && activeTab === 'years' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-bold mb-4">{editingId ? 'Modifier' : 'Nouvelle'} Année</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Numéro d'année</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.year_number || ''}
                            onChange={(e) => setFormData({...formData, year_number: parseInt(e.target.value)})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nom (FR)</label>
                          <input
                            type="text"
                            value={formData.name?.fr || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              name: {...formData.name, fr: e.target.value}
                            })}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleSave('years')}
                          className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setShowForm(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {years.map(year => (
                      <motion.div
                        key={year.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-primary">
                            {year.name?.fr || `Année ${year.year_number}`}
                          </h4>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(year)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete('years', year.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Année {year.year_number}
                        </p>
                        {year.description?.fr && (
                          <p className="text-sm text-gray-500 mt-2">{year.description.fr}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'semesters' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Semestres</h3>
                    <button 
                      onClick={handleCreate}
                      className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition"
                    >
                      <FaPlus className="mr-2" /> Ajouter
                    </button>
                  </div>
                  {showForm && activeTab === 'semesters' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-bold mb-4">{editingId ? 'Modifier' : 'Nouveau'} Semestre</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Année</label>
                          <select
                            value={formData.year_id || ''}
                            onChange={(e) => setFormData({...formData, year_id: parseInt(e.target.value)})}
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="">Sélectionner...</option>
                            {years.map(y => (
                              <option key={y.id} value={y.id}>
                                {y.name?.fr || `Année ${y.year_number}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Numéro de semestre</label>
                          <select
                            value={formData.semester_number || ''}
                            onChange={(e) => setFormData({...formData, semester_number: parseInt(e.target.value)})}
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="">Sélectionner...</option>
                            <option value="1">Semestre 1</option>
                            <option value="2">Semestre 2</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date de début</label>
                          <input
                            type="date"
                            value={formData.start_date || ''}
                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date de fin</label>
                          <input
                            type="date"
                            value={formData.end_date || ''}
                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Année académique</label>
                          <input
                            type="text"
                            placeholder="2024-2025"
                            value={formData.academic_year || ''}
                            onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleSave('semesters')}
                          className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setShowForm(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {semesters.map(semester => (
                      <motion.div
                        key={semester.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg text-primary">
                              {semester.name?.fr || `Semestre ${semester.semester_number}`}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {semester.year?.name?.fr || `Année ${semester.year?.year_number}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {semester.academic_year}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(semester)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete('semesters', semester.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'groups' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Groupes</h3>
                    <button 
                      onClick={handleCreate}
                      className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition"
                    >
                      <FaPlus className="mr-2" /> Ajouter
                    </button>
                  </div>
                  {showForm && activeTab === 'groups' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-bold mb-4">{editingId ? 'Modifier' : 'Nouveau'} Groupe</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Année</label>
                          <select
                            value={formData.year_id || ''}
                            onChange={(e) => setFormData({...formData, year_id: parseInt(e.target.value)})}
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="">Sélectionner...</option>
                            {years.map(y => (
                              <option key={y.id} value={y.id}>
                                {y.name?.fr || `Année ${y.year_number}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nom du groupe</label>
                          <input
                            type="text"
                            placeholder="G1, G2, etc."
                            value={formData.name || ''}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Capacité (optionnel)</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.capacity || ''}
                            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleSave('groups')}
                          className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setShowForm(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map(group => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-lg text-primary">
                              {group.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {group.code}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {group.year?.name?.fr || `Année ${group.year?.year_number}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(group)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete('groups', group.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        {group.capacity && (
                          <p className="text-xs text-gray-500">
                            Capacité: {group.current_capacity || 0}/{group.capacity}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicManagement;

