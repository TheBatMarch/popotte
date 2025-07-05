import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Commande } from './pages/Commande'
import { Dettes } from './pages/Dettes'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Users } from './pages/admin/Users'
import { Orders } from './pages/admin/Orders'
import { News } from './pages/admin/News'
import { Products } from './pages/admin/Products'
import { Profile } from './pages/Profile'
import { localStorage } from './lib/localStorage'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Initialiser les données locales au démarrage
    localStorage.initializeData()
    
    // Créer un utilisateur admin par défaut
    const adminUser = {
      id: 'admin-1',
      email: 'admin@popotte.fr',
      full_name: 'Administrateur Popotte',
      username: 'admin',
      role: 'admin' as const,
      created_at: new Date().toISOString()
    }
    localStorage.setCurrentUser(adminUser)
  }, [])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="commande" element={<Commande />} />
            <Route path="dettes" element={<Dettes />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Users />} />
              <Route path="orders" element={<Orders />} />
              <Route path="news" element={<News />} />
              <Route path="products" element={<Products />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App