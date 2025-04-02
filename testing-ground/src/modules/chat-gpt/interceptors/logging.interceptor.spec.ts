/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { delay, lastValueFrom, of, throwError } from 'rxjs';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
} from './logging.interceptor';

// details: https://claude.ai/share/06e17c7f-f190-4fdd-a0a9-1a0845b8fffd | devdanny

describe('Interceptors', () => {
  let loggingInterceptor: LoggingInterceptor;
  let transformInterceptor: TransformInterceptor<any>;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let timeoutInterceptor: TimeoutInterceptor;

  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
  };

  beforeEach(() => {
    loggingInterceptor = new LoggingInterceptor();
    transformInterceptor = new TransformInterceptor();
    timeoutInterceptor = new TimeoutInterceptor();

    mockContext = {
      switchToHttp: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    } as any;

    // Clear spy calls before each test
    consoleSpy.log.mockClear();
  });

  afterAll(() => {
    // Restore original console.log implementation
    // consoleSpy.log.mockRestore();

    jest.restoreAllMocks();
  });

  describe('LoggingInterceptor', () => {
    it('should log incoming request before controller execution', () => {
      loggingInterceptor.intercept(mockContext, mockCallHandler);

      expect(consoleSpy.log).toHaveBeenCalledWith('Incoming request...');
    });

    it('should log outgoing response after controller execution', (done) => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1000);

      const result = loggingInterceptor.intercept(mockContext, mockCallHandler);

      result.subscribe(() => {
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Outgoing response...'),
        );
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Time: 0ms'));
        done();
      });
    });

    it('should correctly measure execution time', (done) => {
      // let callCount = 0;
      const mockTimestamps = [1000, 2500];

      jest.spyOn(Date, 'now').mockImplementation(() => {
        // return mockTimestamps[callCount++];
        return mockTimestamps.shift();
      });

      const result = loggingInterceptor.intercept(mockContext, mockCallHandler);

      result.subscribe(() => {
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Time: 1500ms'));
        done();
      });
    });
  });

  describe('TransformInterceptor', () => {
    it('should wrap a valid response in {success: true, data}', async () => {
      // some explanation: https://stackoverflow.com/a/72083296/16906724

      const handler = {
        handle: jest.fn().mockReturnValue(of({ username: 'John', id: 1 })),
      } as any;

      const result = transformInterceptor.intercept(mockContext, handler);

      const { data, success } = await lastValueFrom(result);

      expect(data.username).toBe('John');
      expect(data.id).toBe(1);
      expect(success).toBe(true);
    });

    it('should wrap a null response in {success: true, data: null}', async () => {
      const handler = {
        handle: jest.fn().mockReturnValue(of(null)),
      } as any;

      const result = transformInterceptor.intercept(mockContext, handler);

      const { data, success } = await lastValueFrom(result);

      expect(data).toBe(null);
      expect(success).toBe(true);
    });

    it('should wrap an invalid response in {success: false, error}', async () => {
      // some explanation: https://stackoverflow.com/a/76989112/16906724
      // https://chatgpt.com/share/67e6df87-f048-800b-942a-0d044858055c | danny.lenko.14

      const handlerMock = {
        handle() {
          return throwError(() => new InternalServerErrorException('database did not respond'));
        },
      } as CallHandler;

      const result = transformInterceptor.intercept(mockContext, handlerMock);

      await expect(lastValueFrom(result)).resolves.toEqual({
        success: false,
        error: 'database did not respond',
      });
    });
  });

  describe('TimeoutInterceptor', () => {
    it('should pass if request is proccessed fastly', (done) => {
      const handler = {
        handle: jest.fn(() => of({ hello: 'Hello' })),
      } as CallHandler;

      timeoutInterceptor.intercept(mockContext, handler).subscribe({
        next: (value) => {
          expect(value).toEqual({ hello: 'Hello' });
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    });

    // Should be ideally tested also for null and arrays
    it('should pass and return {} as data if request is proccessed fastly', (done) => {
      const handler = {
        handle: jest.fn(() => of({})),
      } as CallHandler;

      timeoutInterceptor.intercept(mockContext, handler).subscribe({
        next: (value) => {
          expect(value).toEqual({});
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    });

    it('should throw timeout exception for a request with the delay', (done) => {
      const handler = {
        handle: jest.fn(() => of(null).pipe(delay(3000))),
      } as CallHandler;

      timeoutInterceptor.intercept(mockContext, handler).subscribe({
        next: () => done.fail('Expected timeout exception, but got a successful response'),
        error: (error) => {
          expect(error).toBeInstanceOf(RequestTimeoutException);
          expect(error.message).toBe('Request timed out');
          done();
        },
      });
    });

    it('should work with different response types', (done) => {
      const responseTypes = [null, {}, [], 'string', 123, true];
      let completedCount = 0;

      responseTypes.forEach((data) => {
        const handler: CallHandler = {
          handle: () => of(data),
        };

        timeoutInterceptor.intercept(mockContext, handler).subscribe({
          next: (result) => {
            expect(result).toEqual(data);
            completedCount++;

            if (completedCount === responseTypes.length) {
              done();
            }
          },
          error: (err) => done.fail(err),
        });
      });
    });
  });
});
