import React, { useState } from 'react';
import { MapPin, Phone, Calendar, Flame, ChevronDown, Search, User } from 'lucide-react';
import CitySelector from './components/CitySelector';
import ReservationForm from './components/ReservationForm';
import Header from './components/Header';

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [showReservation, setShowReservation] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Réservation de Bouteilles de Gaz
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Simple, rapide et fiable partout au Gabon
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!showReservation ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <CitySelector 
                selectedCity={selectedCity}
                onCitySelect={(city) => {
                  setSelectedCity(city);
                  setShowReservation(true);
                }}
              />
            </div>
          ) : (
            <ReservationForm 
              selectedCity={selectedCity}
              onBack={() => setShowReservation(false)}
            />
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Couverture Nationale</h3>
            <p className="text-gray-600">Service disponible dans toutes les villes du Gabon</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Support 24/7</h3>
            <p className="text-gray-600">Une équipe à votre écoute tous les jours</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Livraison Rapide</h3>
            <p className="text-gray-600">Livraison le jour même dans les grandes villes</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;