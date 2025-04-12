export class CreateJobOfferDto {
  jobName: string;
  description: string;
  educationNeeded: string;
  offerSkills: {
    skill: {
      skillName: string;
    };
  }[];
}