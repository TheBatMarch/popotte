import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface NewsPost {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
}

export function News() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('news_posts')
          .update({
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url || null
          })
          .eq('id', editingPost.id)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase
          .from('news_posts')
          .insert({
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url || null
          })

        if (error) throw error
      }

      // Reset form and refresh posts
      setFormData({ title: '', content: '', image_url: '' })
      setEditingPost(null)
      setIsCreating(false)
      fetchPosts()
      alert(editingPost ? 'Article modifié !' : 'Article créé !')
    } catch (error: any) {
      alert('Erreur : ' + error.message)
    }
  }

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      image_url: post.image_url || ''
    })
    setIsCreating(true)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      
      fetchPosts()
      alert('Article supprimé !')
    } catch (error: any) {
      alert('Erreur : ' + error.message)
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', content: '', image_url: '' })
    setEditingPost(null)
    setIsCreating(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestion des actualités</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nouvel article</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                URL de l'image (optionnel)
              </label>
              <input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="input mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Contenu
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input mt-1 h-32 resize-none"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <Save size={20} />
                <span>{editingPost ? 'Modifier' : 'Créer'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucun article trouvé.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="card">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(post.created_at)}
                  </p>
                  <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}