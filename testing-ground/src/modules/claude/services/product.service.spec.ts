import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { NotificationService } from './notification.service';
import { ProductRepository } from '../repositories/product.repository';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

const products = [
  { id: 1, name: 'Versace', price: 79, inStock: true, category: 'default' },
  { id: 2, name: 'Missoni', price: 59, inStock: true, category: 'default' },
  { id: 3, name: 'Azarro', price: 99, inStock: false, category: 'sweet' },
  { id: 4, name: 'Dunhill', price: 49, inStock: true, category: 'niche' },
];

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: ProductRepository;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findByCategory: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn(),
            sendSMS: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>(ProductRepository);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('getAvailableProducts', () => {
    it('should return available products only', async () => {
      jest.spyOn(productRepository, 'findAll').mockResolvedValueOnce(products);

      expect(await productService.getAvailableProducts()).toEqual([
        products[0],
        products[1],
        products[3],
      ]);
    });
  });

  describe('updateProductPrice', () => {
    it('should call repository.findById with the correct id', async () => {
      jest.spyOn(productRepository, 'findById').mockResolvedValueOnce(products[0]);

      await productService.updateProductPrice(1, 49);
      expect(productRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should call repository.update with the correct parameters', async () => {
      jest.spyOn(productRepository, 'findById').mockResolvedValueOnce(products[0]);

      await productService.updateProductPrice(1, 49);
      expect(productRepository.update).toHaveBeenCalledWith(1, { price: 49 });
    });

    it('should call notificationService.sendEmail when price is reduced', async () => {
      jest.spyOn(productRepository, 'findById').mockResolvedValueOnce(products[0]);

      await productService.updateProductPrice(1, 49);
      expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should NOT call notificationService.sendEmail when price is increased', async () => {
      jest.spyOn(productRepository, 'findById').mockResolvedValueOnce(products[0]);

      await productService.updateProductPrice(1, 89);
      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      jest.spyOn(productRepository, 'findByCategory').mockResolvedValueOnce([products[2]]);

      expect(await productService.getProductsByCategory('niche')).toEqual([products[2]]);
    });

    it('should throw NotFoundException if products not found', async () => {
      jest.spyOn(productRepository, 'findByCategory').mockResolvedValueOnce([]);

      await expect(productService.getProductsByCategory('niche')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should send notificationService.sendEmail if an error, other than NotFound occurs in the repository', async () => {
      jest
        .spyOn(productRepository, 'findByCategory')
        .mockRejectedValueOnce(new InternalServerErrorException('Service did not respond'));

      await expect(productService.getProductsByCategory('electronics')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('archiveProductsByCategory', () => {
    it('should correctly update every product', async () => {
      jest
        .spyOn(productRepository, 'findByCategory')
        .mockResolvedValueOnce([products[0], products[1]]);

      expect(products[0].inStock).toBeTruthy();

      await productService.archiveProductsByCategory('default');

      expect(productRepository.update).toHaveBeenCalledWith(1, { inStock: false });
      expect(productRepository.update).toHaveBeenCalledWith(2, { inStock: false });

      expect(productRepository.update).toHaveBeenCalledTimes(2);
    });

    it('should send correct notification', async () => {
      jest
        .spyOn(productRepository, 'findByCategory')
        .mockResolvedValueOnce([products[0], products[1]]);

      await productService.archiveProductsByCategory('default');

      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'admin@store.com',
        'Category Archiving Report',
        `Successfully archived 2 products in category default`,
      );
    });

    it('should return correct number of updated products', async () => {
      jest
        .spyOn(productRepository, 'findByCategory')
        .mockResolvedValueOnce([products[0], products[1]]);

      expect(await productService.archiveProductsByCategory('default')).toBe(2);
    });

    it('should throw correct InternalServerErrorException', async () => {
      jest
        .spyOn(productRepository, 'findByCategory')
        .mockRejectedValue(new InternalServerErrorException('Service did not respond'));

      await expect(productService.archiveProductsByCategory('default')).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(productService.archiveProductsByCategory('default')).rejects.toThrow(
        'Failed to archive products in category default: Service did not respond',
      );
    });
  });
});
