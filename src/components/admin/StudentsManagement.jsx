import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaKey, FaSearch } from 'react-icons/fa';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/admin/students${searchTerm ? `?search=${searchTerm}` : ''}`);
      setStudents(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm !== '') {
      const timeoutId = setTimeout(() => fetchStudents(), 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchStudents();
    }
  }, [searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/students', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchStudents();
    } catch (error) {
      alert('Erreur lors de la création: ' + (error.response?.data?.error?.message || 'Erreur inconnue'));
    }
  };

  const handleResetPassword = async (studentId) => {
    if (!confirm('Réinitialiser le mot de passe de cet étudiant?')) return;
    const newPassword = prompt('Nouveau mot de passe:');
    if (!newPassword) return;
    
    try {
      await axios.post(`/admin/students/${studentId}/reset-password`, { password: newPassword });
      alert('Mot de passe réinitialisé avec succès');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.error?.message || 'Erreur inconnue'));
    }
  };

  const handleDeactivate = async (studentId) => {
    if (!confirm('Désactiver cet étudiant?')) return;
    try {
      await axios.delete(`/admin/students/${studentId}`);
      fetchStudents();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.error?.message || 'Erreur inconnue'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Gestion des étudiants</h2>
        <button
          onClick={() => { setShowModal(true); setEditingStudent(null); setFormData({ name: '', email: '', password: '' }); }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
        >
          <FaPlus className="mr-2" /> Nouvel étudiant
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${student.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetPassword(student.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Réinitialiser le mot de passe"
                        >
                          <FaKey />
                        </button>
                        <button
                          onClick={() => handleDeactivate(student.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Désactiver"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Créer un étudiant</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;

