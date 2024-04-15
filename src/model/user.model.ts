import { User } from '@prisma/client';

export class RegisterUser {
  username: string;
  password: string;
  name: string;
}

export class UserResponse {
  username: string;
  name: string;
  token?: string;

  constructor(readonly user: Partial<User>) {
    this.username = user.username;
    this.name = user.name;
    this.token = user.token;
  }
}

export class LoginUser {
  username: string;
  password: string;
}

export class UpdateUser {
  name?: string;
  password?: string;
}
