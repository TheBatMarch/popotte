import React, { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { database } from '../lib/database'
import { seedDatabase } from '../lib/seedData'
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
      await seedDatabase()
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
    fetchNewsPosts()
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
          <h3 className="text-lg font-semibold mb-2">Initialisation de la base de données...</h3>
          <p className="text-gray-600">Création des catégories, produits et actualités</p>
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
          <p className="text-gray-500 mb-4">Aucune actualité trouvée.</p>
          <button 
            onClick={retrySeeding}
            className="btn-primary"
          >
            Réessayer le chargement
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