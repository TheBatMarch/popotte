import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Calendar } from 'lucide-react'
import supabase from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  image_url: string | null
  created_at: string
}

export function Home() {
  const { profile } = useAuth()
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNewsPosts()
  }, [])

  const fetchNewsPosts = async () => {
    try {
      setLoading(true)
      
      // Essayer d'abord sans filtre published pour voir toutes les actualités
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('News data:', data, 'Error:', error)

      if (error) {
        setError('Erreur lors du chargement des actualités')
        console.error('Error fetching news:', error)
        return
      }

      setNewsPosts(data || [])
    } catch (err) {
      setError('Erreur de connexion')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Popotte Association</h1>
        <div className="card bg-red-50 border-red-200 text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchNewsPosts}
            className="mt-4 btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Popotte Association</h1>
        {profile?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600"
          >
            <Settings size={20} />
            <span className="text-sm">Admin</span>
          </Link>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Bienvenue !</h2>
        <p className="text-gray-600">
          Découvrez les dernières actualités de notre association et passez vos commandes facilement.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Actualités</h2>
        
        {newsPosts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucune actualité pour le moment.</p>
            {profile?.role === 'admin' && (
              <Link to="/admin/news" className="text-primary-500 hover:text-primary-600 text-sm">
                Créer le premier article
              </Link>
            )}
          </div>
        ) : (
          newsPosts.map((post) => (
            <article key={post.id} className="card">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Calendar size={16} />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              {post.excerpt && (
                <p className="text-gray-600 mb-2 italic">{post.excerpt}</p>
              )}
              <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}