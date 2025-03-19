import { Test, TestingModule } from '@nestjs/testing';
import { MathService } from './math.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('MathService', () => {
  let mathService: MathService;
  let httpService: HttpService;
  let mockResponse: AxiosResponse<{ value: number }>;

  beforeEach(async () => {
    mockResponse = {
      data: { value: 21 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MathService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    mathService = module.get<MathService>(MathService);
    httpService = module.get<HttpService>(HttpService);

    mathService['cache'] = new Map();
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

  describe('sumObjectValues', () => {
    it('should calculate the sum of the "a" & "b" properties of an input object', () => {
      expect(mathService.sumObjectValues({ a: 4, b: 7 })).toBe(11);
      expect(mathService.sumObjectValues({ a: 4, b: -7 })).toBe(-3);
      expect(mathService.sumObjectValues({ a: 0, b: 0 })).toBe(0);
      expect(mathService.sumObjectValues({ a: 0.1, b: 0.2 })).toBeCloseTo(0.3, 5);
    });

    it('should throw BadRequestException if parameter object is missing a required property', () => {
      const brokenObject = { a: 7 } as never;

      expect(() => {
        mathService.sumObjectValues(brokenObject);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.sumObjectValues(brokenObject);
      }).toThrow('Object must contain properties "a" and "b"');
    });

    it('should throw BadRequestException if parameter object is empty', () => {
      const brokenObject = {} as never;

      expect(() => {
        mathService.sumObjectValues(brokenObject);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.sumObjectValues(brokenObject);
      }).toThrow('Object must contain properties "a" and "b"');
    });

    it('should throw BadRequestException if parameter is not an object', () => {
      const brokenObject = '' as never;

      expect(() => {
        mathService.sumObjectValues(brokenObject);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.sumObjectValues(brokenObject);
      }).toThrow('Object must contain properties "a" and "b"');
    });
  });

  describe('asyncSum', () => {
    it('should return the sum of two positive numbers', async () => {
      expect(await mathService.asyncSum(8, 7)).toBe(15);
      expect(await mathService.asyncSum(0, 0)).toBe(0);
      expect(await mathService.asyncSum(0.1, 0.2)).toBeCloseTo(0.3, 5);
      expect(await mathService.asyncSum(Number.MAX_SAFE_INTEGER, 1)).toBe(
        Number.MAX_SAFE_INTEGER + 1,
      );
    });

    it('should throw BadRequestException if one of parameters is negative', async () => {
      await expect(mathService.asyncSum(-8, 7)).rejects.toThrow(BadRequestException);
      await expect(mathService.asyncSum(-8, 7)).rejects.toThrow('Numbers cannot be negative');
    });
  });

  describe('fetchAndDouble', () => {
    it('should return the doubled value from the API response', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));
      expect(await mathService.fetchAndDouble(21)).toBe(42);
    });

    it('should throw BadRequestException if request failed', async () => {
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new BadRequestException('Failed to fetch number');
      });

      await expect(mathService.fetchAndDouble(21)).rejects.toThrow(BadRequestException);
    });

    it('should handle correctly a status 500 error', async () => {
      const serverError = new InternalServerErrorException('Internal Error');

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw serverError;
      });

      await expect(mathService.fetchAndDouble(21)).rejects.toThrow(BadRequestException);
    });

    it('should send a request to the right URL', async () => {
      const spy = jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));
      await mathService.fetchAndDouble(21);
      expect(spy).toHaveBeenCalledWith('https://api.example.com/number/21');
    });
  });

  describe('getCachedSquare', () => {
    it('should return the square of a number', () => {
      expect(mathService.getCachedSquare(9)).toBe(81);
      expect(mathService.getCachedSquare(0)).toBe(0);
      expect(mathService.getCachedSquare(-8)).toBe(64);
      expect(mathService.getCachedSquare(0.5)).toBe(0.25);
    });

    it('should add the result to the cache on first call', () => {
      const spy = jest.spyOn(mathService['cache'], 'set');
      mathService.getCachedSquare(9);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should use cached value on subsequent calls', () => {
      const set = jest.spyOn(mathService['cache'], 'set');
      const has = jest.spyOn(mathService['cache'], 'has');
      const get = jest.spyOn(mathService['cache'], 'get');

      mathService.getCachedSquare(9);
      expect(set).toHaveBeenCalledTimes(1);
      expect(has).toHaveBeenCalledWith('square:9');
      expect(get).toHaveBeenCalledTimes(0);

      mathService.getCachedSquare(9);
      expect(get).toHaveBeenCalledTimes(1);
      expect(set).toHaveBeenCalledTimes(1);
    });

    it('should remove item from cache and add there it again after', () => {
      const set = jest.spyOn(mathService['cache'], 'set');

      mathService.getCachedSquare(9);
      expect(set).toHaveBeenCalledTimes(1);
      expect(mathService['cache'].has('square:9')).toBe(true);

      mathService['cache'].delete('square:9');
      mathService.getCachedSquare(9);
      expect(set).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDaysUntilEndOfYear', () => {
    it('should return the correct number of days until the end of the year', () => {
      expect(mathService.getDaysUntilEndOfYear(new Date('2025-3-19'))).toBe(287);
      expect(mathService.getDaysUntilEndOfYear(new Date('3/19/2025'))).toBe(287);
      expect(mathService.getDaysUntilEndOfYear(new Date('March 19, 2025'))).toBe(287);
      expect(mathService.getDaysUntilEndOfYear(new Date(2025, 2, 19))).toBe(287);
      expect(mathService.getDaysUntilEndOfYear(new Date(2025, 11, 31))).toBe(0);
      expect(mathService.getDaysUntilEndOfYear(new Date(2025, 0, 1))).toBe(364);
      expect(mathService.getDaysUntilEndOfYear(new Date(2024, 0, 1))).toBe(365);
    });

    it('should throw a BadRequestException if date is after the end of the 2025 year', () => {
      expect(() => {
        mathService.getDaysUntilEndOfYear(new Date(1767132000001));
      }).toThrow(BadRequestException);
    });
  });

  describe('doubleArray', () => {
    it('should return an array with each element doubled', () => {
      expect(mathService.doubleArray([11])).toEqual([22]);
      expect(mathService.doubleArray([2, 0, -3, 0.7, Number.MAX_SAFE_INTEGER])).toEqual([
        4,
        0,
        -6,
        1.4,
        Number.MAX_SAFE_INTEGER * 2,
      ]);
    });

    it('should throw a BadRequestException if the input array is empty', () => {
      expect(() => {
        mathService.doubleArray([]);
      }).toThrow(BadRequestException);
    });
  });

  describe('calculateDistance', () => {
    it('should return the distance of a point in the Decart system', () => {
      expect(mathService.calculateDistance({ x: 3, y: 4 })).toBe(5);
      expect(mathService.calculateDistance({ x: 0, y: 0 })).toBe(0);
      expect(mathService.calculateDistance({ x: 6, y: -8 })).toBe(10);
      expect(mathService.calculateDistance({ x: 1.5, y: 2.5 })).toBeCloseTo(2.915, 3);
    });

    it('should throw BadRequestException if input object is empty or input data is insufficient', () => {
      expect(() => {
        mathService.calculateDistance({} as never);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.calculateDistance({ a: 7 } as never);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.calculateDistance({ b: 2 } as never);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.calculateDistance(null as never);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.calculateDistance(undefined as never);
      }).toThrow(BadRequestException);
    });
  });

  describe('reverseString', () => {
    it('should the reversed version of the input string', () => {
      expect(mathService.reverseString('Hello')).toBe('olleH');
      expect(mathService.reverseString('   ')).toBe('   ');
      expect(mathService.reverseString('X')).toBe('X');
      expect(mathService.reverseString('  Hello   World!  ')).toBe('  !dlroW   olleH  ');
      expect(mathService.reverseString('$&*$Y@)(*$&@^!')).toBe('!^@&$*()@Y$*&$');
    });

    it('should throw a BadRequestException if the input string is empty', () => {
      expect(() => {
        mathService.reverseString('');
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.reverseString('');
      }).toThrow('String cannot be empty');
    });
  });

  describe('sumArrayObjectValues', () => {
    it('hould return the sum of "value" properties from the input array', () => {
      expect(mathService.sumArrayObjectValues([{ value: 1 }, { value: 2 }, { value: 3 }])).toBe(6);
      expect(mathService.sumArrayObjectValues([{ value: 1 }])).toBe(1);
      expect(mathService.sumArrayObjectValues([{ value: 1 }, { value: 2 }, { value: -3 }])).toBe(0);
      expect(
        mathService.sumArrayObjectValues([{ value: 1.5 }, { value: 0 }, { value: -3.2 }]),
      ).toBeCloseTo(-1.7);
    });

    it('should throw BadRequestException if any object is invalid', () => {
      expect(() => {
        mathService.sumArrayObjectValues([{} as never, { value: 5 }]);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.sumArrayObjectValues([{ value: 'hello' } as never, { value: 5 }]);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.sumArrayObjectValues([]);
      }).toThrow(BadRequestException);

      expect(() => {
        mathService.sumArrayObjectValues([]);
      }).toThrow(BadRequestException);
    });
  });
});
