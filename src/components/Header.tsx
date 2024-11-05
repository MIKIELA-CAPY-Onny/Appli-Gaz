import React from 'react';
import { User, Flame } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-800">GazGabon</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-800">Accueil</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Services</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Contact</a>
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <User className="w-5 h-5" />
              <span>Connexion</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;