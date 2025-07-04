import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, CreditCard, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function BottomNavigation() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const getNavLink = (path: string, requireAuth: boolean = false) => {
    if (requireAuth && !user) {
      return '/auth'
    }
    return path
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Accueil</span>
        </Link>
        
        <Link
          to={getNavLink('/commande', true)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/commande') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={24} />
          <span className="text-xs mt-1">Commande</span>
        </Link>
        
        <Link
          to={getNavLink('/dettes', true)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/dettes') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard size={24} />
          <span className="text-xs mt-1">Dettes</span>
        </Link>
        
        <Link
          to={getNavLink('/parametres', true)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/parametres') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={24} />
          <span className="text-xs mt-1">Paramètres</span>
        </Link>
      </div>
    </nav>
  )
}