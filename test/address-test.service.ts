import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';

@Injectable()
export class AddressTestService {
  constructor(private prisma: PrismaService) {}

  async createAddress() {
    await this.prisma.address.create({
      data: {
        id: 'address-1',
        address: 'address content',
        postal_code: 11111,
        contact_id: 'contact-1',
      },
    });
  }

  async getAddress() {
    return await this.prisma.address.findFirst({
      where: {
        id: 'address-1',
        contact_id: 'contact-1',
      },
    });
  }

  async cleanTable() {
    await this.prisma.address.deleteMany();
  }
}
