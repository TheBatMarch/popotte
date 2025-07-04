import React from 'react'
import { LogOut, User, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Parametres() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={24} />
          </div>
          <div>
            <h2 className="font-semibold">{profile?.full_name}</h2>
            <p className="text-sm text-gray-600">{profile?.email}</p>
            {profile?.is_admin && (
              <div className="flex items-center space-x-1 mt-1">
                <Shield size={14} className="text-primary-500" />
                <span className="text-xs text-primary-600 font-medium">Administrateur</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          to="/profile"
          className="card hover:bg-gray-50 transition-colors cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span>Modifier mes informations</span>
            <span className="text-gray-400">→</span>
          </div>
        </Link>

        {profile?.is_admin && (
          <Link
            to="/admin"
            className="card hover:bg-gray-50 transition-colors cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-primary-500" />
                <span>Administration</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Link>
        )}
      </div>

      <div className="pt-4">
        <button
          onClick={handleSignOut}
          className="w-full card hover:bg-red-50 transition-colors text-red-600 flex items-center justify-center space-x-2"
        >
          <LogOut size={20} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  )
}