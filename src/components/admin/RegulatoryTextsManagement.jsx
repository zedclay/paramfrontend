import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaFileAlt, FaImage, FaDownload, FaGavel } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logger from '../../utils/logger';
import { handleApiError } from '../../utils/apiErrorHandler';

const RegulatoryTextsManagement = () => {
  const [regulatoryTexts, setRegulatoryTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_ar: '',
    content_fr: '',
    content_ar: '',
    is_published: false,
    target_audience: 'all',
    image: null, // Principal image
    images: [], // Multiple images array
    file: null,
    remove_image: false,
    remove_file: false,
    remove_images: [], // IDs of images to remove
  });
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchRegulatoryTexts();
  }, []);

  const fetchRegulatoryTexts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/regulatory-texts');
      setRegulatoryTexts(response.data.data || []);
      if (response.data.data && response.data.data.length === 0) {
        setMessage({ type: 'info', text: 'Aucun texte réglementaire trouvé. Créez votre premier texte réglementaire!' });
      }
    } catch (error) {
      logger.error('Error fetching regulatory texts:', error);
      const { message: errorMsg } = handleApiError(error);
      
      // More detailed error message
      let detailedError = errorMsg;
      if (error.response?.status === 401 || error.response?.status === 403) {
        detailedError = 'Non authentifié. Veuillez vous reconnecter.';
      } else if (error.response?.status === 404) {
        detailedError = 'Endpoint non trouvé. Vérifiez que le backend est déployé.';
      } else if (error.response?.status === 500) {
        detailedError = 'Erreur serveur. Vérifiez les logs du backend.';
      } else if (!error.response) {
        detailedError = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `Erreur lors du chargement des textes réglementaires: ${detailedError}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (regulatoryText) => {
    setEditingId(regulatoryText.id);
    setFormData({
      title_fr: regulatoryText.title?.fr || '',
      title_ar: regulatoryText.title?.ar || '',
      content_fr: regulatoryText.content?.fr || '',
      content_ar: regulatoryText.content?.ar || '',
      is_published: regulatoryText.is_published || false,
      target_audience: regulatoryText.target_audience || 'all',
      image: null,
      images: [],
      file: null,
      remove_image: false,
      remove_file: false,
      remove_images: [],
    });
    setExistingImages(regulatoryText.images || []);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      title_fr: '',
      title_ar: '',
      content_fr: '',
      content_ar: '',
      is_published: false,
      target_audience: 'all',
      image: null,
      images: [],
      file: null,
      remove_image: false,
      remove_file: false,
      remove_images: [],
    });
    setExistingImages([]);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    // Create FormData to support file uploads
    const formDataToSend = new FormData();
    formDataToSend.append('title[fr]', formData.title_fr);
    formDataToSend.append('title[ar]', formData.title_ar || '');
    formDataToSend.append('content[fr]', formData.content_fr);
    formDataToSend.append('content[ar]', formData.content_ar || '');
    formDataToSend.append('is_published', formData.is_published ? '1' : '0');
    formDataToSend.append('target_audience', formData.target_audience);

    // Add principal image if selected
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    
    // Add multiple images if selected
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        formDataToSend.append('images[]', img);
      });
    }
    
    if (formData.file) {
      formDataToSend.append('file', formData.file);
    }

    // Add removal flags for update
    if (editingId) {
      if (formData.remove_image) {
        formDataToSend.append('remove_image', '1');
      }
      if (formData.remove_file) {
        formDataToSend.append('remove_file', '1');
      }
      // Add IDs of images to remove
      if (formData.remove_images && formData.remove_images.length > 0) {
        formData.remove_images.forEach((imageId) => {
          formDataToSend.append('remove_images[]', imageId);
        });
      }
    }

    try {
      if (editingId) {
        await axios.put(`/admin/regulatory-texts/${editingId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'Texte réglementaire modifié avec succès!' });
      } else {
        await axios.post('/admin/regulatory-texts', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'Texte réglementaire créé avec succès!' });
      }
      handleCloseModal();
      fetchRegulatoryTexts();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      logger.error('Error saving regulatory text:', error);
      const { message: errorMsg } = handleApiError(error);
      setMessage({ 
        type: 'error', 
        text: `Erreur: ${errorMsg}` 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce texte réglementaire?')) return;
    try {
      await axios.delete(`/admin/regulatory-texts/${id}`);
      setMessage({ type: 'success', text: 'Texte réglementaire supprimé avec succès!' });
      fetchRegulatoryTexts();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting regulatory text:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de la suppression: ' + (error.response?.data?.error?.message || 'Erreur inconnue') 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-dark">Gestion des textes réglementaires</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title_fr: '',
              title_ar: '',
              content_fr: '',
              content_ar: '',
              is_published: false,
              target_audience: 'all',
              image: null,
              images: [],
              file: null,
              remove_image: false,
              remove_file: false,
              remove_images: [],
            });
            setExistingImages([]);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center transition"
        >
          <FaPlus className="mr-2" /> Nouveau texte réglementaire
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : message.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : regulatoryTexts.length > 0 ? (
          <div className="space-y-4">
            {regulatoryTexts.map((regulatoryText) => (
              <motion.div 
                key={regulatoryText.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-text-dark">{regulatoryText.title?.fr || regulatoryText.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        regulatoryText.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {regulatoryText.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {regulatoryText.content?.fr || regulatoryText.content}
                    </p>
                    {/* Display attached files */}
                    {(regulatoryText.image_path || regulatoryText.file_path || (regulatoryText.images && regulatoryText.images.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {regulatoryText.image_path && (
                          <a
                            href={regulatoryText.image_url || `/storage/${regulatoryText.image_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FaImage /> Image principale
                          </a>
                        )}
                        {regulatoryText.images && regulatoryText.images.length > 0 && (
                          <span className="flex items-center gap-2 text-blue-600 text-sm">
                            <FaImage /> {regulatoryText.images.length} image(s) supplémentaire(s)
                          </span>
                        )}
                        {regulatoryText.file_path && (
                          <a
                            href={regulatoryText.file_url || `/storage/${regulatoryText.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            <FaFileAlt /> {regulatoryText.file_filename || 'Fichier'}
                            <FaDownload className="text-xs" />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span>Créé le: {new Date(regulatoryText.created_at).toLocaleDateString('fr-FR')}</span>
                      {regulatoryText.published_at && (
                        <span>Publié le: {new Date(regulatoryText.published_at).toLocaleDateString('fr-FR')}</span>
                      )}
                      {regulatoryText.target_audience && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {regulatoryText.target_audience === 'all' ? 'Tous' : 
                           regulatoryText.target_audience === 'students' ? 'Étudiants' : 
                           'Spécialité'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleEdit(regulatoryText)}
                      className="text-blue-600 hover:text-blue-800 transition p-2 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(regulatoryText.id)} 
                      className="text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">Aucun texte réglementaire pour le moment</p>
            <p className="text-gray-400 text-sm">Cliquez sur "Nouveau texte réglementaire" pour créer votre premier texte réglementaire</p>
          </div>
        )}
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
                {editingId ? 'Modifier le texte réglementaire' : 'Nouveau texte réglementaire'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {message.text && message.type !== 'success' && (
              <div className={`p-3 rounded-lg mb-4 ${
                message.type === 'error' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (FR)</label>
                  <input
                    type="text"
                    required
                    value={formData.title_fr}
                    onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (AR)</label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contenu (FR)</label>
                  <textarea
                    required
                    value={formData.content_fr}
                    onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contenu (AR)</label>
                  <textarea
                    value={formData.content_ar}
                    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Public cible</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="students">Étudiants uniquement</option>
                    <option value="specific_specialite">Spécialité spécifique</option>
                  </select>
                </div>
                {/* Principal Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image Principale (JPG, PNG - Max 10MB)</label>
                  {formData.image ? (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">{formData.image.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: null })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] || null })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {editingId && (
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={formData.remove_image}
                            onChange={(e) => setFormData({ ...formData, remove_image: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-xs text-gray-600">Supprimer l'image principale existante</span>
                        </label>
                      )}
                    </>
                  )}
                </div>

                {/* Multiple Images Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Images supplémentaires (peuvent être ajoutées sous la description) (JPG, PNG - Max 10MB chacune)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData({ ...formData, images: [...formData.images, ...files] });
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600">{img.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Existing images in edit mode */}
                  {editingId && existingImages.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">Images existantes:</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative border rounded p-2">
                            <img
                              src={img.image_url || `/storage/${img.image_path}`}
                              alt={img.image_filename}
                              className="w-full h-24 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <label className="flex items-center mt-2">
                              <input
                                type="checkbox"
                                checked={formData.remove_images.includes(img.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      remove_images: [...formData.remove_images, img.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      remove_images: formData.remove_images.filter(id => id !== img.id)
                                    });
                                  }
                                }}
                                className="mr-1"
                              />
                              <span className="text-xs text-gray-600">Supprimer</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Fichier (PDF, DOC, DOCX, etc. - Max 10MB)</label>
                  {formData.file ? (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">{formData.file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, file: null })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        onChange={(e) => setFormData({ ...formData, file: e.target.files[0] || null })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {editingId && (
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={formData.remove_file}
                            onChange={(e) => setFormData({ ...formData, remove_file: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-xs text-gray-600">Supprimer le fichier existant</span>
                        </label>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Publier immédiatement</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Si coché, le texte réglementaire sera visible par les utilisateurs immédiatement
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center"
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
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryTextsManagement;
