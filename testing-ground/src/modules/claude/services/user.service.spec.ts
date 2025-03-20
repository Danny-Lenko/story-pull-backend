import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
    userService['users'] = [];
    userService['idCounter'] = 1;
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user with correct properties', () => {
      const user = userService.createUser('John', 'john@email.com');
      expect(user).toEqual({
        id: 1,
        name: 'John',
        email: 'john@email.com',
      });
    });

    it('should assign unique id for each user', () => {
      const user1 = userService.createUser('John', 'john@email.com');
      const user2 = userService.createUser('Jack', 'jack@email.com');

      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
      expect(user1.id).not.toBe(user2.id);
    });

    it('should add user to internal users array', () => {
      const user = userService.createUser('John', 'john@email.com');
      expect(userService['users']).toContainEqual(user);

      const user2 = userService.createUser('Jack', 'jack@email.com');
      expect(userService['users']).toContainEqual(user2);
      expect(userService['users'].length).toBe(2);
    });
  });
});
