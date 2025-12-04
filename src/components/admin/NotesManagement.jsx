import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaTrash, FaEdit, FaFileAlt } from 'react-icons/fa';

const NotesManagement = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null,
    module_id: '',
    specialite_id: '',
    assigned_student_id: '',
    visibility: 'private',
  });

  useEffect(() => {
    fetchNotes();
    fetchStudents();
    fetchModules();
    fetchSpecialities();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/admin/notes');
      setNotes(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/admin/students');
      setStudents(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const fetchSpecialities = async () => {
    try {
      const response = await axios.get('/admin/specialites');
      setSpecialities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching specialities:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('file', uploadData.file);
    formData.append('visibility', uploadData.visibility);
    
    // Add fields based on visibility type
    if (uploadData.visibility === 'private' && uploadData.assigned_student_id) {
      formData.append('assigned_student_id', uploadData.assigned_student_id);
    } else if (uploadData.visibility === 'module' && uploadData.module_id) {
      formData.append('module_id', uploadData.module_id);
    } else if (uploadData.visibility === 'specialite' && uploadData.specialite_id) {
      formData.append('specialite_id', uploadData.specialite_id);
    }

    try {
      await axios.post('/admin/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setUploadData({ 
        title: '', 
        description: '', 
        file: null, 
        module_id: '', 
        specialite_id: '',
        assigned_student_id: '',
        visibility: 'private' 
      });
      fetchNotes();
      alert('Note téléversée avec succès!');
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Erreur inconnue';
      alert('Erreur: ' + errorMsg);
      if (error.response?.data?.error?.details) {
        console.error('Validation errors:', error.response.data.error.details);
      }
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Supprimer cette note?')) return;
    try {
      await axios.delete(`/admin/notes/${noteId}`);
      fetchNotes();
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.error?.message || 'Erreur inconnue'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Gestion des notes</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
        >
          <FaUpload className="mr-2" /> Téléverser une note
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <FaFileAlt className="text-primary text-2xl mb-2" />
                    <h3 className="font-semibold text-text-dark">{note.title}</h3>
                    {note.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  <p>Téléchargements: {note.download_count || 0}</p>
                  <p>{new Date(note.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaFileAlt className="text-5xl mx-auto mb-4 opacity-50" />
            <p>Aucune note</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Téléverser une note</h3>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre</label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fichier (PDF, JPG, PNG)</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Visibilité</label>
                  <select
                    value={uploadData.visibility}
                    onChange={(e) => setUploadData({ ...uploadData, visibility: e.target.value, assigned_student_id: '', module_id: '', specialite_id: '' })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="private">Privé (étudiant spécifique)</option>
                    <option value="module">Module</option>
                    <option value="specialite">Spécialité</option>
                  </select>
                </div>

                {/* Show student selector for private visibility */}
                {uploadData.visibility === 'private' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Étudiant</label>
                    <select
                      value={uploadData.assigned_student_id}
                      onChange={(e) => setUploadData({ ...uploadData, assigned_student_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Sélectionner un étudiant</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Show module selector for module visibility */}
                {uploadData.visibility === 'module' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Module</label>
                    <select
                      value={uploadData.module_id}
                      onChange={(e) => setUploadData({ ...uploadData, module_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Sélectionner un module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title?.fr || module.code} ({module.speciality?.title?.fr || ''})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Show speciality selector for specialite visibility */}
                {uploadData.visibility === 'specialite' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Spécialité</label>
                    <select
                      value={uploadData.specialite_id}
                      onChange={(e) => setUploadData({ ...uploadData, specialite_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Sélectionner une spécialité</option>
                      {specialities.map((speciality) => (
                        <option key={speciality.id} value={speciality.id}>
                          {speciality.title?.fr || speciality.code} ({speciality.filiere?.name?.fr || ''})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
                >
                  Téléverser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManagement;

