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

  /*async update(id: number, updateTestDto: UpdateTestDto) {
    const { title, questions, jobOfferId, testDescription } = updateTestDto;

    try {
      // Use a transaction to ensure data consistency
      return await this.prisma.$transaction(async (prisma) => {
        // First check if the test exists
        const existingTest = await prisma.tests.findUnique({
          where: { id },
          include: {
            questions: {
              include: {
                answers: true
              }
            }
          }
        });

        if (!existingTest) {
          throw new NotFoundException(`Test with ID ${id} not found`);
        }

        // Check if there are any test submissions for this test
        const submissions = await prisma.testSubmission.findMany({
          where: { testId: id },
          take: 1 // We only need to know if any exist
        });

        // If there are submissions, we should not allow deleting questions
        // as it would break historical data. Instead, we should just update the test metadata.
        if (submissions.length > 0) {
          return await prisma.tests.update({
            where: { id },
            data: {
              testTitle: title,
              testDescription: testDescription || '',
              jobOffer: {
                connect: { id: jobOfferId }
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

        // If no submissions exist, we can safely delete and recreate the questions
        // First, delete all existing answers for the test's questions
        await prisma.answers.deleteMany({
          where: {
            question: {
              testId: id
            }
          }
        });

        // Then delete all existing questions
        await prisma.questions.deleteMany({
          where: { testId: id }
        });

        // Now update the test with new questions
        return await prisma.tests.update({
          where: { id },
          data: {
            testTitle: title,
            testDescription: testDescription || '',
            jobOffer: {
              connect: { id: jobOfferId }
            },
            questions: {
              create: questions.map(q => ({
                questionText: q.question || q.description || '',
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
      });
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }*/

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
    const { testId, userId, answers, score, maxScore } = submitTestDto;
    
    if (!testId || !userId || !answers || answers.length === 0) {
      throw new Error('Missing required fields');
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Create test submission
        const submission = await prisma.testSubmission.create({
          data: {
            testId,
            userId,
            score: parseFloat(score.toString()),
            maxScore: parseFloat(maxScore.toString()),
            submittedAt: new Date()
          }
        });

        // Handle all answer types
        const submittedAnswers = await Promise.all(
          answers.map(async (answer) => {
            const answerData = {
              userId,
              testId,
              userQuestionId: answer.questionId,
              submissionId: submission.id
            };

            // Handle text answers
            if (answer.answerText !== undefined) {
              const newAnswer = await prisma.answers.create({
                data: {
                  questionId: answer.questionId,
                  answerValue: answer.answerText,
                  answerIsCorrect: false // Text answers correctness is determined by semantic similarity
                }
              });
              return prisma.usersAnswers.create({
                data: {
                  ...answerData,
                  answerId: newAnswer.id
                }
              });
            }
            
            // Handle MCQ/Boolean answers
            if (answer.answerId !== undefined) {
              return prisma.usersAnswers.create({
                data: {
                  ...answerData,
                  answerId: answer.answerId
                }
              });
            }

            // Handle SQL/coding answers
            if (answer.sqlAnswer !== undefined) {
              const newAnswer = await prisma.answers.create({
                data: {
                  questionId: answer.questionId,
                  answerValue: answer.sqlAnswer,
                  answerIsCorrect: false // SQL answers correctness is determined by exact match
                }
              });
              return prisma.usersAnswers.create({
                data: {
                  ...answerData,
                  answerId: newAnswer.id
                }
              });
            }
          })
        );

        // Return both submission and answers
        return {
          submission,
          answers: submittedAnswers.filter(Boolean) // Remove any undefined answers
        };
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      throw new Error(`Failed to submit test: ${error.message}`);
    }
  }


  async getTestResults(testId: number) {
    if (!testId) {
      throw new Error('Test ID is required');
    }
  
    return this.prisma.testSubmission.findMany({
      where: { testId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            cvUrl: true,
          },
        },
        // Add this to include the user answers
        userAnswers: {
          include: {
            answer: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async getTestByLink(testLink: string) {
    const [testId, jobOfferId] = testLink.split('-');
    
    console.log(`Fetching test ${testId} for job offer ${jobOfferId}`);
    
    const test = await this.prisma.tests.findFirst({
      where: { 
        id: parseInt(testId),
        jobOfferId: parseInt(jobOfferId)
      },
      include: {
        questions: {
          include: {
            answers: {
              select: {
                id: true,
                answerValue: true,
                answerIsCorrect: true
              }
            }
          }
        }
      }
    });
  
    if (!test) {
      throw new NotFoundException('Test not found');
    }
  
    // Debug log the answers
    test.questions.forEach(q => {
      console.log(`Question ${q.id} (${q.questionType}) answers:`);
      q.answers.forEach(a => {
        console.log(`- ${a.answerValue} (correct: ${a.answerIsCorrect})`);
      });
    });
  
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