import { Module } from '@nestjs/common';
import { JobOfferController } from './job-offer.controller';
import { JobOfferService } from './job-offer.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [JobOfferController],
  providers: [JobOfferService, PrismaService]
})
export class JobOfferModule {}
