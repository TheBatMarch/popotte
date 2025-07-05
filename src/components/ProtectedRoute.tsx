import React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  // Plus de protection nécessaire, tout est accessible en mode admin local
  return <>{children}</>
}