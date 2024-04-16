import { Address } from '@prisma/client';

export class AddressResponse {
  id: string;
  address: string;
  postal_code: number;
  contact_id: string;

  constructor(data: Address) {
    this.id = data.id;
    this.address = data.address;
    this.postal_code = data.postal_code;
    this.contact_id = data.contact_id;
  }
}

export class CreateAddressPayload {
  address?: string;
  postal_code?: number;
  contact_id: string;
}

export class GetAddressParams {
  contactId: string;
  addressId: string;
}

export class UpdateAddressPayload {
  id?: string;
  address?: string;
  postal_code?: number;
  contact_id: string;
}

export class RemoveAddressParams {
  contactId: string;
  addressId: string;
}
