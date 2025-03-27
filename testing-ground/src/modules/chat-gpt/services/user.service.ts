import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [{ id: 1, name: 'John Doe', age: 30 }];

  constructor(private readonly httpService: HttpService) {}

  findUserById(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  createUser(name: string, age: number) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    if (age < 18) {
      throw new BadRequestException('Age must be at least 18');
    }

    const newUser = { id: this.users.length + 1, name, age };
    this.users.push(newUser);
    return newUser;
  }

  async getRandomUserName(): Promise<string> {
    const response = await this.httpService.get('https://api.example.com/random-user').toPromise();
    return response.data.name;
  }
}
