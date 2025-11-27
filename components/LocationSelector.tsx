import React, { useEffect, useState } from 'react';
import { LOCATION_DATA } from '../constants';
import { NeighborhoodData } from '../types';

interface Props {
  onRegionChange: (val: string) => void;
  onNeighborhoodChange: (val: string) => void;
  onStreetChange: (val: string) => void;
}

export const LocationSelector: React.FC<Props> = ({ onRegionChange, onNeighborhoodChange, onStreetChange }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<NeighborhoodData[]>([]);
  const [availableStreets, setAvailableStreets] = useState<string[]>([]);

  // Reset downstream selections when upstream changes
  const handleRegionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionName = e.target.value;
    setSelectedRegion(regionName);
    onRegionChange(regionName);
    
    // Reset lower levels
    setSelectedNeighborhood('');
    onNeighborhoodChange('');
    onStreetChange('');
    setAvailableStreets([]);

    const region = LOCATION_DATA.find(r => r.name === regionName);
    setAvailableNeighborhoods(region ? region.neighborhoods : []);
  };

  const handleNeighborhoodSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nbName = e.target.value;
    setSelectedNeighborhood(nbName);
    onNeighborhoodChange(nbName);

    // Reset lower level
    onStreetChange('');
    
    const neighborhood = availableNeighborhoods.find(n => n.name === nbName);
    setAvailableStreets(neighborhood ? neighborhood.streets : []);
  };

  return (
    <div className="space-y-4">
      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
        <select 
          className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={selectedRegion}
          onChange={handleRegionSelect}
        >
          <option value="">Selecione a Região</option>
          {LOCATION_DATA.map(r => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Neighborhood */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
        <select 
          className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={selectedNeighborhood}
          onChange={handleNeighborhoodSelect}
          disabled={!selectedRegion}
        >
          <option value="">Selecione o Bairro</option>
          {availableNeighborhoods.map(n => (
            <option key={n.name} value={n.name}>{n.name}</option>
          ))}
        </select>
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
        <select 
          className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => onStreetChange(e.target.value)}
          disabled={!selectedNeighborhood}
        >
          <option value="">Selecione a Rua</option>
          {availableStreets.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
