import React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  // Temporairement désactivé pour les tests
  // Reference adminOnly to satisfy TypeScript compiler
  if (adminOnly) {
    // Future admin-only logic will go here
  }
  return <>{children}</>
}