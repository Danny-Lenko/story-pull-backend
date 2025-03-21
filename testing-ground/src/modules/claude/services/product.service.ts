// product.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../interfaces/product.interface';

@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private notificationService: NotificationService,
  ) {}

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async getAvailableProducts(): Promise<Product[]> {
    const products = await this.productRepository.findAll();
    return products.filter((product) => product.inStock);
  }

  async createProduct(name: string, price: number): Promise<Product> {
    return this.productRepository.save({
      name,
      price,
      inStock: true,
      category: 'default',
    });
  }

  async updateProductPrice(id: number, newPrice: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Якщо ціна знижується, відправляємо сповіщення адміністратору
    if (newPrice < product.price) {
      await this.notificationService.sendEmail(
        'admin@store.com',
        'Price Reduction Alert',
        `Price for product ${product.name} reduced from ${product.price} to ${newPrice}`,
      );
    }

    const updatedProduct = await this.productRepository.update(id, { price: newPrice });
    return updatedProduct;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.productRepository.findByCategory(category);
      if (!products || products.length === 0) {
        throw new NotFoundException(`No products found in category: ${category}`);
      }
      return products;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Логуємо помилку
      // console.error(`Error fetching products for category ${category}:`, error);
      // Надсилаємо сповіщення про помилку
      await this.notificationService.sendEmail(
        'support@store.com',
        'Database Error',
        `Failed to fetch products for category ${category}: ${error.message}`,
      );
      // Повертаємо узагальнену помилку
      throw new InternalServerErrorException('Failed to fetch products. Please try again later.');
    }
  }

  async archiveProductsByCategory(category: string): Promise<number> {
    try {
      const products = await this.productRepository.findByCategory(category);
      if (!products || products.length === 0) {
        return 0;
      }

      let archivedCount = 0;
      for (const product of products) {
        await this.productRepository.update(product.id, { inStock: false });
        archivedCount++;
      }

      // Відправляємо звіт
      await this.notificationService.sendEmail(
        'admin@store.com',
        'Category Archiving Report',
        `Successfully archived ${archivedCount} products in category ${category}`,
      );

      return archivedCount;
    } catch (error) {
      // Обробляємо помилку і перекидаємо далі
      throw new InternalServerErrorException(
        `Failed to archive products in category ${category}: ${error.message}`,
      );
    }
  }
}
