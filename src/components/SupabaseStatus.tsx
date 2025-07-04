import React from 'react'
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

export function SupabaseStatus() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  const isConfigured = !!(supabaseUrl && supabaseAnonKey)

  if (isConfigured) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2 text-green-700 text-sm">
        <CheckCircle size={16} />
        <span>Supabase connecté</span>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-4">
      <div className="container mx-auto max-w-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle size={20} />
          <div>
            <div className="font-semibold">Supabase non configuré</div>
            <div className="text-sm opacity-90">
              Cliquez sur "Connect to Supabase" en haut à droite
            </div>
          </div>
        </div>
        <ExternalLink size={16} />
      </div>
    </div>
  )
}