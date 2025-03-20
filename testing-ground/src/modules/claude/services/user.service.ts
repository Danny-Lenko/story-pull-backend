// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  createUser(name: string, email: string): User {
    const newUser = {
      id: this.idCounter++,
      name,
      email,
    };
    this.users.push(newUser);
    return newUser;
  }

  getUserById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
