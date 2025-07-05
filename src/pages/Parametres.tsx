import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function Parametres() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors"
        >
          <span>Aller à l'admin</span>
          <ArrowLeft size={20} className="rotate-180" />
        </button>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <h3 className="font-semibold text-blue-900">Mode Administrateur</h3>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Vous êtes en mode administrateur local. Toutes les fonctionnalités sont disponibles depuis l'interface d'administration.
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="btn-primary"
        >
          Accéder à l'administration
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Fonctionnalités disponibles</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">🏠 Page d'accueil</h3>
            <p className="text-sm text-gray-600">Consultez les actualités de l'association</p>
          </div>
          
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">🛒 Commandes</h3>
            <p className="text-sm text-gray-600">Passez des commandes et testez le système de panier</p>
          </div>
          
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">💳 Dettes</h3>
            <p className="text-sm text-gray-600">Visualisez et gérez les dettes en attente</p>
          </div>
          
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">⚙️ Administration</h3>
            <p className="text-sm text-gray-600">Gérez les utilisateurs, produits, commandes et actualités</p>
          </div>
        </div>
      </div>
    </div>
  )
}