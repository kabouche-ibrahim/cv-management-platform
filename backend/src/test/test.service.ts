import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { createHash } from 'crypto';

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async create(createTestDto: CreateTestDto) {
    const { title, questions, jobOfferId } = createTestDto;

    return this.prisma.tests.create({
      data: {
        testTitle: title,
        testDescription: createTestDto.testDescription || '',
        jobOffer: {
          connect: { id: jobOfferId }
        },
        questions: {
          create: questions.map(q => ({
            questionText: q.question,
            questionType: q.type,
            defaultGrade: q.defaultGrade || 1,
            answers: {
              create: q.type === 'mcq'
                ? q.options.map(opt => ({
                    answerValue: opt.value,
                    answerIsCorrect: opt.isCorrect === 'true'
                  }))
                : q.type === 'text'
                ? [{
                    answerValue: q.expectedAnswer,
                    answerIsCorrect: true
                  }]
                : q.type === 'boolean'
                ? [
                    {
                      answerValue: 'true',
                      answerIsCorrect: q.correctAnswer
                    },
                    {
                      answerValue: 'false',
                      answerIsCorrect: !q.correctAnswer
                    }
                  ]
                : q.type === 'coding'
                ? [{
                    answerValue: q.answers[0].answerValue,
                    answerIsCorrect: true
                  }]
                : []
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.tests.findMany({
      include: {
        jobOffer: true,
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.tests.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async update(id: number, updateTestDto: UpdateTestDto) {
    const { title, questions, jobOfferId, testDescription } = updateTestDto;

    await this.prisma.questions.deleteMany({
      where: { testId: id },
    });

    return this.prisma.tests.update({
      where: { id },
      data: {
        testTitle: title,
        testDescription: testDescription || '',
        jobOffer: {
          connect: { id: jobOfferId }
        },
        questions: {
          create: questions.map(q => ({
            questionText: q.question,
            questionType: q.type,
            defaultGrade: q.defaultGrade || 1,
            answers: {
              create: q.type === 'mcq'
                ? q.options.map(opt => ({
                    answerValue: opt.value,
                    answerIsCorrect: opt.isCorrect === 'true'
                  }))
                : q.type === 'text'
                ? [{
                    answerValue: q.expectedAnswer,
                    answerIsCorrect: true
                  }]
                : q.type === 'boolean'
                ? [
                    {
                      answerValue: 'true',
                      answerIsCorrect: q.correctAnswer
                    },
                    {
                      answerValue: 'false',
                      answerIsCorrect: !q.correctAnswer
                    }
                  ]
                : q.type === 'coding'
                ? [{
                    answerValue: q.answers[0].answerValue,
                    answerIsCorrect: true
                  }]
                : []
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.tests.delete({
      where: { id },
    });
  }

  async deleteTest(id: number) {
    try {
      const deletedTest = await this.prisma.tests.delete({
        where: { id },
        include: {
          questions: {
            include: {
              answers: true
            }
          }
        }
      });
      return deletedTest;
    } catch (error) {
      throw new Error(`Failed to delete test: ${error.message}`);
    }
  }

  async submitTest(submitTestDto: SubmitTestDto) {
    const { testId, userId, answers } = submitTestDto;

    return this.prisma.$transaction(async (prisma) => {
      const submittedAnswers = await Promise.all(
        answers.map(async (answer) => {
          if (answer.answerId) {
            // For MCQ and Boolean questions
            return prisma.usersAnswers.create({
              data: {
                userId,
                answerId: answer.answerId,
                userQuestionId: answer.questionId,
                testId
              }
            });
          } else {
            // For Text and SQL questions
            // First create a new answer
            const newAnswer = await prisma.answers.create({
              data: {
                questionId: answer.questionId,
                answerValue: answer.answerText || answer.sqlAnswer || '',
                answerIsCorrect: false
              }
            });

            // Then create the user answer record with the new answer ID
            return prisma.usersAnswers.create({
              data: {
                userId,
                answerId: newAnswer.id,
                userQuestionId: answer.questionId,
                testId
              }
            });
          }
        })
      );

      return submittedAnswers;
    });
  }

  async getTestByLink(testLink: string) {
    const [testId, jobOfferId] = testLink.split('-');
    
    const test = await this.prisma.tests.findFirst({
      where: { 
        id: parseInt(testId),
        jobOfferId: parseInt(jobOfferId)
      },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            answers: {
              select: {
                id: true,
                answerValue: true
              }
            }
          }
        }
      }
    });
  
    if (!test) {
      throw new NotFoundException('Test not found');
    }
  
    return test;
  }
  async findByCvId(cvId: string) {
    const test = await this.prisma.tests.findFirst({
      where: {
    UsersAnswers: {
      some: {
        user: { cvId: cvId }
      }
    }
  },
        include: {
            questions: {
                include: {
                    answers: true
                }
            }
        }
    });

    if (!test) {
        throw new NotFoundException("Could not find test for this CV");
    }

    return test;
}

  
  
}