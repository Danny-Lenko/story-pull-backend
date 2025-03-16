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

      expect(() => {
        mathService.divide(5, 0);
      }).toThrow('Division by zero is not allowed');
    });

    it('should handle negative numbers', () => {
      expect(mathService.divide(20, -4)).toBe(-5);
    });

    it('should handle decimal numbers', () => {
      expect(mathService.divide(1.5, 2.5)).toBe(0.6);
    });

    it('should return zero if the numerator is zero', () => {
      expect(mathService.divide(0, 5)).toBe(0);
    });
  });

  describe('findMax', () => {
    it('should return the largest number of an array', () => {
      expect(mathService.findMax([11, 22, 33])).toBe(33);
      expect(mathService.findMax([-11, -22, -33])).toBe(-11);
      expect(mathService.findMax([22, 22, 22])).toBe(22);
      expect(mathService.findMax([33])).toBe(33);
    });

    it('should throw BadRequestException if argument array is empty', () => {
      expect(() => {
        mathService.findMax([]);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.findMax([]);
      }).toThrow('Array cannot be empty');
    });
  });

  describe('calculateAverage', () => {
    it('should return the average of an array of numbers', () => {
      expect(mathService.calculateAverage([11, 22, 33])).toBe(22);
      expect(mathService.calculateAverage([-11, -22, -33])).toBe(-22);
      expect(mathService.calculateAverage([33])).toBe(33);
      expect(mathService.calculateAverage([3.3, 2.2, 1.1])).toBeCloseTo(2.2, 5);
    });

    it('should throw BadRequestException if argument array is empty', () => {
      expect(() => {
        mathService.calculateAverage([]);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.calculateAverage([]);
      }).toThrow('Array cannot be empty');
    });
  });

  describe('getStringLength', () => {
    it('should return the length of a non-empty string', () => {
      expect(mathService.getStringLength('Hello World')).toBe(11);
      expect(mathService.getStringLength('X')).toBe(1);
      expect(
        mathService.getStringLength(' afjpsd843 j3p4ot j3poi4t laf*$(*^)_*$U#                  '),
      ).toBe(58);
      expect(mathService.getStringLength('        ')).toBe(8);
    });

    it('should throw BadRequestException if argument string is empty', () => {
      expect(() => {
        mathService.getStringLength('');
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.getStringLength('');
      }).toThrow('String cannot be empty');
    });
  });
});
