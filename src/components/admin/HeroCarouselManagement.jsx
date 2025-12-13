import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaArrowUp, FaArrowDown, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HeroCarouselManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_ar: '',
    title_en: '',
    subtitle_fr: '',
    subtitle_ar: '',
    subtitle_en: '',
    image: null,
    order: 0,
    is_active: true,
    gradient: 'from-blue-600 to-cyan-500',
    remove_image: false,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/hero-slides');
      setSlides(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors du chargement des slides: ' + (error.response?.data?.error?.message || 'Erreur inconnue') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setFormData({
      title_fr: slide.title?.fr || '',
      title_ar: slide.title?.ar || '',
      title_en: slide.title?.en || '',
      subtitle_fr: slide.subtitle?.fr || '',
      subtitle_ar: slide.subtitle?.ar || '',
      subtitle_en: slide.subtitle?.en || '',
      image: null,
      order: slide.order || 0,
      is_active: slide.is_active ?? true,
      gradient: slide.gradient || 'from-blue-600 to-cyan-500',
      remove_image: false,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      title_fr: '',
      title_ar: '',
      title_en: '',
      subtitle_fr: '',
      subtitle_ar: '',
      subtitle_en: '',
      image: null,
      order: 0,
      is_active: true,
      gradient: 'from-blue-600 to-cyan-500',
      remove_image: false,
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formDataToSend = new FormData();
    formDataToSend.append('title[fr]', formData.title_fr);
    formDataToSend.append('title[ar]', formData.title_ar || '');
    formDataToSend.append('title[en]', formData.title_en || '');
    formDataToSend.append('subtitle[fr]', formData.subtitle_fr || '');
    formDataToSend.append('subtitle[ar]', formData.subtitle_ar || '');
    formDataToSend.append('subtitle[en]', formData.subtitle_en || '');
    formDataToSend.append('order', formData.order);
    formDataToSend.append('is_active', formData.is_active ? '1' : '0');
    formDataToSend.append('gradient', formData.gradient);

    if (editingId) {
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (formData.remove_image) {
        formDataToSend.append('remove_image', '1');
      }
    } else {
      if (!formData.image) {
        setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
        setSubmitting(false);
        return;
      }
      formDataToSend.append('image', formData.image);
    }

    try {
      if (editingId) {
        await axios.put(`/admin/hero-slides/${editingId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'Slide modifié avec succès!' });
      } else {
        await axios.post('/admin/hero-slides', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'Slide créé avec succès!' });
      }
      handleCloseModal();
      fetchSlides();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving slide:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur: ' + (error.response?.data?.error?.message || error.response?.data?.error?.details || 'Erreur inconnue') 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce slide?')) return;
    try {
      await axios.delete(`/admin/hero-slides/${id}`);
      setMessage({ type: 'success', text: 'Slide supprimé avec succès!' });
      fetchSlides();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting slide:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de la suppression: ' + (error.response?.data?.error?.message || 'Erreur inconnue') 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleOrderChange = async (id, direction) => {
    const slide = slides.find(s => s.id === id);
    if (!slide) return;

    const currentOrder = slide.order;
    const targetSlide = slides.find(s => s.order === (direction === 'up' ? currentOrder - 1 : currentOrder + 1));
    
    if (!targetSlide && direction === 'up') return;
    if (!targetSlide && direction === 'down') return;

    try {
      // Swap orders
      await axios.put(`/admin/hero-slides/${id}`, { order: targetSlide.order });
      await axios.put(`/admin/hero-slides/${targetSlide.id}`, { order: currentOrder });
      fetchSlides();
    } catch (error) {
      console.error('Error updating order:', error);
      setMessage({ type: 'error', text: 'Erreur lors du changement d\'ordre' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-dark">Gestion du Carousel</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title_fr: '',
              title_ar: '',
              title_en: '',
              subtitle_fr: '',
              subtitle_ar: '',
              subtitle_en: '',
              image: null,
              order: slides.length,
              is_active: true,
              gradient: 'from-blue-600 to-cyan-500',
              remove_image: false,
            });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center transition"
        >
          <FaPlus className="mr-2" /> Nouveau Slide
        </button>
      </div>

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
        ) : slides.length > 0 ? (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <motion.div 
                key={slide.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleOrderChange(slide.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Déplacer vers le haut"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => handleOrderChange(slide.id, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Déplacer vers le bas"
                    >
                      <FaArrowDown />
                    </button>
                  </div>

                  {/* Preview Image */}
                  {slide.image_path && (
                    <div className="w-24 h-16 overflow-hidden rounded bg-gray-100">
                      <img
                        src={slide.image_url || `/storage/${slide.image_path}`}
                        alt={slide.title?.fr || slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-text-dark">
                        {slide.title?.fr || slide.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        slide.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {slide.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                        Ordre: {slide.order}
                      </span>
                    </div>
                    {slide.subtitle?.fr && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {slide.subtitle.fr}
                      </p>
                    )}
                    {slide.gradient && (
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                        Gradient: {slide.gradient}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(slide)}
                      className="text-blue-600 hover:text-blue-800 transition p-2 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(slide.id)} 
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
            <p className="text-gray-500 text-lg mb-2">Aucun slide pour le moment</p>
            <p className="text-gray-400 text-sm">Cliquez sur "Nouveau Slide" pour créer votre premier slide</p>
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
                {editingId ? 'Modifier le slide' : 'Nouveau slide'}
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
                {/* Titles */}
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (FR) *</label>
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
                  <label className="block text-sm font-medium mb-2">Titre (EN)</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Subtitles */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sous-titre (FR)</label>
                  <textarea
                    value={formData.subtitle_fr}
                    onChange={(e) => setFormData({ ...formData, subtitle_fr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sous-titre (AR)</label>
                  <textarea
                    value={formData.subtitle_ar}
                    onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sous-titre (EN)</label>
                  <textarea
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image {!editingId && '*'} (JPG, PNG - Max 10MB)
                  </label>
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
                        required={!editingId}
                      />
                      {editingId && (
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={formData.remove_image}
                            onChange={(e) => setFormData({ ...formData, remove_image: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-xs text-gray-600">Supprimer l'image existante</span>
                        </label>
                      )}
                    </>
                  )}
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ordre d'affichage</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Les slides avec un ordre plus petit apparaissent en premier
                  </p>
                </div>

                {/* Gradient */}
                <div>
                  <label className="block text-sm font-medium mb-2">Classe de gradient CSS</label>
                  <input
                    type="text"
                    value={formData.gradient}
                    onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                    placeholder="from-blue-600 to-cyan-500"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Classes Tailwind CSS pour le gradient (optionnel)
                  </p>
                </div>

                {/* Active */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Actif</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Seuls les slides actifs seront affichés sur la page d'accueil
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

export default HeroCarouselManagement;
