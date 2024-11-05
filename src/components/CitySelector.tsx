import React from 'react';
import { MapPin } from 'lucide-react';

interface CitySelectorProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onCitySelect }) => {
  const cities = [
    'Libreville',
    'Port-Gentil',
    'Franceville',
    'Oyem',
    'Moanda',
    'Mouila',
    'Lambaréné',
    'Tchibanga',
    'Koulamoutou',
    'Makokou'
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Choisissez votre ville</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => onCitySelect(city)}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              selectedCity === city
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="text-lg">{city}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CitySelector;