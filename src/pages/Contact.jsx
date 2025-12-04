import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Contact = () => {
  const [contactData, setContactData] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await axios.get('/public/contact');
      setContactData(response.data.data);
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    // TODO: Implement contact form submission endpoint
    setTimeout(() => {
      setSubmitStatus({ type: 'success', message: 'Message envoyé avec succès!' });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-text-dark">Contactez-nous</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Nous sommes là pour répondre à vos questions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-text-dark">Informations de contact</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <FaMapMarkerAlt className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-text-dark">Adresse</h3>
                <p className="text-gray-600">{contactData?.address || 'Sidi Bel Abbès, Algeria'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <FaPhone className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-text-dark">Téléphone</h3>
                <p className="text-gray-600">{contactData?.phone || '+213 XX XXX XXXX'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <FaEnvelope className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-text-dark">Email</h3>
                <p className="text-gray-600">{contactData?.email || 'contact@institut-paramedical-sba.dz'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <FaClock className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-text-dark">Heures d'ouverture</h3>
                <p className="text-gray-600">{contactData?.office_hours?.fr || 'Lundi - Vendredi: 8h00 - 17h00'}</p>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-8 bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">Carte à intégrer</p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-text-dark">Envoyez-nous un message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Sujet
              </label>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {submitStatus && (
              <div className={`p-4 rounded-lg ${
                submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
