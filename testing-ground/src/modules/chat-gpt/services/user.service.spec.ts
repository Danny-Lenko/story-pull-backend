import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

describe('UserService', () => {
  let userService: UserService;
  let httpService: HttpService;
  let mockResponse: AxiosResponse<{ name: string }>;

  beforeEach(async () => {
    mockResponse = {
      data: { name: 'John' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userService['users'] = [{ id: 1, name: 'John Doe', age: 30 }];
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findUserById', () => {
    it('should throw NotFoundException if user not found', () => {
      expect(() => {
        userService.findUserById(99);
      }).toThrow(new NotFoundException('User with ID 99 not found'));
    });
  });

  describe('createUser', () => {
    it('should throw a BadRequestException if name is a falsy value', () => {
      expect(() => {
        userService.createUser(null, 19);
      }).toThrow(BadRequestException);
    });

    it.each([
      [null, 19, 'Name is required'],
      ['John', 17, 'Age must be at least 18'],
    ])('should throw proper error message', (name, age, errorMessage) => {
      expect(() => {
        userService.createUser(name, age);
      }).toThrow(errorMessage);
    });
  });

  describe('getRandomUserName', () => {
    it('should return a random user name from the api', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      expect(await userService.getRandomUserName()).toBe('John');
    });

    it('should throw InternalServerErrorException if API request fails', async () => {
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
        throw new InternalServerErrorException('httpService did not respond');
      });

      await expect(userService.getRandomUserName()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
