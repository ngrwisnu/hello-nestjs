import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUser,
  RegisterUser,
  UpdateUser,
  UserResponse,
} from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async register(
    @Body() request: RegisterUser,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() request: LoginUser): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/current')
  @HttpCode(200)
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);

    return {
      status: 'success',
      data: result,
    };
  }

  @Patch('/current')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateUser,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.update(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Delete('/current')
  @HttpCode(200)
  async logout(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    await this.userService.logout(user);

    return {
      status: 'success',
    };
  }
}
