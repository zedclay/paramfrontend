import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaBook, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaUsers } from 'react-icons/fa';
import { CardSkeleton } from '../LoadingSkeleton';

const PlanningManagement = () => {
  const [plannings, setPlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // New filters
  const [filieres, setFilieres] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    fetchFilieres();
  }, []);

  useEffect(() => {
    if (selectedFiliere) {
      fetchSpecialities(selectedFiliere);
    } else {
      setSpecialities([]);
      setYears([]);
      setSemesters([]);
    }
  }, [selectedFiliere]);

  useEffect(() => {
    if (selectedSpeciality) {
      fetchYears(selectedSpeciality);
    } else {
      setYears([]);
      setSemesters([]);
    }
  }, [selectedSpeciality]);

  useEffect(() => {
    if (selectedYear) {
      fetchSemesters(selectedYear);
    } else {
      setSemesters([]);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedSemester) {
      fetchPlanning(selectedSemester);
    } else {
      setSelectedPlanning(null);
    }
  }, [selectedSemester]);

  const fetchFilieres = async () => {
    try {
      const response = await axios.get('/admin/filieres');
      setFilieres(response.data.data || []);
    } catch (error) {
      console.error('Error fetching filieres:', error);
    }
  };

  const fetchSpecialities = async (filiereId) => {
    try {
      const response = await axios.get('/admin/specialites');
      const allSpecialities = response.data.data || [];
      const filtered = allSpecialities.filter(s => s.filiere_id === filiereId);
      setSpecialities(filtered);
    } catch (error) {
      console.error('Error fetching specialities:', error);
    }
  };

  const fetchYears = async (specialityId) => {
    try {
      const response = await axios.get('/admin/years', {
        params: { speciality_id: specialityId }
      });
      setYears(response.data.data || []);
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchSemesters = async (yearId) => {
    try {
      const response = await axios.get('/admin/semesters', {
        params: { year_id: yearId }
      });
      setSemesters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchPlanning = async (semesterId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/admin/plannings`, {
        params: { semester_id: semesterId }
      });
      const planning = response.data.data?.[0] || null;
      console.log('Fetched planning:', planning);
      console.log('Planning image_path:', planning?.image_path);
      console.log('Planning is_published:', planning?.is_published);
      
      setSelectedPlanning(planning);
      if (planning) {
        fetchPlanningItems(planning.id);
        // Reset image preview when planning changes
        setImagePreview(null);
        
        // Debug: Log if image_path is missing
        if (!planning.image_path) {
          console.warn('⚠️ Planning exists but image_path is NULL or empty');
          console.warn('Planning ID:', planning.id);
          console.warn('Planning data:', planning);
        }
      }
    } catch (error) {
      console.error('Error fetching planning:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanningItems = async (planningId) => {
    try {
      const response = await axios.get(`/admin/plannings/${planningId}/items`);
      setSelectedPlanning(prev => ({
        ...prev,
        items: response.data.data || []
      }));
    } catch (error) {
      console.error('Error fetching planning items:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('/admin/modules');
      setModules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchGroups = async () => {
    if (!selectedSemester) return;
    try {
      // Get year from semester
      const semester = semesters.find(s => s.id === selectedSemester);
      if (semester?.year_id) {
        const response = await axios.get('/admin/groups', {
          params: { year_id: semester.year_id }
        });
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchGroups();
    }
  }, [selectedSemester]);

  const handlePublish = async (planningId) => {
    try {
      await axios.post(`/admin/plannings/${planningId}/publish`);
      fetchPlanning(selectedSemester);
    } catch (error) {
      console.error('Error publishing planning:', error);
      alert('Erreur lors de la publication');
    }
  };

  const handleCreatePlanning = async (withImage = false) => {
    if (!selectedSemester) {
      alert('Veuillez sélectionner un semestre');
      return;
    }
    
    // If creating with image but no image selected, show alert
    if (withImage && !imageFile) {
      alert('Veuillez sélectionner une image avant de créer l\'emploi du temps');
      return;
    }

    try {
      const semester = semesters.find(s => s.id === selectedSemester);
      const formDataToSend = new FormData();
      formDataToSend.append('semester_id', selectedSemester);
      formDataToSend.append('academic_year', semester?.academic_year || '2024-2025');
      
      // Add image if creating with image
      if (withImage && imageFile) {
        formDataToSend.append('image', imageFile);
        console.log('Creating planning with image:', imageFile.name, imageFile.size);
      }

      const response = await axios.post('/admin/plannings', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Planning created:', response.data);
      
      // Reset image upload state
      if (withImage) {
        setImageFile(null);
        setImagePreview(null);
        setShowImageUpload(false);
      }
      
      // Fetch the newly created planning
      await fetchPlanning(selectedSemester);
      
      if (withImage) {
        alert('✅ Emploi du temps créé avec l\'image avec succès!');
      } else {
        alert('✅ Emploi du temps créé avec succès! Vous pouvez maintenant uploader une image.');
      }
    } catch (error) {
      console.error('Error creating planning:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Erreur lors de la création';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedPlanning || !imageFile) return;
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', imageFile);

      console.log('Uploading image for planning:', selectedPlanning.id);
      console.log('Image file:', imageFile.name, imageFile.size);

      const response = await axios.put(`/admin/plannings/${selectedPlanning.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('=== UPLOAD RESPONSE DEBUG ===');
      console.log('Full response object:', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data?.data);
      console.log('response.data.data?.image_path:', response.data?.data?.image_path);
      console.log('Response status:', response.status);
      console.log('Response success:', response.data?.success);
      
      // Log the entire response structure for debugging
      console.log('Full response JSON:', JSON.stringify(response.data, null, 2));
      
      // Check multiple possible response structures - be more thorough
      let imagePath = null;
      
      // Try response.data.data.image_path first (standard structure)
      if (response.data?.data?.image_path) {
        imagePath = response.data.data.image_path;
        console.log('Found image_path in response.data.data.image_path');
      }
      // Try response.data.image_path (alternative structure)
      else if (response.data?.image_path) {
        imagePath = response.data.image_path;
        console.log('Found image_path in response.data.image_path');
      }
      // Try nested object access
      else if (response.data?.data && typeof response.data.data === 'object') {
        imagePath = response.data.data.image_path;
        console.log('Tried nested object access');
      }
      
      console.log('Extracted image_path:', imagePath);
      console.log('image_path type:', typeof imagePath);
      console.log('image_path truthy check:', !!imagePath);
      console.log('image_path empty check:', imagePath === '' || imagePath === null || imagePath === undefined);
      
      // Verify image_path was saved
      if (imagePath && imagePath !== null && imagePath !== '' && imagePath !== undefined) {
        console.log('✅ Image path saved:', imagePath);
        setImageFile(null);
        setImagePreview(null);
        setShowImageUpload(false);
        // Refresh planning to show the image
        await fetchPlanning(selectedSemester);
        alert('✅ Image uploadée avec succès!');
        return; // Exit early on success
      }
      
      // If we get here, image_path was not in response
      console.error('❌ Image path not in response. Full response structure:');
      console.error('Full response.data:', JSON.stringify(response.data, null, 2));
      console.error('response.data.data type:', typeof response.data?.data);
      console.error('response.data.data value:', response.data?.data);
      console.error('All keys in response.data:', response.data ? Object.keys(response.data) : 'no data');
      console.error('All keys in response.data.data:', response.data?.data ? Object.keys(response.data.data) : 'no data.data');
      
      // Try to refresh anyway - maybe the image was saved but not in response
      console.log('Refreshing planning to check if image_path is available...');
      await fetchPlanning(selectedSemester);
      
      // Wait a moment for state to update, then check
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Re-fetch planning to get fresh data
      const refreshResponse = await axios.get(`/admin/plannings`, {
        params: { semester_id: selectedSemester }
      });
      const refreshedPlanning = refreshResponse.data.data?.[0] || null;
      
      console.log('Refreshed planning from API:', refreshedPlanning);
      console.log('Refreshed planning image_path:', refreshedPlanning?.image_path);
      
      if (refreshedPlanning?.image_path) {
        console.log('✅ Image path found after refresh:', refreshedPlanning.image_path);
        setSelectedPlanning(refreshedPlanning);
        setImageFile(null);
        setImagePreview(null);
        setShowImageUpload(false);
        alert('✅ Image uploadée avec succès! (récupérée après rafraîchissement)');
      } else {
        // Last resort: check if the upload actually succeeded by checking the file exists
        console.error('❌ Image path still not found after refresh');
        console.error('Full refresh response:', JSON.stringify(refreshResponse.data, null, 2));
        alert('⚠️ Upload réussi mais image_path non sauvegardé. Vérifiez les logs serveur et la console.\n\nVérifiez aussi si l\'image apparaît après un rafraîchissement de la page.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Erreur lors de l\'upload';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedPlanning || !window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
    
    try {
      await axios.put(`/admin/plannings/${selectedPlanning.id}`, {
        delete_image: true
      });
      
      fetchPlanning(selectedSemester);
      alert('Image supprimée avec succès!');
    } catch (error) {
      console.error('Error deleting image:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erreur lors de la suppression';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const handleCreateItem = () => {
    setFormData({});
    setEditingItemId(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item) => {
    setFormData({
      module_id: item.module_id,
      group_id: item.group_id,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room || '',
      teacher_name: item.teacher_name || '',
      teacher_email: item.teacher_email || '',
      course_type: item.course_type,
    });
    setEditingItemId(item.id);
    setShowItemForm(true);
  };

  const handleSaveItem = async () => {
    try {
      if (editingItemId) {
        await axios.put(`/admin/planning-items/${editingItemId}`, formData);
      } else {
        await axios.post(`/admin/plannings/${selectedPlanning.id}/items`, formData);
      }
      setShowItemForm(false);
      setFormData({});
      setEditingItemId(null);
      fetchPlanningItems(selectedPlanning.id);
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    try {
      await axios.delete(`/admin/planning-items/${itemId}`);
      fetchPlanningItems(selectedPlanning.id);
    } catch (error) {
      console.error('Error deleting item:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erreur lors de la suppression';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = {
      1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi',
      5: 'Vendredi', 6: 'Samedi', 7: 'Dimanche'
    };
    return days[dayOfWeek] || '';
  };

  const groupByDay = (items) => {
    const grouped = {};
    items?.forEach(item => {
      if (!grouped[item.day_of_week]) {
        grouped[item.day_of_week] = [];
      }
      grouped[item.day_of_week].push(item);
    });
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  };

  const groupedItems = groupByDay(selectedPlanning?.items || []);

  return (
    <div className="space-y-6">
      {/* Filters: Filière → Spécialité → Année → Semestre */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Sélectionner l'emploi du temps</h3>
          {selectedPlanning && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Filière:</span> {filieres.find(f => f.id === selectedFiliere)?.name?.fr || 'N/A'} → 
              <span className="font-semibold"> Spécialité:</span> {specialities.find(s => s.id === selectedSpeciality)?.name?.fr || specialities.find(s => s.id === selectedSpeciality)?.title?.fr || 'N/A'} → 
              <span className="font-semibold"> Année:</span> {years.find(y => y.id === selectedYear)?.name?.fr || 'N/A'} → 
              <span className="font-semibold"> Semestre:</span> {semesters.find(s => s.id === selectedSemester)?.name?.fr || 'N/A'}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Sélectionnez dans l'ordre: Filière → Spécialité → Année → Semestre pour gérer l'emploi du temps
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filière *
            </label>
            <select
              value={selectedFiliere || ''}
              onChange={(e) => {
                const filiereId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedFiliere(filiereId);
                setSelectedSpeciality(null);
                setSelectedYear(null);
                setSelectedSemester(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Sélectionner une filière...</option>
              {filieres.map(filiere => (
                <option key={filiere.id} value={filiere.id}>
                  {filiere.name?.fr || filiere.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spécialité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spécialité *
            </label>
            <select
              value={selectedSpeciality || ''}
              onChange={(e) => {
                const specialityId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedSpeciality(specialityId);
                setSelectedYear(null);
                setSelectedSemester(null);
              }}
              disabled={!selectedFiliere}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner une spécialité...</option>
              {specialities.map(speciality => (
                <option key={speciality.id} value={speciality.id}>
                  {speciality.name?.fr || speciality.title?.fr || speciality.name}
                </option>
              ))}
            </select>
          </div>

          {/* Année */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année *
            </label>
            <select
              value={selectedYear || ''}
              onChange={(e) => {
                const yearId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedYear(yearId);
                setSelectedSemester(null);
              }}
              disabled={!selectedSpeciality}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner une année...</option>
              {years.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name?.fr || `Année ${year.year_number}`}
                </option>
              ))}
            </select>
          </div>

          {/* Semestre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semestre *
            </label>
            <select
              value={selectedSemester || ''}
              onChange={(e) => setSelectedSemester(e.target.value ? parseInt(e.target.value) : null)}
              disabled={!selectedYear}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner un semestre...</option>
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name?.fr || `Semestre ${semester.semester_number}`} - {semester.academic_year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Publish Button */}
        {selectedPlanning && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handlePublish(selectedPlanning.id)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                selectedPlanning.is_published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <FaCheckCircle className="mr-2" />
              {selectedPlanning.is_published ? 'Publié' : 'Publier'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : !selectedSemester ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Sélectionnez un semestre pour gérer l'emploi du temps</p>
          <p className="text-gray-400 text-sm mt-2">
            Utilisez les filtres ci-dessus pour choisir: Filière → Spécialité → Année → Semestre
          </p>
        </div>
      ) : selectedSemester && !selectedPlanning ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Aucun emploi du temps pour ce semestre</h3>
            <p className="text-gray-600 mb-6">
              Créez un emploi du temps pour uploader une image (PNG/JPG)
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => handleCreatePlanning(false)}
                className="bg-primary text-white px-6 py-3 rounded-lg flex items-center hover:bg-primary-dark transition text-lg"
              >
                <FaPlus className="mr-2" /> Créer l'emploi du temps
              </button>
              <button 
                onClick={() => setShowImageUpload(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-blue-700 transition text-lg"
              >
                <FaPlus className="mr-2" /> Créer avec une image
              </button>
            </div>
          </div>

          {/* Image Upload Form for New Planning */}
          {showImageUpload && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h4 className="font-bold mb-4 text-lg text-blue-900">📸 Créer l'emploi du temps avec une image</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Sélectionner une image (PNG ou JPG, max 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="w-full border-2 border-dashed border-blue-300 rounded-lg px-4 py-3 bg-white hover:border-blue-400 transition cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formats acceptés: PNG, JPG, JPEG | Taille max: 10MB
                  </p>
                </div>
                {imagePreview && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm font-medium mb-2 text-gray-700">Aperçu de l'image:</p>
                    <div className="flex justify-center">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full h-auto max-h-96 border-2 border-gray-300 rounded-lg shadow-md"
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleCreatePlanning(true)}
                    disabled={!imageFile}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition font-medium flex-1"
                  >
                    ✅ Créer avec cette image
                  </button>
                  <button
                    onClick={() => {
                      setShowImageUpload(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Annuler
                  </button>
                </div>
                {!imageFile && (
                  <p className="text-sm text-orange-600 text-center mt-2">
                    ⚠️ Veuillez sélectionner une image avant de créer l'emploi du temps
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : selectedPlanning ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold">Emploi du temps</h3>
              <p className="text-sm text-gray-600 mt-1">
                {semesters.find(s => s.id === selectedSemester)?.name?.fr || 'Semestre'} - 
                {semesters.find(s => s.id === selectedSemester)?.academic_year || ''}
              </p>
            </div>
            <div className="flex gap-2">
              {!selectedPlanning && (
                <button 
                  onClick={handleCreatePlanning}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition"
                >
                  <FaPlus className="mr-2" /> Créer l'emploi du temps
                </button>
              )}
              {selectedPlanning && (
                <>
                  <button 
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                  >
                    <FaPlus className="mr-2" /> {selectedPlanning.image_path ? 'Remplacer l\'image' : 'Ajouter une image'}
                  </button>
                  {selectedPlanning.image_path && (
                    <button 
                      onClick={handleDeleteImage}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition"
                    >
                      <FaTrash className="mr-2" /> Supprimer l'image
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Image Upload Form */}
          {showImageUpload && selectedPlanning && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-bold mb-4">Uploader une image (PNG/JPG)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sélectionner une image</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                {imagePreview && (
                  <div>
                    <p className="text-sm font-medium mb-2">Aperçu:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-64 border rounded-lg"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleUploadImage}
                    disabled={!imageFile}
                    className="bg-primary text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Uploader
                  </button>
                  <button
                    onClick={() => {
                      setShowImageUpload(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display Planning Image - Main Content */}
          {!showImageUpload && selectedPlanning && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {selectedPlanning.image_path ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xl text-gray-800">Emploi du temps</h4>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {semesters.find(s => s.id === selectedSemester)?.academic_year || ''}
                    </span>
                  </div>
                  <div className="flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-gray-200">
                    {(() => {
                      const imageUrl = selectedPlanning.image_path.startsWith('http') 
                        ? selectedPlanning.image_path 
                        : `${window.location.protocol}//${window.location.host}/storage/${selectedPlanning.image_path}`;
                      console.log('Displaying image:', imageUrl);
                      return (
                        <img 
                          src={imageUrl}
                          alt="Emploi du temps" 
                          className="max-w-full h-auto border-4 border-white rounded-lg shadow-2xl"
                          style={{ maxHeight: '80vh' }}
                          onError={(e) => {
                            console.error('Image load error:', e);
                            console.error('Image path:', selectedPlanning.image_path);
                            console.error('Constructed URL:', imageUrl);
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h4 className="font-bold text-xl mb-2 text-gray-700">Aucune image d'emploi du temps</h4>
                  <p className="text-gray-600 mb-6">
                    Cliquez sur <span className="font-semibold text-blue-600">"Ajouter une image"</span> ci-dessus pour uploader l'emploi du temps
                  </p>
                  <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      📸 Formats acceptés: PNG, JPG, JPEG<br/>
                      📏 Taille maximum: 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Course management form - Hidden, only image is used */}
          {false && showItemForm && selectedPlanning && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-bold mb-4">{editingItemId ? 'Modifier' : 'Nouveau'} Cours</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Module *</label>
                  <select
                    value={formData.module_id || ''}
                    onChange={(e) => setFormData({...formData, module_id: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.title?.fr || m.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Groupe (optionnel)</label>
                  <select
                    value={formData.group_id || ''}
                    onChange={(e) => setFormData({...formData, group_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Tous les groupes</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jour *</label>
                  <select
                    value={formData.day_of_week || ''}
                    onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="1">Lundi</option>
                    <option value="2">Mardi</option>
                    <option value="3">Mercredi</option>
                    <option value="4">Jeudi</option>
                    <option value="5">Vendredi</option>
                    <option value="6">Samedi</option>
                    <option value="7">Dimanche</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type de cours *</label>
                  <select
                    value={formData.course_type || ''}
                    onChange={(e) => setFormData({...formData, course_type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="cours">Cours</option>
                    <option value="td">TD</option>
                    <option value="tp">TP</option>
                    <option value="examen">Examen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heure de début *</label>
                  <input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heure de fin *</label>
                  <input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salle</label>
                  <input
                    type="text"
                    value={formData.room || ''}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Salle A101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Enseignant</label>
                  <input
                    type="text"
                    value={formData.teacher_name || ''}
                    onChange={(e) => setFormData({...formData, teacher_name: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Dr. Ahmed"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Email enseignant</label>
                  <input
                    type="email"
                    value={formData.teacher_email || ''}
                    onChange={(e) => setFormData({...formData, teacher_email: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="ahmed@example.com"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveItem}
                  className="bg-primary text-white px-4 py-2 rounded-lg"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setShowItemForm(false);
                    setFormData({});
                    setEditingItemId(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Course list view - Hidden, only image is displayed */}
          {false && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(dayOfWeek => (
                <div key={dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-primary mb-4 text-center">
                    {getDayName(dayOfWeek)}
                  </h4>
                  <div className="space-y-3">
                    {groupedItems[dayOfWeek]?.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-l-4 rounded p-3 bg-gray-50 hover:bg-gray-100 transition"
                        style={{
                          borderLeftColor: item.course_type === 'cours' ? '#3B82F6' :
                                         item.course_type === 'td' ? '#10B981' :
                                         item.course_type === 'tp' ? '#F97316' : '#EF4444'
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-text-dark">
                              {item.module?.title?.fr || item.module?.code}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.module?.code}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              <FaTrash />
                            </button>
                          </div>
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
                          {item.group && (
                            <div className="flex items-center">
                              <FaUsers className="mr-1" />
                              {item.group.name}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {(!groupedItems[dayOfWeek] || groupedItems[dayOfWeek].length === 0) && (
                      <p className="text-center text-gray-400 text-sm py-4">Aucun cours</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun emploi du temps disponible</p>
          <p className="text-gray-400 text-sm mt-2">
            {selectedSemester ? 'Créez un emploi du temps pour ce semestre' : 'Sélectionnez un semestre'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanningManagement;

