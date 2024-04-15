import { HttpException, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import {
  ContactResponse,
  CreateContactPayload,
  UpdateContactPayload,
} from '../model/contact.model';
import { ContactValidation } from './contact.validation';
import { User } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ContactService {
  constructor(
    private validation: ValidationService,
    private prisma: PrismaService,
  ) {}

  async create(
    user: User,
    request: CreateContactPayload,
  ): Promise<ContactResponse> {
    const payload = this.validation.validate(ContactValidation.CREATE, request);
    payload.id = `contact-${uuid()}`;
    payload.user_id = user.username;

    const contact = await this.prisma.contact.create({
      data: payload,
    });

    return new ContactResponse(contact);
  }

  async get(user: User, contactId: string): Promise<ContactResponse> {
    const contact = await this.contactInDB(user.username, contactId);

    return new ContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactPayload,
  ): Promise<ContactResponse> {
    const payload = this.validation.validate(ContactValidation.UPDATE, request);

    let contact = await this.contactInDB(user.username, payload.id);

    contact = await this.prisma.contact.update({
      where: {
        id: contact.id,
        user_id: contact.user_id,
      },
      data: payload,
    });

    return new ContactResponse(contact);
  }

  async contactInDB(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        user_id: userId,
      },
    });

    if (!contact) throw new HttpException('Contact is not found', 404);

    return contact;
  }

  async remove(user: User, contactId: string): Promise<ContactResponse> {
    let contact = await this.contactInDB(user.username, contactId);

    contact = await this.prisma.contact.delete({
      where: {
        id: contact.id,
        user_id: contact.user_id,
      },
    });

    return new ContactResponse(contact);
  }
}
