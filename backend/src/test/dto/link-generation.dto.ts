import { IsString } from 'class-validator';

export class GenerateLinkResponseDto {
  @IsString()
  testLink: string;
}