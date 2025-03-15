import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { DatabaseService } from './database.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { NotFoundException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('CatsService', () => {
  let catsService: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatsService],
    })
      .useMocker((token) => {
        if (token === DatabaseService) {
          const cats = ['Tom', 'Whiskers', 'Garfield'];
          return {
            findAll: jest.fn().mockResolvedValue(cats),
            findOne: jest.fn().mockImplementation((id) => {
              if (!cats[id]) {
                throw new NotFoundException('Cat not found');
              }
              return cats[id];
            }),
            create: jest.fn().mockImplementation(async (cat) => {
              cats.push(cat);
              return cat;
            }),
            delete: jest.fn().mockImplementation((id) => {
              if (!cats[id]) {
                throw new NotFoundException('Cat not found');
              }
              cats.splice(id, 1);
            }),
          };
        }
        if (typeof token === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    catsService = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(catsService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      expect(await catsService.findAll()).toEqual(['Tom', 'Whiskers', 'Garfield']);
    });
  });

  describe('findOne', () => {
    it('should find and return a cat by an index argument', () => {
      expect(catsService.findOne(0)).toBe('Tom');
      expect(catsService.findOne(2)).toBe('Garfield');
    });

    it('should throw NotFoundException if cat not found', () => {
      expect(() => {
        catsService.findOne(99);
      }).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should save and return a new cat', async () => {
      expect(await catsService.create('Simba')).toBe('Simba');
      expect(await catsService.findAll()).toContain('Simba');
    });
  });

  describe('delete', () => {
    it('should delete a cat by an index parameter', () => {
      catsService.delete(1);
      expect(catsService.findAll()).not.toContain('Whiskers');
    });

    it('should throw NotFoundException if cat not found', () => {
      expect(() => {
        catsService.delete(99);
      }).toThrow(NotFoundException);
    });
  });
});
