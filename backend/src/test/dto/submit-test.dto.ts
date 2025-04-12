export class SubmitTestDto {
  testId: number;
  userId: number;
  answers: Array<{
    questionId: number;
    answerId?: number;
    answerText?: string;
    sqlAnswer?: string;
  }>;
  score: number;
  maxScore: number;
  
}