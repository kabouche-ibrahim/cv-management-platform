import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOfferService {
  constructor(private prisma: PrismaService) {}

  async create(createJobOfferDto: CreateJobOfferDto) {
    const { offerSkills = [], ...jobOfferData } = createJobOfferDto;
  
    return this.prisma.jobOffer.create({
      data: {
        ...jobOfferData,
        offerSkills: {
          create: await Promise.all(
            offerSkills.map(async (offerSkill) => {
              const skill = await this.prisma.skills.upsert({
                where: { skillName: offerSkill.skill.skillName },
                update: {},
                create: { skillName: offerSkill.skill.skillName }
              });
              
              return {
                skill: {
                  connect: { id: skill.id }
                }
              };
            })
          )
        }
      },
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
    try {
      // First delete all UserAnswers related to this job offer
      await this.prisma.usersAnswers.deleteMany({
        where: {
          OR: [
            { test: { jobOfferId: id } },
            { answer: { question: { test: { jobOfferId: id } } } }
          ]
        }
      });
  
      // Then proceed with the rest of the deletions as before
      await this.prisma.answers.deleteMany({
        where: {
          question: {
            test: {
              jobOfferId: id
            }
          }
        }
      });
  
      await this.prisma.questions.deleteMany({
        where: {
          test: {
            jobOfferId: id
          }
        }
      });
  
      await this.prisma.tests.deleteMany({
        where: {
          jobOfferId: id
        }
      });
  
      await this.prisma.jobApplication.deleteMany({
        where: {
          jobOfferId: id
        }
      });
  
      await this.prisma.jobOfferSkills.deleteMany({
        where: {
          jobOfferId: id
        }
      });
  
      return await this.prisma.jobOffer.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting job offer:', error);
      throw new Error(`Failed to delete job offer: ${error.message}`);
    }
  }

  async update(id: number, updateJobOfferDto: UpdateJobOfferDto) {
    const { offerSkills = [], ...jobOfferData } = updateJobOfferDto;
  
    // First delete existing skill associations
    await this.prisma.jobOfferSkills.deleteMany({
      where: { jobOfferId: id }
    });
  
    return this.prisma.jobOffer.update({
      where: { id },
      data: {
        ...jobOfferData,
        offerSkills: {
          create: await Promise.all(
            offerSkills.map(async (offerSkill) => {
              const skill = await this.prisma.skills.upsert({
                where: { skillName: offerSkill.skill.skillName },
                update: {},
                create: { skillName: offerSkill.skill.skillName }
              });
              
              return {
                skill: {
                  connect: { id: skill.id }
                }
              };
            })
          )
        }
      },
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