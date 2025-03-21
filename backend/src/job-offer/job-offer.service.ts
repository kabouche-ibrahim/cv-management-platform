import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOfferService {
  constructor(private prisma: PrismaService) {}

  async create(createJobOfferDto: CreateJobOfferDto) {
    return this.prisma.jobOffer.create({
      data: createJobOfferDto,
      include: {
        offerSkills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.jobOffer.findMany({
      include: {
        offerSkills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    return this.prisma.jobOffer.delete({
      where: { id }
    });
  }

  async update(id: number, updateJobOfferDto: UpdateJobOfferDto) {
    return this.prisma.jobOffer.update({
      where: { id },
      data: updateJobOfferDto,
      include: {
        offerSkills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.jobOffer.findUnique({
      where: { id },
      include: {
        offerSkills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  async findCvsByJobOffer(jobOfferId: number) {
    return this.prisma.jobApplication.findMany({
      where: {
        jobOfferId: jobOfferId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            cvUrl: true,
            cvId: true
          }
        },
        jobOffer: true
      }
    });
  }
}