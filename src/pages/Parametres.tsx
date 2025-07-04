import React, { useState, useEffect } from 'react'
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
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function Parametres() {
  const { profile, signOut } = useAuth()
  const [editingProfile, setEditingProfile] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({
    totalPending: 0,
    totalNotified: 0,
    totalAmount: 0
  })

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchStats()
    }
  }, [profile])

  const fetchStats = async () => {
    try {
      // Récupérer toutes les commandes non confirmées
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, status')
        .in('status', ['pending', 'payment_notified'])

      if (error) throw error

      const pending = orders?.filter(o => o.status === 'pending') || []
      const notified = orders?.filter(o => o.status === 'payment_notified') || []
      
      setStats({
        totalPending: pending.reduce((sum, o) => sum + o.total_amount, 0),
        totalNotified: notified.reduce((sum, o) => sum + o.total_amount, 0),
        totalAmount: orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

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
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id)

      if (error) throw error

      setMessage('Informations mises à jour avec succès !')
      setEditingProfile(false)
      window.location.reload()
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

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

      {/* Graphique des montants à percevoir (admin seulement) */}
      {profile?.role === 'admin' && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="text-primary-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Montants à percevoir</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Non payées</div>
              <div className="text-2xl font-bold text-red-700">{stats.totalPending.toFixed(2)} €</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 font-medium">En attente de confirmation</div>
              <div className="text-2xl font-bold text-gray-700">{stats.totalNotified.toFixed(2)} €</div>
            </div>
            
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <div className="text-sm text-primary-600 font-medium">Total à percevoir</div>
              <div className="text-2xl font-bold text-primary-700">{stats.totalAmount.toFixed(2)} €</div>
            </div>
          </div>
        </div>
      )}

      {/* Fonctionnalités d'administration (si admin) */}
      {profile?.role === 'admin' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Shield className="text-primary-500" size={20} />
            <span>Administration</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin"
              className="card text-center py-6 hover:bg-gray-50 transition-colors"
            >
              <Users className="mx-auto mb-3 text-primary-500" size={32} />
              <span className="text-sm font-medium">Utilisateurs</span>
              <p className="text-xs text-gray-500 mt-1">Gérer les comptes</p>
            </a>

            <a
              href="/admin/orders"
              className="card text-center py-6 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="mx-auto mb-3 text-primary-500" size={32} />
              <span className="text-sm font-medium">Commandes</span>
              <p className="text-xs text-gray-500 mt-1">Suivi des paiements</p>
            </a>

            <a
              href="/admin/news"
              className="card text-center py-6 hover:bg-gray-50 transition-colors"
            >
              <FileText className="mx-auto mb-3 text-primary-500" size={32} />
              <span className="text-sm font-medium">Actualités</span>
              <p className="text-xs text-gray-500 mt-1">Publier des articles</p>
            </a>

            <a
              href="/admin/products"
              className="card text-center py-6 hover:bg-gray-50 transition-colors"
            >
              <Package className="mx-auto mb-3 text-primary-500" size={32} />
              <span className="text-sm font-medium">Produits</span>
              <p className="text-xs text-gray-500 mt-1">Gérer le menu</p>
            </a>
          </div>
        </div>
      )}

      {/* Actions générales */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Actions</h2>
        
        <button
          onClick={handleSignOut}
          className="w-full card hover:bg-red-50 transition-colors text-red-600 flex items-center justify-center space-x-3 py-4"
        >
          <LogOut size={24} />
          <div className="text-center">
            <div className="font-medium">Se déconnecter</div>
            <div className="text-xs text-red-500">Quitter l'application</div>
          </div>
        </button>
      </div>
    </div>
  )
}