import { Contact } from '@prisma/client';

export class ContactResponse {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  user_id?: string;

  constructor(readonly contact: Partial<Contact>) {
    this.id = contact.id;
    this.first_name = contact.first_name;
    this.last_name = contact.last_name;
    this.email = contact.email;
    this.phone = contact.phone;
    this.user_id = contact.user_id;
  }
}

export class CreateContactPayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export class UpdateContactPayload {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}
