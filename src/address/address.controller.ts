import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { WebResponse } from '../model/web.model';
import {
  AddressResponse,
  CreateAddressPayload,
  GetAddressParams,
  RemoveAddressParams,
  UpdateAddressPayload,
} from '../model/address.model';
import { AddressService } from './address.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Body() request: CreateAddressPayload,
  ): Promise<WebResponse<AddressResponse>> {
    request.contact_id = contactId;
    request.postal_code = +request.postal_code;

    const result = await this.addressService.create(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/:addressId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId') addressId: string,
  ): Promise<WebResponse<AddressResponse>> {
    const request: GetAddressParams = {
      contactId,
      addressId,
    };

    const result = await this.addressService.get(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Put('/:addressId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId') addressId: string,
    @Body() request: UpdateAddressPayload,
  ): Promise<WebResponse<AddressResponse>> {
    request.id = addressId;
    request.contact_id = contactId;

    const result = await this.addressService.update(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Delete('/:addressId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('addressId') addressId: string,
  ): Promise<WebResponse<AddressResponse>> {
    const request: RemoveAddressParams = {
      contactId,
      addressId,
    };

    await this.addressService.remove(user, request);

    return {
      status: 'success',
    };
  }

  @Get()
  @HttpCode(200)
  async getAll(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<AddressResponse[]>> {
    const result = await this.addressService.getAll(user, contactId);

    return {
      status: 'success',
      data: result,
    };
  }
}
