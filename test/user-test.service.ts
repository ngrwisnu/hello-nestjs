import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';

@Injectable()
export class UserTestService {
  constructor(private prisma: PrismaService) {}

  async createUser(token?: string) {
    await this.prisma.user.create({
      data: {
        username: 'griffin',
        name: 'griffin',
        password: 'secret',
        token,
      },
    });
  }

  async getUser() {
    return await this.prisma.user.findUnique({
      where: {
        username: 'griffin',
      },
    });
  }

  async cleanTable() {
    await this.prisma.user.deleteMany();
  }
}
