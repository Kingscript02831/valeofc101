
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropbox } from '../hooks/useDropbox';
import { Button } from '../components/ui/button';

const DropboxAuth = () => {
  const navigate = useNavigate();
  const { handleAuthCallback, isAuthenticated } = useDropbox();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the OAuth callback
    const processAuth = () => {
      try {
        const hash = window.location.hash;
        const success = handleAuthCallback(hash);
        
        if (success) {
          // Auth successful
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/story/creator');
          }, 1500);
        } else {
          // Auth failed
          setError('Falha na autenticação com o Dropbox. Tente novamente.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Erro ao processar autenticação.');
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [handleAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Conectando ao Dropbox</h1>
        
        {isProcessing && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
            <p>Processando autenticação...</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/story/creator')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar
            </Button>
          </div>
        )}
        
        {!isProcessing && !error && (
          <div className="mt-4">
            <p className="text-green-500 mb-4">Conectado com sucesso!</p>
            <p className="mb-4">Redirecionando para o criador de stories...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropboxAuth;
