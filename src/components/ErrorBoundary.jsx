import { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import logger from '../utils/logger';

/**
 * Error Boundary component to catch and handle React errors
 * Prevents entire app from crashing on component errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oups ! Une erreur est survenue
            </h1>
            <p className="text-gray-600 mb-6">
              Une erreur inattendue s'est produite. Veuillez rafraîchir la page ou contacter le support si le problème persiste.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              Rafraîchir la page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Détails de l'erreur (mode développement)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
