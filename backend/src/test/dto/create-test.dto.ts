import { IsString, IsArray, ValidateNested, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionOptionDto {
  @IsString()
  value: string;

  @IsString()
  isCorrect: string; // "true" or "false"
}

class TestQuestionDto {
  @IsString()
  type: string;

  @IsString()
  question: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @IsOptional()
  @IsString()
  expectedAnswer?: string;

  @IsOptional() 
  @IsBoolean()
  correctAnswer?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  defaultGrade?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];
}

class AnswerDto {
  @IsString()
  answerValue: string;

  @IsBoolean()
  answerIsCorrect: boolean;
}

export class CreateTestDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestQuestionDto)
  questions: TestQuestionDto[];

  @IsNumber()
  @IsOptional()
  jobOfferId?: number;

  @IsString()
  testDescription: string;
}