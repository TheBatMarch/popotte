import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { mockDatabase } from '../../lib/mockDatabase'
import type { Product, Category } from '../../lib/mockData'

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
      const data = await mockDatabase.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await mockDatabase.getCategories()
      setCategories(data)
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
        await mockDatabase.updateProduct(editingProduct.id, productData)
      } else {
        await mockDatabase.createProduct(productData)
      }

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
      await mockDatabase.deleteProduct(productId)
      fetchProducts()
      alert('Produit supprimé !')
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          💡 Mode démonstration - Les produits sont stockés temporairement.
        </p>
      </div>

      <div className="flex items-center justify-between">
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
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    {!product.is_available && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Indisponible
                      </span>
                    )}
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-2">{product.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="font-semibold text-primary-600">
                      {product.price.toFixed(2)} €
                    </span>
                    {product.categories && (
                      <span>Catégorie: {product.categories.name}</span>
                    )}
                  </div>
                  
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg mt-2"
                    />
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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