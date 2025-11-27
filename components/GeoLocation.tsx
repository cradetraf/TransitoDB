import React, { useEffect, useState } from 'react';
import { LocationData } from '../types';

interface Props {
  onLocationUpdate: (loc: LocationData) => void;
}

export const GeoLocation: React.FC<Props> = ({ onLocationUpdate }) => {
  const [status, setStatus] = useState<string>('Aguardando GPS...');
  const [coords, setCoords] = useState<LocationData>({ latitude: null, longitude: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('GPS não suportado');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(newCoords);
        onLocationUpdate(newCoords);
        setStatus('Localização obtida');
      },
      (error) => {
        setStatus(`Erro no GPS: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800 flex justify-between items-center">
      <span>{status}</span>
      {coords.latitude && (
        <span className="font-mono text-xs">
          {coords.latitude.toFixed(5)}, {coords.longitude?.toFixed(5)}
        </span>
      )}
    </div>
  );
};
