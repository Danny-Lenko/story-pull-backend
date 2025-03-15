import { Test, TestingModule } from '@nestjs/testing';
import { MathService } from './math.service';
import { BadRequestException } from '@nestjs/common';

describe('MathService', () => {
  let mathService: MathService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MathService],
    }).compile();

    mathService = module.get<MathService>(MathService);
  });

  it('should be defined', () => {
    expect(mathService).toBeDefined();
  });

  describe('add', () => {
    it('should return the sub of two numbers', () => {
      expect(mathService.add(1, 1)).toBe(2);
      expect(mathService.add(11, 11)).toBe(22);
    });

    it('should handle negative numbers', () => {
      expect(mathService.add(-1, -2)).toBe(-3);
    });

    it('should handle decimal numbers', () => {
      expect(mathService.add(1.5, 2.5)).toBe(4);
    });
  });

  describe('divide', () => {
    it('should return the result of two numbers division', () => {
      expect(mathService.divide(1, 5)).toBe(0.2);
      expect(mathService.divide(10, 2)).toBe(5);
    });

    it('should throw BadRequestException if the divider is zero', () => {
      expect(() => {
        mathService.divide(5, 0);
      }).toThrow(BadRequestException);
    });

    it('should handle negative numbers', () => {
      expect(mathService.divide(20, -4)).toBe(-5);
    });

    it('should handle decimal numbers', () => {
      expect(mathService.divide(1.5, 2.5)).toBe(0.6);
    });
  });
});
