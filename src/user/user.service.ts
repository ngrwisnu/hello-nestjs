import { HttpException, Injectable } from '@nestjs/common';
import {
  RegisterUser,
  LoginUser,
  UserResponse,
  UpdateUser,
} from '../model/user.model';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { ValidationService } from '../common/validation.service';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validation: ValidationService,
    private prisma: PrismaService,
  ) {}

  async register(request: RegisterUser): Promise<UserResponse> {
    const payload = this.validation.validate(UserValidation.REGISTER, request);

    const totalUserInDB = await this.prisma.user.count({
      where: {
        username: payload.username,
      },
    });

    if (totalUserInDB !== 0) {
      throw new HttpException('Username already exist', 400);
    }

    payload.password = await bcrypt.hash(payload.password, 10);

    const user = await this.prisma.user.create({
      data: payload,
      select: {
        username: true,
        name: true,
        token: true,
      },
    });

    return new UserResponse(user);
  }

  async login(request: LoginUser): Promise<UserResponse> {
    const payload = this.validation.validate(UserValidation.LOGIN, request);

    const user = await this.prisma.user.findUnique({
      where: {
        username: payload.username,
      },
    });

    if (!user) {
      throw new HttpException('Username or password is wrong', 400);
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Username or password is wrong', 400);
    }

    const res = await this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: uuid(),
      },
      select: {
        username: true,
        name: true,
        token: true,
      },
    });

    return new UserResponse(res);
  }

  async get(user: User): Promise<UserResponse> {
    return new UserResponse(user);
  }

  async update(user: User, request: UpdateUser): Promise<UserResponse> {
    const payload = this.validation.validate(UserValidation.UPDATE, request);

    if (payload.name) {
      user.name = payload.name;
    }

    if (payload.password) {
      user.password = await bcrypt.hash(payload.password, 10);
    }

    const result = await this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: user,
      select: {
        username: true,
        name: true,
        token: true,
      },
    });

    return new UserResponse(result);
  }

  async logout(user: User): Promise<UserResponse> {
    const result = await this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: null,
      },
    });

    return new UserResponse(result);
  }
}
