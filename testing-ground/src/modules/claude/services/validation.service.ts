// validation.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';

export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class ValidationService {
  validatePrice(price: number): ProductValidationResult {
    const errors = [];

    if (typeof price !== 'number') {
      errors.push('Price must be a number');
    }

    if (price <= 0) {
      errors.push('Price must be greater than zero');
    }

    if (price > 1000000) {
      errors.push('Price exceeds maximum allowed (1,000,000)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateProductData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Invalid product data');
    }

    if (!data.name || typeof data.name !== 'string' || data.name.length < 3) {
      throw new BadRequestException('Name must be a string with at least 3 characters');
    }

    const priceValidation = this.validatePrice(data.price);
    if (!priceValidation.isValid) {
      throw new BadRequestException(priceValidation.errors.join(', '));
    }

    if (data.category && (typeof data.category !== 'string' || data.category.length < 2)) {
      throw new BadRequestException('Category must be a string with at least 2 characters');
    }
  }
}
