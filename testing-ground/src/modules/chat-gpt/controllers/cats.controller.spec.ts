import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from '../services/cats.service';
import { NotFoundException } from '@nestjs/common';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;
  const cats = ['Tom', 'Whiskers', 'Garfield'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: CatsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    catsController = module.get<CatsController>(CatsController);
    catsService = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(catsController).toBeDefined();
  });

  describe('findAll', () => {
    it('should call catsService.findAll once', () => {
      jest.spyOn(catsService, 'findAll').mockReturnValue(cats);

      expect(catsController.findAll()).toBe(cats);
      expect(catsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should call catsService.findOne once with correct parameters', () => {
      jest.spyOn(catsService, 'findOne').mockReturnValue(cats[1]);

      expect(catsController.findOne('1')).toBe('Whiskers');
      expect(catsService.findOne).toHaveBeenCalledTimes(1);
      expect(catsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if cat not found', () => {
      jest.spyOn(catsService, 'findOne').mockImplementationOnce(() => {
        throw new NotFoundException('Cat not found');
      });

      expect(() => {
        catsController.findOne('99');
      }).toThrow(NotFoundException);

      expect(() => {
        catsController.findOne('99');
      }).toThrow('Cat not found');
    });
  });

  describe('create', () => {
    it('should return the same value as catsService.create', () => {
      jest.spyOn(catsService, 'create').mockReturnValue('Simba');

      expect(catsController.create('Simba')).toBe('Simba');
      expect(catsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should call catsService.delete once with correct parameters', () => {
      catsController.delete('1');
      expect(catsService.delete).toHaveBeenCalledTimes(1);
      expect(catsService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if cat not found', () => {
      catsController.delete('99');
      expect(catsService.delete).toHaveBeenCalledWith(99);
    });
  });
});
