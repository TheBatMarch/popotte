import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  image_url: string | null
  created_at: string
}

// Contenu de démonstration qui s'affiche toujours
const DEMO_NEWS: NewsPost[] = [
  {
    id: 'demo-1',
    title: 'Bienvenue à la Popotte Association !',
    content: `Nous sommes ravis de vous accueillir dans notre nouvelle application de commande en ligne.

Vous pouvez désormais :
- Consulter notre menu complet
- Passer vos commandes facilement
- Suivre vos dettes et paiements
- Rester informés de nos actualités

Notre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.

N'hésitez pas à nous faire part de vos retours pour améliorer votre expérience !`,
    excerpt: 'Découvrez notre nouvelle application de commande en ligne',
    image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    title: 'Nouveau menu de printemps',
    content: `Nous avons le plaisir de vous annoncer l'arrivée de notre nouveau menu de printemps !

Au programme :
- Des salades fraîches de saison
- De nouveaux tajines aux légumes printaniers
- Des desserts légers et parfumés

Tous nos plats sont préparés avec des produits frais et de saison, dans le respect de nos traditions culinaires.

Venez découvrir ces nouvelles saveurs dès maintenant !`,
    excerpt: 'Découvrez nos nouveaux plats de saison',
    image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    created_at: new Date(Date.now() - 86400000).toISOString() // Hier
  },
  {
    id: 'demo-3',
    title: 'Horaires d\'ouverture mis à jour',
    content: `Nous vous informons que nos horaires d'ouverture ont été légèrement modifiés pour mieux vous servir :

Lundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00
Samedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30

Les commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d'ouverture.

Merci de votre compréhension !`,
    excerpt: 'Nouveaux horaires pour mieux vous servir',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    created_at: new Date(Date.now() - 172800000).toISOString() // Il y a 2 jours
  }
]

export function Home() {
  const { profile } = useAuth()
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)

  useEffect(() => {
    fetchNewsPosts()
  }, [])

  const fetchNewsPosts = async () => {
    try {
      console.log('🔍 Tentative de récupération des actualités...')
      
      // Vérifier si Supabase est configuré
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('⚠️ Supabase non configuré, utilisation du contenu de démonstration')
        setNewsPosts(DEMO_NEWS)
        setUsingDemo(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erreur lors de la récupération des actualités:', error)
        console.log('🔄 Basculement vers le contenu de démonstration')
        setNewsPosts(DEMO_NEWS)
        setUsingDemo(true)
      } else {
        console.log('✅ Actualités récupérées:', data?.length || 0, 'articles')
        if (data && data.length > 0) {
          setNewsPosts(data)
          setUsingDemo(false)
        } else {
          console.log('📝 Aucune actualité trouvée, utilisation du contenu de démonstration')
          setNewsPosts(DEMO_NEWS)
          setUsingDemo(true)
        }
      }
    } catch (error) {
      console.error('Error fetching news posts:', error)
      console.log('🔄 Basculement vers le contenu de démonstration')
      setNewsPosts(DEMO_NEWS)
      setUsingDemo(true)
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
        {usingDemo && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Contenu de démonstration affiché. Connectez Supabase pour voir le contenu réel.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Actualités</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : newsPosts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucune actualité pour le moment.</p>
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