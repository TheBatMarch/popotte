import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
  categories?: {
    name: string
  }
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        is_available: formData.is_available
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error
      }

      // Reset form and refresh products
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_available: true
      })
      setEditingProduct(null)
      setIsCreating(false)
      fetchProducts()
      alert(editingProduct ? 'Produit modifié !' : 'Produit créé !')
    } catch (error: any) {
      alert('Erreur : ' + error.message)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      is_available: product.is_available
    })
    setIsCreating(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      
      fetchProducts()
      alert('Produit supprimé !')
    } catch (error: any) {
      alert('Erreur : ' + error.message)
    }
  }

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentStatus })
        .eq('id', productId)

      if (error) throw error
      
      fetchProducts()
    } catch (error: any) {
      alert('Erreur : ' + error.message)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true
    })
    setEditingProduct(null)
    setIsCreating(false)
  }

  const formatPrice = (price: number) => {
    return price.toFixed(2) + ' €'
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
        <h2 className="text-xl font-semibold">Gestion des produits</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nouveau produit</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du produit
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (optionnel)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input mt-1 h-20 resize-none"
                placeholder="Description du produit..."
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Prix (€)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="input mt-1"
              >
                <option value="">Aucune catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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

            <div className="flex items-center">
              <input
                id="is_available"
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                Produit disponible
              </label>
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <Save size={20} />
                <span>{editingProduct ? 'Modifier' : 'Créer'}</span>
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
        {products.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucun produit trouvé.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="card">
              <div className="flex items-start space-x-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                  
                  <p className="text-lg font-bold text-primary-600 mb-1">
                    {formatPrice(product.price)}
                  </p>
                  
                  {product.categories && (
                    <p className="text-sm text-gray-500 mb-1">
                      Catégorie: {product.categories.name}
                    </p>
                  )}
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => toggleAvailability(product.id, product.is_available)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.is_available 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={product.is_available ? 'Marquer comme indisponible' : 'Marquer comme disponible'}
                  >
                    {product.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
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