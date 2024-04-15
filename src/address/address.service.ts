import { HttpException, Injectable } from '@nestjs/common';
import {
  AddressResponse,
  CreateAddressPayload,
  GetAddressParams,
  RemoveAddressParams,
  UpdateAddressPayload,
} from '../model/address.model';
import { Address, User } from '@prisma/client';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { ContactService } from '../contact/contact.service';
import { AddressValidation } from './address.validation';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AddressService {
  constructor(
    private validation: ValidationService,
    private prisma: PrismaService,
    private contactService: ContactService,
  ) {}

  async create(
    user: User,
    request: CreateAddressPayload,
  ): Promise<AddressResponse> {
    const payload = this.validation.validate(AddressValidation.CREATE, request);
    payload.id = `address-${uuid()}`;

    await this.contactService.contactInDB(user.username, payload.contact_id);

    const address = await this.prisma.address.create({
      data: payload,
    });

    return new AddressResponse(address);
  }

  async get(user: User, request: GetAddressParams): Promise<AddressResponse> {
    const payload: GetAddressParams = this.validation.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.contactInDB(user.username, payload.contactId);

    const address = await this.addressInDB(
      payload.contactId,
      payload.addressId,
    );

    return new AddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressPayload,
  ): Promise<AddressResponse> {
    const payload: UpdateAddressPayload = this.validation.validate(
      AddressValidation.UPDATE,
      request,
    );

    await this.contactService.contactInDB(user.username, request.contact_id);
    await this.addressInDB(payload.contact_id, payload.id);

    const updated = await this.prisma.address.update({
      where: {
        id: payload.id,
        contact_id: payload.contact_id,
      },
      data: payload,
    });

    return new AddressResponse(updated);
  }

  async remove(
    user: User,
    request: RemoveAddressParams,
  ): Promise<AddressResponse> {
    const payload: RemoveAddressParams = this.validation.validate(
      AddressValidation.REMOVE,
      request,
    );

    await this.contactService.contactInDB(user.username, payload.contactId);
    await this.addressInDB(payload.contactId, payload.addressId);

    const address = await this.prisma.address.delete({
      where: {
        id: payload.addressId,
        contact_id: payload.contactId,
      },
    });

    return new AddressResponse(address);
  }

  async getAll(user: User, contactId: string): Promise<AddressResponse[]> {
    await this.contactService.contactInDB(user.username, contactId);

    const addresses = await this.prisma.address.findMany({
      where: {
        contact_id: contactId,
      },
    });

    return addresses.map((address) => new AddressResponse(address));
  }

  async addressInDB(contactId: string, addressId: string): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });

    if (!address) throw new HttpException('Address is not found', 404);

    return address;
  }
}
