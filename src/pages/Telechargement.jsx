import { useTranslation } from 'react-i18next';

const Telechargement = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-text-dark">Téléchargement</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Documents et fichiers à télécharger
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-gray-600 text-center">
          Cette section sera bientôt disponible.
        </p>
      </div>
    </div>
  );
};

export default Telechargement;
