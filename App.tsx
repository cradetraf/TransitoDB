import React, { useState, useEffect, useCallback } from 'react';
import { GeoLocation } from './components/GeoLocation';
import { LocationSelector } from './components/LocationSelector';
import { processImage } from './utils/imageHelper';
import { saveToQueue, getQueue, removeFromQueue } from './utils/storage';
import { AppStatus, FormData, LocationData } from './types';
import { GOOGLE_SCRIPT_URL } from './constants';

export default function App() {
  // Form State
  const [userDate, setUserDate] = useState('');
  const [userTime, setUserTime] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [region, setRegion] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [location, setLocation] = useState<LocationData>({ latitude: null, longitude: null });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // App State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [scriptUrlSet, setScriptUrlSet] = useState(false);

  // Initial checks
  useEffect(() => {
    setQueueCount(getQueue().length);
    
    // Check if user replaced the placeholder URL
    if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('REPLACE_WITH')) {
      setScriptUrlSet(true);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setReference('');
    setNote('');
    setSelectedImage(null);
    setImagePreview(null);
    setStatus(AppStatus.IDLE);
    // Note: We might want to keep date/time or location, but resetting prevents stale data
  };

  const syncQueue = async () => {
    if (!isOnline) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    setStatus(AppStatus.SUBMITTING);
    
    // Process one by one
    for (const item of queue) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(item),
          // Google Apps Script requires text/plain to avoid CORS preflight issues sometimes
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        });
        removeFromQueue(item.id);
      } catch (error) {
        console.error('Sync failed for item', item.id, error);
        // If fail, keep in queue and stop sync
        setStatus(AppStatus.ERROR);
        return; 
      }
    }
    setQueueCount(getQueue().length);
    setStatus(AppStatus.SUCCESS);
    setTimeout(() => setStatus(AppStatus.IDLE), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!region || !neighborhood || !street) {
      alert('Por favor, selecione Região, Bairro e Rua.');
      return;
    }

    setStatus(AppStatus.SUBMITTING);

    let base64Image: string | null = null;
    if (selectedImage) {
      try {
        base64Image = await processImage(selectedImage);
      } catch (err) {
        alert('Erro ao processar imagem');
        setStatus(AppStatus.ERROR);
        return;
      }
    }

    const payload: FormData = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userDate,
      userTime,
      region,
      neighborhood,
      street,
      reference,
      note,
      location,
      imageBase64: base64Image,
    };

    // If offline or just want to use the queue system for reliability
    saveToQueue(payload);
    setQueueCount(prev => prev + 1);
    
    // If online, try to sync immediately
    if (isOnline && scriptUrlSet) {
      syncQueue();
    } else {
      setStatus(AppStatus.OFFLINE_QUEUED);
      setTimeout(() => resetForm(), 2000);
    }
  };

  if (!scriptUrlSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Configuração Necessária</h1>
          <p className="text-gray-700 mb-4">
            O aplicativo precisa ser conectado ao Google Apps Script.
          </p>
          <p className="text-sm text-gray-500 text-left bg-gray-50 p-3 rounded border">
            1. Abra o arquivo <code>constants.ts</code><br/>
            2. Substitua a variável <code>GOOGLE_SCRIPT_URL</code> pela URL do seu Web App implantado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <h1 className="text-lg font-bold">Trânsito Municipal</h1>
          <div className="flex items-center gap-2">
             {/* Status Indicators */}
             <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} title={isOnline ? 'Online' : 'Offline'}></div>
             {queueCount > 0 && (
               <button onClick={syncQueue} className="text-xs bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-white font-semibold">
                 Sync ({queueCount})
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {status === AppStatus.SUCCESS && (
           <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
             <p className="font-bold">Sucesso!</p>
             <p>Dados enviados para o servidor.</p>
           </div>
        )}
        {status === AppStatus.OFFLINE_QUEUED && (
           <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
             <p className="font-bold">Salvo Offline</p>
             <p>Os dados foram salvos e serão enviados quando houver conexão.</p>
           </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 space-y-6">
          
          <GeoLocation onLocationUpdate={setLocation} />

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
                value={userDate}
                onChange={e => setUserDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input 
                type="time" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
                value={userTime}
                onChange={e => setUserTime(e.target.value)}
              />
            </div>
          </div>

          {/* Cascading Location */}
          <div className="border-t border-b border-gray-100 py-4">
            <h3 className="text-blue-900 font-semibold mb-3">Localização</h3>
            <LocationSelector 
              onRegionChange={setRegion}
              onNeighborhoodChange={setNeighborhood}
              onStreetChange={setStreet}
            />
          </div>

          {/* Manual Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número / Altura / Referência</label>
            <input 
              type="text" 
              placeholder="Ex: Em frente ao mercado..."
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto da Ocorrência</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-20 object-contain" />
                  ) : (
                    <>
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para fotografar</span></p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  capture="environment" // Forces back camera on mobile
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea 
              rows={3}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={status === AppStatus.SUBMITTING}
            className={`w-full text-white font-bold py-4 rounded-lg shadow-lg text-lg transition-colors 
              ${status === AppStatus.SUBMITTING ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
          >
            {status === AppStatus.SUBMITTING ? 'Salvando...' : 'Registrar Ocorrência'}
          </button>

        </form>
      </main>
    </div>
  );
}
