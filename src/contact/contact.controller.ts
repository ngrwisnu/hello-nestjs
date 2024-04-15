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
import { ContactService } from './contact.service';
import { WebResponse } from '../model/web.model';
import {
  ContactResponse,
  CreateContactPayload,
  UpdateContactPayload,
} from '../model/contact.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Auth() user: User,
    @Body() request: CreateContactPayload,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.get(user, contactId);

    return {
      status: 'success',
      data: result,
    };
  }

  @Put('/:contactId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Body() request: UpdateContactPayload,
  ): Promise<WebResponse<ContactResponse>> {
    request.id = contactId;

    const result = await this.contactService.update(user, request);

    return {
      status: 'success',
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<ContactResponse>> {
    await this.contactService.remove(user, contactId);

    return {
      status: 'success',
    };
  }
}
