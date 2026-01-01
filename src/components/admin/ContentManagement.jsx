import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logger from '../../utils/logger';
import { handleApiError } from '../../utils/apiErrorHandler';
import { getMultilingualValue } from '../../utils/multilingual';

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // If it starts with /storage, use it as-is (relative to current domain)
  // The browser will resolve it relative to the current origin
  if (imageUrl.startsWith('/storage')) {
    return imageUrl;
  }
  // If it doesn't start with /, it might be a relative path - keep it as is
  return imageUrl;
};

// Helper function to get display value for admin panel (prefer FR, fallback to AR, EN, or first available)
const getDisplayValue = (multilingualObj, fallback = '') => {
  if (!multilingualObj) return fallback;
  if (typeof multilingualObj === 'string') return multilingualObj;
  if (typeof multilingualObj !== 'object') return fallback;
  
  // Try FR first (admin default), then AR, then EN, then any available
  return multilingualObj.fr || multilingualObj.ar || multilingualObj.en || Object.values(multilingualObj)[0] || fallback;
};

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('filieres');
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [modules, setModules] = useState([]);
  const [allFilieres, setAllFilieres] = useState([]); // For speciality form
  const [allSpecialites, setAllSpecialites] = useState([]); // For module form
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState(null); // For filiere image preview
  const [submitting, setSubmitting] = useState(false); // For loading state

  useEffect(() => {
    fetchData();
    // Always fetch filieres for the speciality form selector
    if (activeTab === 'specialites' && allFilieres.length === 0) {
      fetchAllFilieres();
    }
    // Always fetch specialites for the module form selector
    if (activeTab === 'modules' && allSpecialites.length === 0) {
      fetchAllSpecialites();
    }
  }, [activeTab]);

  const fetchAllFilieres = async () => {
    try {
      const response = await axios.get('/admin/filieres');
      setAllFilieres(response.data.data || []);
    } catch (error) {
      console.error('Error fetching filieres:', error);
    }
  };

  const fetchAllSpecialites = async () => {
    try {
      const response = await axios.get('/admin/specialites');
      setAllSpecialites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching specialites:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'filieres') {
        const response = await axios.get('/admin/filieres');
        setFilieres(response.data.data || []);
      } else if (activeTab === 'specialites') {
        const response = await axios.get('/admin/specialites');
        setSpecialites(response.data.data || []);
      } else if (activeTab === 'modules') {
        const response = await axios.get('/admin/modules');
        setModules(response.data.data || []);
      }
    } catch (error) {
      logger.error('Error fetching data:', error);
      const { message: errorMsg } = handleApiError(error);
      setMessage({ type: 'error', text: `Erreur lors du chargement des données: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    // Clean the item data and map relationships to IDs
    const cleanItem = { ...item };
    
    // Map speciality relationship to specialite_id for modules
    if (activeTab === 'modules' && item.speciality && item.speciality.id) {
      cleanItem.specialite_id = item.speciality.id;
    }
    
    // Map filiere relationship to filiere_id for specialities
    if (activeTab === 'specialites' && item.filiere && item.filiere.id) {
      cleanItem.filiere_id = item.filiere.id;
    }
    
    // Remove relationship objects and other non-form fields
    delete cleanItem.speciality;
    delete cleanItem.filiere;
    delete cleanItem.created_at;
    delete cleanItem.updated_at;
    
    setFormData(cleanItem);
    setImagePreview(item.image_url || null);
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
      await axios.delete(`/admin/${type}/${id}`);
      setMessage({ type: 'success', text: 'Élément supprimé avec succès' });
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      logger.error('Error deleting:', error);
      const { message: errorMsg } = handleApiError(error);
      setMessage({ type: 'error', text: `Erreur lors de la suppression: ${errorMsg}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({});
    setImagePreview(null);
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const type = activeTab;
      
      // For filieres, use FormData if image is uploaded OR if updating with existing image_url
      if (activeTab === 'filieres' && (formData.image || editingId)) {
        const formDataToSend = new FormData();
        
        // Append name fields
        if (formData.name) {
          Object.keys(formData.name).forEach((lang) => {
            if (formData.name[lang]) {
              formDataToSend.append(`name[${lang}]`, formData.name[lang]);
            }
          });
        }
        
        // Append description fields
        if (formData.description) {
          Object.keys(formData.description).forEach((lang) => {
            if (formData.description[lang]) {
              formDataToSend.append(`description[${lang}]`, formData.description[lang]);
            }
          });
        }
        
        // Append image if it's a File object
        if (formData.image instanceof File) {
          formDataToSend.append('image', formData.image);
        }
        
        // Append order
        if (formData.order !== undefined) {
          formDataToSend.append('order', formData.order);
        }
        
        // Append remove_image flag if needed
        if (formData.remove_image) {
          formDataToSend.append('remove_image', '1');
        }
        
        // For updates, also send existing fields
        if (editingId && !formData.image && !formData.remove_image && formData.image_url) {
          formDataToSend.append('image_url', formData.image_url);
        }
        
        if (editingId) {
          await axios.put(`/admin/${type}/${editingId}`, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setMessage({ type: 'success', text: 'Élément modifié avec succès' });
        } else {
          await axios.post(`/admin/${type}`, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setMessage({ type: 'success', text: 'Élément créé avec succès' });
        }
      } else {
        // For other types or if no image, use regular JSON
        // Clean the data to only include valid fields
        let dataToSend = {};
        
        if (activeTab === 'specialites') {
          // Only send allowed fields for specialities
          if (formData.filiere_id !== undefined) {
            dataToSend.filiere_id = parseInt(formData.filiere_id);
          }
          if (formData.name !== undefined) {
            dataToSend.name = formData.name;
          }
          if (formData.description !== undefined) {
            dataToSend.description = formData.description;
          }
          if (formData.duration !== undefined) {
            dataToSend.duration = formData.duration;
          }
          if (formData.order !== undefined) {
            dataToSend.order = parseInt(formData.order) || 0;
          }
          if (formData.is_active !== undefined) {
            dataToSend.is_active = formData.is_active;
          }
        } else if (activeTab === 'modules') {
          // Only send allowed fields for modules
          if (formData.code !== undefined) {
            dataToSend.code = formData.code;
          }
          if (formData.title !== undefined) {
            dataToSend.title = formData.title;
          }
          if (formData.description !== undefined) {
            dataToSend.description = formData.description;
          }
          if (formData.specialite_id !== undefined) {
            dataToSend.specialite_id = parseInt(formData.specialite_id);
          }
          if (formData.credits !== undefined) {
            dataToSend.credits = formData.credits ? parseInt(formData.credits) : null;
          }
          if (formData.hours !== undefined) {
            dataToSend.hours = formData.hours ? parseInt(formData.hours) : null;
          }
          if (formData.order !== undefined) {
            dataToSend.order = parseInt(formData.order) || 0;
          }
          if (formData.is_active !== undefined) {
            dataToSend.is_active = formData.is_active;
          }
        } else {
          // Fallback: use all formData (shouldn't happen)
          dataToSend = { ...formData };
          if (dataToSend.filiere_id) {
            dataToSend.filiere_id = parseInt(dataToSend.filiere_id);
          }
        }

        if (editingId) {
          await axios.put(`/admin/${type}/${editingId}`, dataToSend);
          setMessage({ type: 'success', text: 'Élément modifié avec succès' });
        } else {
          await axios.post(`/admin/${type}`, dataToSend);
          setMessage({ type: 'success', text: 'Élément créé avec succès' });
        }
      }

      handleCloseModal();
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      logger.error('Error saving:', error);
      const { message: errorMsg } = handleApiError(error);
      setMessage({ type: 'error', text: `Erreur lors de l'enregistrement: ${errorMsg}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({});
    setImagePreview(null);
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file, remove_image: false });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null, remove_image: true, image_url: null });
    setImagePreview(null);
  };

  const getTypeLabel = () => {
    if (activeTab === 'filieres') return 'Filière';
    if (activeTab === 'specialites') return 'Spécialité';
    return 'Module';
  };

  const getCurrentItems = () => {
    if (activeTab === 'filieres') return filieres;
    if (activeTab === 'specialites') return specialites;
    return modules;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Gestion du contenu</h2>
        <button
          onClick={handleCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center transition"
        >
          <FaPlus className="mr-2" /> Nouveau {getTypeLabel()}
        </button>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            {['filieres', 'specialites', 'modules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500'
                }`}
              >
                {tab === 'filieres' ? 'Filières' : tab === 'specialites' ? 'Spécialités' : 'Modules'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="space-y-4">
              {getCurrentItems().length > 0 ? (
                getCurrentItems().map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
                    <div className="flex-1 flex items-center gap-4">
                      {activeTab === 'filieres' && item.image_url && (
                        <img 
                          src={getImageUrl(item.image_url)} 
                          alt={getDisplayValue(item.name)} 
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            logger.debug('Image failed to load:', item.image_url);
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {activeTab === 'modules' 
                            ? `${item.code || ''} - ${getDisplayValue(item.title)}`.trim()
                            : getDisplayValue(item.name)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getDisplayValue(activeTab === 'modules' ? item.description : item.description)?.substring(0, 100) || ''}...
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(activeTab, item.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Aucun élément trouvé
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-text-dark">
                {editingId ? `Modifier ${getTypeLabel()}` : `Nouveau ${getTypeLabel()}`}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {message.text && message.type === 'error' && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              {activeTab === 'filieres' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom (FR) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name?.fr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: { ...formData.name, fr: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom (AR)</label>
                    <input
                      type="text"
                      value={formData.name?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: { ...formData.name, ar: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom (EN)</label>
                    <input
                      type="text"
                      value={formData.name?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: { ...formData.name, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (FR)</label>
                    <textarea
                      value={formData.description?.fr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, fr: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (AR)</label>
                    <textarea
                      value={formData.description?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, ar: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (EN)</label>
                    <textarea
                      value={formData.description?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Image</label>
                    {imagePreview || formData.image_url ? (
                      <div className="mb-2">
                        <img 
                          src={imagePreview || getImageUrl(formData.image_url)} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border"
                          onError={(e) => {
                            logger.debug('Preview image failed to load:', formData.image_url);
                            e.target.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Supprimer l'image
                        </button>
                      </div>
                    ) : null}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPEG, PNG (max 10MB)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ordre</label>
                    <input
                      type="number"
                      value={formData.order || 0}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === 'specialites' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Filière *</label>
                    <select
                      required
                      value={formData.filiere_id || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        filiere_id: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner une filière</option>
                      {allFilieres.map((filiere) => (
                        <option key={filiere.id} value={filiere.id}>
                          {getDisplayValue(filiere.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom (FR) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name?.fr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: { ...formData.name, fr: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom (AR)</label>
                    <input
                      type="text"
                      value={formData.name?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: { ...formData.name, ar: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom (EN)</label>
                    <input
                      type="text"
                      value={formData.name?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: { ...formData.name, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (FR)</label>
                    <textarea
                      value={formData.description?.fr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, fr: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (AR)</label>
                    <textarea
                      value={formData.description?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, ar: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (EN)</label>
                    <textarea
                      value={formData.description?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Durée</label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        duration: e.target.value
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Ex: 3 ans"
                    />
                  </div>
                </>
              )}

              {activeTab === 'modules' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Spécialité *</label>
                    <select
                      required
                      value={formData.specialite_id || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        specialite_id: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner une spécialité</option>
                      {allSpecialites.map((specialite) => (
                        <option key={specialite.id} value={specialite.id}>
                          {getDisplayValue(specialite.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre (FR) *</label>
                    <input
                      type="text"
                      required
                      value={formData.title?.fr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, fr: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre (AR)</label>
                    <input
                      type="text"
                      value={formData.title?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, ar: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre (EN)</label>
                    <input
                      type="text"
                      value={formData.title?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        title: { ...formData.title, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (FR)</label>
                    <textarea
                      value={formData.description?.fr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, fr: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (AR)</label>
                    <textarea
                      value={formData.description?.ar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, ar: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (EN)</label>
                    <textarea
                      value={formData.description?.en || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        description: { ...formData.description, en: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className={`flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition flex items-center justify-center ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  editingId ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
