import { IsNumber, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmittedAnswerDto {
  @IsNumber()
  questionId: number;

  @IsOptional()
  @IsNumber()
  answerId?: number;

  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @IsString()
  sqlAnswer?: string;
}

export class SubmitTestDto {
  @IsNumber()
  testId: number;

  @IsNumber()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmittedAnswerDto)
  answers: SubmittedAnswerDto[];
}