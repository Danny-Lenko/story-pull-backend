import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  // Spy on console methods
  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
  };

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    // Create mock implementations
    mockContext = {
      switchToHttp: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({})),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Clear spy calls before each test
    consoleSpy.log.mockClear();
  });

  afterAll(() => {
    // Restore original console.log implementation
    consoleSpy.log.mockRestore();
  });

  it('should log incoming request before controller execution', () => {
    // Act
    interceptor.intercept(mockContext, mockCallHandler);

    // Assert
    expect(consoleSpy.log).toHaveBeenCalledWith('Incoming request...');
  });

  it('should log outgoing response after controller execution', (done) => {
    // Arrange
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);

    // Act
    const result = interceptor.intercept(mockContext, mockCallHandler);

    // Assert
    result.subscribe(() => {
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Outgoing response...'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Time: 0ms'));

      jest.useRealTimers();
      done();
    });
  });

  it('should correctly measure execution time', (done) => {
    // Arrange
    let callCount = 0;
    const mockTimestamps = [1000, 2500]; // Simulating 1.5 seconds execution time

    jest.spyOn(Date, 'now').mockImplementation(() => {
      return mockTimestamps[callCount++];
    });

    mockCallHandler.handle.mockReturnValue(of({}));

    // Act
    const result = interceptor.intercept(mockContext, mockCallHandler);

    // Assert
    result.subscribe(() => {
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Time: 1500ms'));

      jest.useRealTimers();
      done();
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { LoggingInterceptor } from './logging.interceptor';
// import { CallHandler, ExecutionContext } from '@nestjs/common';
// import { firstValueFrom, Observable, of, Subscriber } from 'rxjs';

// describe('LoggingInterceptor', () => {
//   let loggingInterceptor: LoggingInterceptor;
//   let next: CallHandler;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [LoggingInterceptor],
//     }).compile();

//     next = {
//       handle: jest.fn().mockReturnValue(of(null)),
//     };

//     jest.spyOn(console, 'log').mockImplementation(() => {});

//     loggingInterceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
//   });

//   describe('LoggingInterceptor', () => {
//     it('should log <Incoming request...> before controller execution', () => {
//       jest.spyOn(console, 'log');

//       loggingInterceptor.intercept({} as ExecutionContext, next);
//       expect(console.log).toHaveBeenCalledTimes(1);
//       expect(console.log).toHaveBeenCalledWith('Incoming request...');
//     });

//     it('should log <Outgoing response... Time:> before controller execution', (done) => {
//       next = {
//         handle: jest.fn().mockReturnValue(of(null)),
//       };
//       jest.spyOn(console, 'log');

//       loggingInterceptor.intercept({} as ExecutionContext, next).subscribe(() => {
//         expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Outgoing response...'));
//         done();
//       });
//     });

//     it('should correctly calculate execution time', async () => {
//       // jest.spyOn(console, 'log');

//       await firstValueFrom(loggingInterceptor.intercept({} as ExecutionContext, next));

//       const logCalls = console.log.mock.calls;
//       const timeLog = logCalls.find((call) => call[0].includes('Outgoing response...'));
//       const timeTaken = parseInt(timeLog[0].match(/\d+/)[0], 10);

//       expect(timeTaken).toBeGreaterThanOrEqual(0); // Очікуємо хоча б 0 мс, бо `of(null)` швидкий
//     });
//   });
// });
