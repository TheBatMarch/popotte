import React, { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { database } from '../lib/database'
import { initializeDatabase } from '../lib/initializeDatabase'
import type { NewsPost } from '../lib/database'

const logoUrl = '/ChatGPT Image 4 juil. 2025, 23_49_33.png'

export function Home() {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setSeeding(true)
      await initializeDatabase()
      await fetchNewsPosts()
    } catch (error) {
      console.error('Error initializing data:', error)
    } finally {
      setSeeding(false)
    }
  }

  const fetchNewsPosts = async () => {
    try {
      const data = await database.getNews(true)
      setNewsPosts(data)
    } catch (error) {
      console.error('Error fetching news posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const retrySeeding = async () => {
    await initializeData()
  }

  if (seeding) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <img 
            src={logoUrl} 
            alt="Popotte Association Logo" 
            className="w-48 h-48 object-contain"
          />
        </div>
        
        <div className="card text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Chargement...</h3>
          <p className="text-gray-600">Préparation du contenu</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <img 
            src={logoUrl} 
            alt="Popotte Association Logo" 
            className="w-48 h-48 object-contain"
          />
        </div>
        
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (newsPosts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <img 
            src={logoUrl} 
            alt="Popotte Association Logo" 
            className="w-48 h-48 object-contain"
          />
        </div>
        
        <div className="card text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Configuration requise</h3>
          <p className="text-gray-600 mb-4">
            Initialisation de la base de données en cours...
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Si le problème persiste :</p>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Vérifiez votre connexion internet</li>
              <li>2. Vérifiez que Supabase est accessible</li>
              <li>3. Cliquez sur "Réessayer" ci-dessous</li>
            </ol>
          </div>
          <button 
            onClick={retrySeeding}
            className="btn-primary mt-4"
          >
            Réessayer l'initialisation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <img 
          src={logoUrl} 
          alt="Popotte Association Logo" 
          className="w-48 h-48 object-contain"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Les nouveautés de la popotte</h2>
        
        {newsPosts.map((post) => (
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
        ))}
      </div>
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}