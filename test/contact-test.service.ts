import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';

@Injectable()
export class ContactTestService {
  constructor(private prisma: PrismaService) {}

  async createContact() {
    await this.prisma.contact.create({
      data: {
        id: 'contact-1',
        first_name: 'stewie',
        last_name: 'griffin',
        email: 'stewie@email.com',
        phone: '12124444',
        user_id: 'griffin',
      },
    });
  }

  async getContact(id) {
    return await this.prisma.contact.findFirst({
      where: {
        id,
      },
    });
  }

  async cleanTable() {
    await this.prisma.contact.deleteMany();
  }
}
