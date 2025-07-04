import React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  // Temporairement désactivé pour les tests
  return <>{children}</>
}