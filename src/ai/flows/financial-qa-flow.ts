
'use server';

/**
 * @fileOverview A financial Q&A AI agent.
 *
 * - financialQnA - A function that answers user's financial questions.
 * - FinancialQnAInput - The input type for the financialQnA function.
 * - FinancialQnAOutput - The return type for the financialQnA function.
 */

import { z } from 'zod';
import { callHyperClovaX, Message } from '@/services/hyperclova';
import { zodToJsonSchema } from 'zod-to-json-schema';

const FinancialQnAInputSchema = z.object({
  question: z.string().describe('The user\'s financial question.'),
});
export type FinancialQnAInput = z.infer<typeof FinancialQnAInputSchema>;

const FinancialQnAOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the financial question in Korean.'),
});
export type FinancialQnAOutput = z.infer<typeof FinancialQnAOutputSchema>;

export async function financialQnA(input: FinancialQnAInput): Promise<FinancialQnAOutput> {
  // 1. Validate the input from the client
  const parsedInput = FinancialQnAInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(`Invalid input provided to financialQnA flow: ${parsedInput.error.message}`);
  }
  
  const jsonSchema = zodToJsonSchema(FinancialQnAOutputSchema, "FinancialQnAOutputSchema");

  const systemPrompt = `당신은 사용자의 금융 관련 질문에 답변하는 친절하고 유능한 AI 금융 어드바이저입니다.
  
  당신은 방대한 금융 지식을 학습했으며, 일반적인 투자 상식, 은퇴 설계 원칙, 시장 용어, 경제 현상 등 광범위한 주제에 대해 답변할 수 있습니다.
  
  **규칙:**
  - 특정 종목에 대한 매수/매도 추천이나 직접적인 투자 자문을 해서는 안 됩니다.
  - 대신, 일반적인 원칙, 개념 설명, 고려해야 할 사항들을 중심으로 답변해야 합니다.
  - 사용자가 이해하기 쉽게, 전문 용어를 풀어서 친절한 어조로 설명해주세요.
  - 모든 답변은 반드시 한글로 작성해야 합니다.

  **출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.**

  **출력 JSON 스키마:**
  \`\`\`json
  ${JSON.stringify(jsonSchema, null, 2)}
  \`\`\`
  `;
  
  const userInput = `다음 금융 관련 질문에 답변해주세요: "${input.question}"`;
  const messages: Message[] = [{ role: 'user', content: userInput }];

  try {
    const response = await callHyperClovaX(messages, systemPrompt);
    
    // 2. Validate the response from the AI
    const parsedResponse = FinancialQnAOutputSchema.safeParse(response);

    if (!parsedResponse.success) {
      const errorDetails = JSON.stringify(parsedResponse.error.flatten(), null, 2);
      console.error("HyperClova X Q&A response validation failed:", errorDetails);
      throw new Error(`AI로부터 유효하지 않은 데이터 구조를 받았습니다. 오류: ${errorDetails}`);
    }

    return parsedResponse.data;

  } catch (error) {
    console.error("Error in financialQnA flow:", error);
    // Re-throw the error to be handled by the client
    throw error;
  }
}
