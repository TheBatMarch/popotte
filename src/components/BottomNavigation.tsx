import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ClipboardList, CreditCard, Settings } from 'lucide-react'

export function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => handleNavigation('/')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Accueil</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/commande')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/commande') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={24} />
          <span className="text-xs mt-1">Commande</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/dettes')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isActive('/dettes') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard size={24} />
          <span className="text-xs mt-1">Dettes</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/admin')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            location.pathname.startsWith('/admin') ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={24} />
          <span className="text-xs mt-1">Admin</span>
        </button>
      </div>
    </nav>
  )
}