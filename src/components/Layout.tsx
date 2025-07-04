import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'
import { useLocation } from 'react-router-dom'

export function Layout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  return (
    <div className={`min-h-screen bg-gray-50 ${!isAuthPage ? 'pb-16' : ''}`}>
      <main className="container mx-auto px-4 py-6 max-w-md">
        <Outlet />
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  )
}