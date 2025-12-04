import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('filieres');
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-text-dark">Gestion du contenu</h2>
      
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
            <div>
              {activeTab === 'filieres' && (
                <div className="space-y-4">
                  {filieres.map((filiere) => (
                    <div key={filiere.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{filiere.name?.fr}</h3>
                        <p className="text-sm text-gray-600">{filiere.description?.fr?.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600"><FaEdit /></button>
                        <button className="text-red-600"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'specialites' && (
                <div className="space-y-4">
                  {specialites.map((specialite) => (
                    <div key={specialite.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{specialite.name?.fr}</h3>
                        <p className="text-sm text-gray-600">{specialite.description?.fr?.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600"><FaEdit /></button>
                        <button className="text-red-600"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'modules' && (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{module.code} - {module.title?.fr}</h3>
                        <p className="text-sm text-gray-600">{module.description?.fr?.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600"><FaEdit /></button>
                        <button className="text-red-600"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;

