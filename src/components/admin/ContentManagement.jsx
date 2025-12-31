import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('filieres');
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
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
      console.error('Error deleting:', error);
      const errorMsg = error.response?.data?.error?.message || 'Erreur lors de la suppression';
      setMessage({ type: 'error', text: errorMsg });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({});
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    try {
      const type = activeTab;
      let dataToSend = { ...formData };

      if (editingId) {
        // Update
        await axios.put(`/admin/${type}/${editingId}`, dataToSend);
        setMessage({ type: 'success', text: 'Élément modifié avec succès' });
      } else {
        // Create
        await axios.post(`/admin/${type}`, dataToSend);
        setMessage({ type: 'success', text: 'Élément créé avec succès' });
      }

      handleCloseModal();
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.error?.details || 'Erreur lors de l\'enregistrement';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({});
    setShowModal(true);
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
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {activeTab === 'modules' 
                          ? `${item.code || ''} - ${item.title?.fr || item.title || ''}`.trim()
                          : item.name?.fr || item.name || ''}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {(activeTab === 'modules' 
                          ? item.description?.fr || item.description || ''
                          : item.description?.fr || item.description || '').substring(0, 100)}...
                      </p>
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
                </>
              )}

              {activeTab === 'specialites' && (
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
                </>
              )}

              {activeTab === 'modules' && (
                <>
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
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition"
              >
                {editingId ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
