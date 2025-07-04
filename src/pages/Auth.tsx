import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, ClipboardList, CreditCard, Settings } from 'lucide-react'

export function Auth() {
  const { user, signIn, signUp } = useAuth()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    // Rediriger vers la page d'origine ou l'accueil
    const from = (location.state as any)?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName)
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Connectez-vous pour continuer' : 'Rejoignez notre association'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={!isLogin}
                  className="input mt-1"
                  placeholder="Votre nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input mt-1"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input mt-1"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer le compte'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-primary-500 hover:text-primary-600 text-sm"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>
      </div>
      
      {/* Footer pour la page de connexion */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <div className="flex flex-col items-center p-2 text-gray-400">
            <Home size={24} />
            <span className="text-xs mt-1">Accueil</span>
          </div>
          
          <div className="flex flex-col items-center p-2 text-gray-400">
            <ClipboardList size={24} />
            <span className="text-xs mt-1">Commande</span>
          </div>
          
          <div className="flex flex-col items-center p-2 text-gray-400">
            <CreditCard size={24} />
            <span className="text-xs mt-1">Dettes</span>
          </div>
          
          <div className="flex flex-col items-center p-2 text-gray-400">
            <Settings size={24} />
            <span className="text-xs mt-1">Paramètres</span>
          </div>
        </div>
      </nav>
    </div>
  )
}