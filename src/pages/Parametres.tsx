import React, { useState } from 'react'
import { 
  LogOut, 
  User, 
  Shield, 
  Edit, 
  Users, 
  CreditCard, 
  FileText, 
  Package,
  Save,
  X,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { mockDatabase } from '../lib/mockDatabase'

// Import des composants admin
import { Users as UsersComponent } from './admin/Users'
import { Orders as OrdersComponent } from './admin/Orders'
import { News as NewsComponent } from './admin/News'
import { Products as ProductsComponent } from './admin/Products'
import { Profile as ProfileComponent } from './Profile'

type CurrentView = 'main' | 'users' | 'orders' | 'news' | 'products' | 'profile'

export function Parametres() {
  const { profile, signOut, updateProfile } = useAuth()
  const [currentView, setCurrentView] = useState<CurrentView>('main')
  const [editingProfile, setEditingProfile] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    setMessage('')

    try {
      await updateProfile({ full_name: fullName })
      setMessage('Informations mises à jour avec succès !')
      setEditingProfile(false)
    } catch (error: any) {
      setMessage('Erreur lors de la mise à jour : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingProfile(false)
    setFullName(profile?.full_name || '')
    setMessage('')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'users':
        return <UsersComponent />
      case 'orders':
        return <OrdersComponent />
      case 'news':
        return <NewsComponent />
      case 'products':
        return <ProductsComponent />
      case 'profile':
        return <ProfileComponent />
      default:
        return renderMainView()
    }
  }

  const renderMainView = () => (
    <>
      {/* Profil utilisateur */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="text-primary-600" size={24} />
            </div>
            <div>
              <h2 className="font-semibold">{profile?.full_name}</h2>
              <p className="text-sm text-gray-600">{profile?.email}</p>
              {profile?.role === 'admin' && (
                <div className="flex items-center space-x-1 mt-1">
                  <Shield size={14} className="text-primary-500" />
                  <span className="text-xs text-primary-600 font-medium">Administrateur</span>
                </div>
              )}
            </div>
          </div>
          
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit size={20} />
            </button>
          )}
        </div>

        {editingProfile && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('succès') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="input mt-1 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input mt-1"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Mise à jour...' : 'Sauvegarder'}</span>
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <X size={16} />
                <span>Annuler</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Fonctionnalités principales */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Fonctionnalités</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Gestion des utilisateurs - Admin seulement */}
          {profile?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('users')}
              className="card hover:bg-blue-50 transition-colors cursor-pointer border-l-4 border-blue-500 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Gestion des utilisateurs</h3>
                  <p className="text-sm text-blue-600">Gérer les comptes et les dettes</p>
                </div>
                <span className="text-blue-400">→</span>
              </div>
            </button>
          )}

          {/* Gestion des commandes - Admin seulement */}
          {profile?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('orders')}
              className="card hover:bg-green-50 transition-colors cursor-pointer border-l-4 border-green-500 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Gestion des commandes</h3>
                  <p className="text-sm text-green-600">Suivi des paiements et confirmations</p>
                </div>
                <span className="text-green-400">→</span>
              </div>
            </button>
          )}

          {/* Gestion des actualités - Admin seulement */}
          {profile?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('news')}
              className="card hover:bg-purple-50 transition-colors cursor-pointer border-l-4 border-purple-500 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900">Gestion des actualités</h3>
                  <p className="text-sm text-purple-600">Publier et modifier les articles</p>
                </div>
                <span className="text-purple-400">→</span>
              </div>
            </button>
          )}

          {/* Gestion des produits - Admin seulement */}
          {profile?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('products')}
              className="card hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-orange-500 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="text-orange-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Gestion des produits</h3>
                  <p className="text-sm text-orange-600">Gérer le menu et les prix</p>
                </div>
                <span className="text-orange-400">→</span>
              </div>
            </button>
          )}

          {/* Mon profil - Tous les utilisateurs */}
          <button
            onClick={() => setCurrentView('profile')}
            className="card hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-gray-500 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="text-gray-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Mon profil</h3>
                <p className="text-sm text-gray-600">Modifier mes informations personnelles</p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Déconnexion */}
      <div className="pt-4">
        <button
          onClick={handleSignOut}
          className="w-full card hover:bg-red-50 transition-colors text-red-600 flex items-center justify-center space-x-3 py-4 border-l-4 border-red-500"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="text-red-600" size={24} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-red-900">Se déconnecter</div>
            <div className="text-sm text-red-600">Quitter l'application</div>
          </div>
        </button>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour si pas sur la vue principale */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentView === 'main' ? 'Paramètres' : 
           currentView === 'users' ? 'Gestion des utilisateurs' :
           currentView === 'orders' ? 'Gestion des commandes' :
           currentView === 'news' ? 'Gestion des actualités' :
           currentView === 'products' ? 'Gestion des produits' :
           currentView === 'profile' ? 'Mon profil' : 'Paramètres'}
        </h1>
        
        {currentView !== 'main' && (
          <button
            onClick={() => setCurrentView('main')}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
        )}
      </div>

      {/* Contenu de la vue actuelle */}
      {renderCurrentView()}
    </div>
  )
}