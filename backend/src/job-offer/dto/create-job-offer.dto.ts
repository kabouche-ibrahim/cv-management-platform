import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  jobName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  educationNeeded: string;
}