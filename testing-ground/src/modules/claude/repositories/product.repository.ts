import { Product } from '../interfaces/product.interface';

// Імітація репозиторію для роботи з базою даних
export class ProductRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(id: number): Promise<Product | null> {
    // У реальному додатку тут був би запит до бази даних
    return null;
  }

  async findAll(): Promise<Product[]> {
    // У реальному додатку тут був би запит до бази даних
    return [];
  }

  async save(product: Omit<Product, 'id'>): Promise<Product> {
    // У реальному додатку тут був би запит до бази даних
    return { id: 1, ...product };
  }

  async update(id: number, product: Partial<Product>): Promise<Product | null> {
    return { id, name: 'Test', price: 0, inStock: true, category: 'default', ...product };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByCategory(category: string): Promise<Product[]> {
    return [];
  }
}
