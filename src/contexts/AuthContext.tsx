import React, { createContext, useContext, useEffect, useState } from 'react'
import { localStorage as localDB, type User } from '../lib/localStorage'

interface AuthContextType {
  user: User | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialiser les données par défaut
    localDB.initializeData()
    
    // Récupérer l'utilisateur connecté
    const currentUser = localDB.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const user = localDB.signIn(email, password)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const user = localDB.signUp(email, password, fullName)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    localDB.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const updatedUser = localDB.updateUser(user.id, updates)
      setUser(updatedUser)
      localDB.setCurrentUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const changePassword = async (_currentPassword: string, newPassword: string) => {
    // Pour la démo, on simule juste le changement de mot de passe
    // En production, il faudrait vérifier l'ancien mot de passe
    return Promise.resolve()
  }

  const value = {
    user,
    profile: user, // Dans le système local, user et profile sont identiques
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}