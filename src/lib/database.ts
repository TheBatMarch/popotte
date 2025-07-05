import { localStorage as localDB } from './localStorage'
import type { User, Category, Product, Order, OrderItem, NewsPost } from './localStorage'

class LocalDatabase {
  // NEWS
  async getNews(published?: boolean): Promise<NewsPost[]> {
    return localDB.getNews(published)
  }

  async createNews(data: Omit<NewsPost, 'id' | 'created_at'>): Promise<NewsPost> {
    return localDB.createNews(data)
  }

  async updateNews(id: string, data: Partial<NewsPost>): Promise<NewsPost> {
    return localDB.updateNews(id, data)
  }

  async deleteNews(id: string): Promise<void> {
    return localDB.deleteNews(id)
  }

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    return localDB.getCategories()
  }

  async createCategory(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    return localDB.createCategory(data)
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return localDB.updateCategory(id, data)
  }

  async moveCategoryUp(id: string): Promise<void> {
    const categories = localDB.getCategories()
    const currentIndex = categories.findIndex(c => c.id === id)
    if (currentIndex <= 0) return

    const current = categories[currentIndex]
    const previous = categories[currentIndex - 1]
    
    // Échanger les display_order
    const tempOrder = current.display_order
    localDB.updateCategory(current.id, { display_order: previous.display_order })
    localDB.updateCategory(previous.id, { display_order: tempOrder })
  }

  async moveCategoryDown(id: string): Promise<void> {
    const categories = localDB.getCategories()
    const currentIndex = categories.findIndex(c => c.id === id)
    if (currentIndex >= categories.length - 1) return

    const current = categories[currentIndex]
    const next = categories[currentIndex + 1]
    
    // Échanger les display_order
    const tempOrder = current.display_order
    localDB.updateCategory(current.id, { display_order: next.display_order })
    localDB.updateCategory(next.id, { display_order: tempOrder })
  }

  // PRODUCTS
  async getProducts(available?: boolean): Promise<Product[]> {
    return localDB.getProducts(available)
  }

  async createProduct(data: Omit<Product, 'id' | 'categories'>): Promise<Product> {
    return localDB.createProduct(data)
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return localDB.updateProduct(id, data)
  }

  async deleteProduct(id: string): Promise<void> {
    return localDB.deleteProduct(id)
  }

  // ORDERS
  async getOrders(userId?: string): Promise<Order[]> {
    return localDB.getOrders(userId)
  }

  async createOrder(data: {
    user_id: string
    total_amount: number
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      variant?: string
    }>
  }): Promise<Order> {
    return localDB.createOrder(data)
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    return localDB.updateOrder(id, data)
  }

  // USERS
  async getUsers(): Promise<User[]> {
    return localDB.getUsers()
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return localDB.getOrders(userId)
  }

  // ADMIN FUNCTIONS
  async createAdminUser(email: string, password: string, fullName: string): Promise<void> {
    localDB.createUser({
      email,
      full_name: fullName,
      username: email.split('@')[0],
      role: 'admin'
    })
  }

  // STATISTICS
  async getStatistics(): Promise<{
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
  }> {
    return localDB.getStatistics()
  }
}

export const database = new LocalDatabase()
export type { User as Profile, Category, Product, Order, OrderItem, NewsPost }