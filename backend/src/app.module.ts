import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { JobOfferModule } from './job-offer/job-offer.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, JobOfferModule, TestModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}