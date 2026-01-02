import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logger from '../../utils/logger';
import { handleApiError } from '../../utils/apiErrorHandler';
import { getMultilingualValue } from '../../utils/multilingual';

// Helper function to get full image URL with cache busting
const getImageUrl = (imageUrl, cacheBust = false) => {
  if (!imageUrl) return null;
  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (cacheBust) {
      return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    return imageUrl;
  }
  // If it starts with /storage, use it as-is (relative to current domain)
  // The browser will resolve it relative to the current origin
  if (imageUrl.startsWith('/storage')) {
    if (cacheBust) {
      return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    return imageUrl;
  }
  // If it doesn't start with /, it might be a relative path - keep it as is
  if (cacheBust) {
    return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
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
  const [showImageModal, setShowImageModal] = useState(false); // For image update modal
  const [imageUploadId, setImageUploadId] = useState(null); // ID of filiere for image update
  const [imageUploadFile, setImageUploadFile] = useState(null); // Selected image file
  const [imageUploadPreview, setImageUploadPreview] = useState(null); // Preview of selected image
  const [uploadingImage, setUploadingImage] = useState(false); // Loading state for image upload

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
        // Add cache busting to force fresh data
        const response = await axios.get('/admin/filieres', {
          params: { _t: Date.now() }
        });
        console.log('📥 Admin API - Filieres fetched (full):', JSON.stringify(response.data, null, 2));
        console.log('📥 Admin API - Filieres count:', (response.data.data || []).length);
        // Log image_url for each filiere
        (response.data.data || []).forEach(f => {
          console.log(`📋 Filiere ${f.id} (${getDisplayValue(f.name)}):`, {
            id: f.id,
            name: f.name,
            image_url: f.image_url,
            slug: f.slug,
            has_image_url: !!f.image_url
          });
          if (f.image_url) {
            console.log(`  ✅ Filiere ${f.id}: image_url = ${f.image_url}`);
          } else {
            console.warn(`  ⚠️ Filiere ${f.id}: image_url = NULL ou undefined`);
          }
        });
        logger.debug('Filieres fetched:', response.data.data);
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
    
    // Set image preview - use getImageUrl to convert relative paths to full URLs for filieres
    if (activeTab === 'filieres' && item.image_url) {
      setImagePreview(getImageUrl(item.image_url, true));
    } else {
      setImagePreview(item.image_url || null);
    }
    
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
      
      // For filieres, use FormData only if there's an image File to upload
      if (activeTab === 'filieres' && formData.image instanceof File) {
        // Use FormData when there's an image OR when creating (to handle potential future images)
        const formDataToSend = new FormData();
        
        // Append name fields - always send fr, ar, en
        if (formData.name) {
          ['fr', 'ar', 'en'].forEach((lang) => {
            const value = (formData.name[lang] || '').trim();
            formDataToSend.append(`name[${lang}]`, value);
          });
        }
        
        // Append description fields - send all languages (can be empty)
        if (formData.description) {
          ['fr', 'ar', 'en'].forEach((lang) => {
            const value = (formData.description[lang] || '').trim();
            formDataToSend.append(`description[${lang}]`, value);
          });
        }
        
        // Append image if it's a File object
        if (formData.image instanceof File) {
          formDataToSend.append('image', formData.image);
        }
        
        // Append order
        if (formData.order !== undefined && formData.order !== null) {
          formDataToSend.append('order', formData.order.toString());
        }
        
        // Append remove_image flag if needed
        if (formData.remove_image) {
          formDataToSend.append('remove_image', '1');
        }
        
        // For updates, send existing image_url if no new image and not removing
        if (editingId && !formData.image && !formData.remove_image && formData.image_url) {
          formDataToSend.append('image_url', formData.image_url);
        }
        
        const response = editingId
          ? await axios.put(`/admin/${type}/${editingId}`, formDataToSend, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
          : await axios.post(`/admin/${type}`, formDataToSend, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
        
        // Log response for debugging
        console.log('✅ Image upload response (full):', JSON.stringify(response.data, null, 2));
        if (response.data.data) {
          console.log('✅ Response data:', response.data.data);
          if (response.data.data.image_url) {
            console.log('✅✅✅ image_url returned by backend:', response.data.data.image_url);
          } else {
            console.warn('⚠️⚠️⚠️ No image_url in response.data.data:', response.data.data);
            console.warn('⚠️ Response keys:', Object.keys(response.data.data));
          }
        } else {
          console.error('❌❌❌ No data in response:', response.data);
        }
        logger.debug('Image upload response:', response.data);
        
        // For filieres, immediately update the local state with the returned data
        if (activeTab === 'filieres' && response.data.data) {
          const updatedFiliere = response.data.data;
          setFilieres(prevFilieres => {
            if (editingId) {
              // Update existing filiere
              return prevFilieres.map(f => f.id === editingId ? updatedFiliere : f);
            } else {
              // Add new filiere
              return [...prevFilieres, updatedFiliere];
            }
          });
        }
        
        // Show success message with image info
        const successMessage = editingId 
          ? 'Élément modifié avec succès' 
          : 'Élément créé avec succès';
        setMessage({ 
          type: 'success', 
          text: `${successMessage}. Image uploadée: ${formData.image.name} (${(formData.image.size / 1024).toFixed(1)} KB)` 
        });
      } else if (activeTab === 'filieres') {
        // For filieres update without image, use JSON like other types
        let dataToSend = {};
        if (formData.name !== undefined) {
          dataToSend.name = formData.name;
        }
        if (formData.description !== undefined) {
          dataToSend.description = formData.description;
        }
        if (formData.order !== undefined) {
          dataToSend.order = parseInt(formData.order) || 0;
        }
        if (formData.is_active !== undefined) {
          dataToSend.is_active = formData.is_active;
        }
        if (formData.remove_image) {
          dataToSend.remove_image = true;
        }
        
        if (editingId) {
          await axios.put(`/admin/${type}/${editingId}`, dataToSend);
          setMessage({ type: 'success', text: 'Élément modifié avec succès' });
        } else {
          await axios.post(`/admin/${type}`, dataToSend);
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

      // Show success message for JSON requests (specialites/modules or filieres without image)
      if (activeTab !== 'filieres' || !(formData.image instanceof File)) {
        const successMessage = editingId 
          ? 'Élément modifié avec succès' 
          : 'Élément créé avec succès';
        setMessage({ type: 'success', text: successMessage });
      }
      
      // Close modal
      handleCloseModal();
      
      // For filieres with image upload, refresh data after a delay
      if (activeTab === 'filieres' && formData.image instanceof File) {
        // Small delay to ensure backend has processed the image
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Clear and refetch to ensure we have the latest data
        setFilieres([]);
        await fetchData();
        // Double fetch to ensure latest image URLs
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchData();
      } else {
        // For other cases, just refresh normally
        await fetchData();
      }
      
      // Keep success message visible longer if image was uploaded
      const messageDuration = (activeTab === 'filieres' && formData.image instanceof File) ? 5000 : 3000;
      setTimeout(() => setMessage({ type: '', text: '' }), messageDuration);
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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Format d\'image invalide. Utilisez JPEG ou PNG.' });
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10485760) {
        setMessage({ type: 'error', text: 'L\'image est trop grande. Taille maximale: 10MB.' });
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFormData({ ...formData, image: file, remove_image: false });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' }); // Clear any previous errors
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null, remove_image: true, image_url: null });
    setImagePreview(null);
  };

  const handleUpdateImage = (item) => {
    setImageUploadId(item.id);
    setImageUploadFile(null);
    setImageUploadPreview(null);
    setShowImageModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Format d\'image invalide. Utilisez JPEG ou PNG.' });
        e.target.value = '';
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10485760) {
        setMessage({ type: 'error', text: 'L\'image est trop grande. Taille maximale: 10MB.' });
        e.target.value = '';
        return;
      }
      
      setImageUploadFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleImageUpload = async () => {
    if (!imageUploadFile) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image.' });
      return;
    }

    setUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', imageUploadFile);

      console.log('📤 Uploading image to:', `/admin/filieres/${imageUploadId}/image`);
      console.log('📤 File details:', {
        name: imageUploadFile.name,
        size: imageUploadFile.size,
        type: imageUploadFile.type
      });

      const response = await axios.post(`/admin/filieres/${imageUploadId}/image`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Image upload response (full):', JSON.stringify(response.data, null, 2));
      
      if (response.data.data && response.data.data.image_url) {
        console.log('✅✅✅ image_url returned by backend:', response.data.data.image_url);
        
        // Update the filiere in the list immediately
        setFilieres(prevFilieres => 
          prevFilieres.map(f => f.id === imageUploadId ? response.data.data : f)
        );
      }

      setMessage({ type: 'success', text: 'Image mise à jour avec succès!' });
      setShowImageModal(false);
      setImageUploadFile(null);
      setImageUploadPreview(null);
      setImageUploadId(null);

      // Refresh data after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchData();
    } catch (error) {
      console.error('❌ Error uploading image (full):', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      logger.error('Error uploading image:', error);
      
      // Try to get more detailed error message
      let errorMsg = 'Erreur inconnue';
      let errorDetails = '';
      
      if (error.response?.data) {
        console.log('❌ Error response data (full):', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data.error) {
          errorMsg = error.response.data.error.message || 'Erreur serveur';
          errorDetails = error.response.data.error.error_details || '';
          if (error.response.data.error.code) {
            errorMsg += ` (Code: ${error.response.data.error.code})`;
          }
          if (error.response.data.error.file && error.response.data.error.line) {
            errorDetails += ` [${error.response.data.error.file}:${error.response.data.error.line}]`;
          }
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // Show detailed error if available
      const fullErrorMessage = errorDetails 
        ? `${errorMsg} - ${errorDetails}`
        : errorMsg;
      
      console.error('❌ Full error message:', fullErrorMessage);
      setMessage({ type: 'error', text: `Erreur lors de l'upload de l'image: ${fullErrorMessage}` });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImageUploadFile(null);
    setImageUploadPreview(null);
    setImageUploadId(null);
    setMessage({ type: '', text: '' });
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
                      {activeTab === 'filieres' && (
                        <div className="relative">
                          {(() => {
                            const hasImageUrl = item.image_url && item.image_url !== null && item.image_url !== '';
                            if (!hasImageUrl) {
                              console.log(`🖼️ Rendering Filiere ${item.id}: image_url = ${item.image_url} (type: ${typeof item.image_url})`);
                            }
                            return hasImageUrl ? (
                            <img 
                              src={getImageUrl(item.image_url, true)} 
                              alt={getDisplayValue(item.name)} 
                              className="w-24 h-24 object-cover rounded-lg border-2 border-green-500"
                              key={`${item.id}-${item.image_url || 'no-img'}-${item.updated_at || Date.now()}`} // Force re-render when image_url or updated_at changes
                              onError={(e) => {
                                console.error('❌ Image failed to load in list:', {
                                  image_url: item.image_url,
                                  full_url: e.target.src,
                                  item_id: item.id,
                                  item_name: getDisplayValue(item.name)
                                });
                                logger.error('Image failed to load:', {
                                  image_url: item.image_url,
                                  full_url: e.target.src,
                                  item_id: item.id,
                                  item_name: getDisplayValue(item.name)
                                });
                                // Don't hide, show error placeholder instead
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EErreur%3C/text%3E%3C/svg%3E';
                              }}
                              onLoad={() => {
                                console.log('✅✅✅ Image loaded successfully in list:', item.image_url);
                                logger.debug('Image loaded successfully:', item.image_url);
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                              <span className="text-xs text-gray-400 text-center px-2">Pas d'image</span>
                            </div>
                          );
                          })()}
                          {item.image_url && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded" title="Image uploadée">
                              ✓
                            </div>
                          )}
                        </div>
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
                      {activeTab === 'filieres' && (
                        <button 
                          onClick={() => handleUpdateImage(item)}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded transition"
                          title="Modifier l'image"
                        >
                          <FaImage />
                        </button>
                      )}
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
                          src={imagePreview || getImageUrl(formData.image_url, true)} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border"
                          key={imagePreview || formData.image_url || 'preview'} // Force re-render when image changes
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

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-dark">Modifier l'image</h3>
              <button
                onClick={handleCloseImageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            {message.text && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 
                message.type === 'error' ? 'bg-red-100 text-red-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              {imageUploadPreview ? (
                <div className="mb-4">
                  <img 
                    src={imageUploadPreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              ) : (
                <div className="mb-4 text-center text-gray-500">
                  Aucune image sélectionnée
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Sélectionner une image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageFileChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={uploadingImage}
                />
                <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPEG, PNG (max 10MB)</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleCloseImageModal}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                disabled={uploadingImage}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploadingImage || !imageUploadFile}
                className={`flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition flex items-center justify-center ${
                  (uploadingImage || !imageUploadFile) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Upload...
                  </>
                ) : (
                  'Mettre à jour l\'image'
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
