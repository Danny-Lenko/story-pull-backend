import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    validationService = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });

  describe('validatePrice', () => {
    it('should return isValid: true & empty error array', () => {
      expect(validationService.validatePrice(999999.99).isValid).toBe(true);
      expect(validationService.validatePrice(999999.99).errors).toHaveLength(0);
    });

    it.each([
      ['hello', 'Price must be a number'],
      [-10, 'Price must be greater than zero'],
      [0, 'Price must be greater than zero'],
      [1000001, 'Price exceeds maximum allowed (1,000,000)'],
      [1000000.01, 'Price exceeds maximum allowed (1,000,000)'],
    ])(
      'should add a specific message to errors array depending on a condition',
      (price, expected) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(validationService.validatePrice(price as any)['errors']).toContain(expected);
      },
    );
  });

  describe('validateProductData', () => {
    it('should NOT throw exceptions', () => {
      expect(() => {
        validationService.validateProductData({ name: 'John', price: 49, category: 'niche' });
      }).not.toThrow();
    });

    it.each([
      [null, 'Invalid product data'],
      ['hello', 'Invalid product data'],
      [{}, 'Name must be a string with at least 3 characters'],
      [{ name: 3 }, 'Name must be a string with at least 3 characters'],
      [{ name: 'OG' }, 'Name must be a string with at least 3 characters'],
      [{ name: 'John', price: null }, 'Price must be a number'],
      [
        { name: 'John', price: 10, category: 11 },
        'Category must be a string with at least 2 characters',
      ],
      [
        { name: 'John', price: 10, category: 'G' },
        'Category must be a string with at least 2 characters',
      ],
    ])('should throw specific error message depending on a condition', (data, expected) => {
      expect(() => {
        validationService.validateProductData(data);
      }).toThrow(expected);
    });
  });
});
