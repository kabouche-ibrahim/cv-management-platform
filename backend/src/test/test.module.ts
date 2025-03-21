import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TestController],
  providers: [TestService, PrismaService],
  exports: [TestService]
})
export class TestModule {}