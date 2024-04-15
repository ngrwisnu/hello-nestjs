import { Module } from '@nestjs/common';
import { UserTestService } from './user-test.service';
import { ContactTestService } from './contact-test.service';
import { AddressTestService } from './address-test.service';

@Module({
  providers: [UserTestService, ContactTestService, AddressTestService],
})
export class TestModule {}
