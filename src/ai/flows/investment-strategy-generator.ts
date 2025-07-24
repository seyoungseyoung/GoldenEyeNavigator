
'use server';

/**
 * @fileOverview Generates a personalized investment strategy based on user input.
 *
 * - investmentStrategyGenerator - A function that generates an investment strategy.
 */
import { callHyperClovaX, Message } from '@/services/hyperclova';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { validateAndRefineStrategy } from './investment-strategy-validator';
import type { InvestmentStrategyInput, InvestmentStrategyOutput } from './investment-strategy-validator';
import { InvestmentStrategyDraftSchema } from './investment-strategy-validator';


export async function investmentStrategyGenerator(input: InvestmentStrategyInput): Promise<InvestmentStrategyOutput> {
  const jsonSchema = zodToJsonSchema(InvestmentStrategyDraftSchema, "InvestmentStrategyDraftSchema");

  const systemPrompt = `당신은 한국인을 상대하는 전문 금융 투자 자문가입니다. 사용자의 투자 프로필을 기반으로 맞춤형 투자 전략의 **초안**을 생성해주세요.

  **작업 흐름:**
  1.  **사용자 프로필 분석:** 사용자의 설문 응답, 특히 '은퇴 목표 및 우려 사항'에 서술된 내용을 깊이 있게 분석하여, 사용자의 투자 성향(예: 보수적, 공격적, 안정 추구형)과 핵심 목표(예: 자산 보전, 높은 수익, 꾸준한 현금흐름)를 정확히 파악합니다.
  2.  **포트폴리오 이름 부여:** 분석된 성향에 가장 적합한 포트폴리오 이름을 부여합니다. (예: "안정수익 포트폴리오", "균형성장 포트폴리오")
  3.  **상세 전략 생성:**
      *   **자산 배분, 추천 종목:** 분석된 성향에 맞춰 자산 배분과 추천 종목을 생성합니다. **3개에서 4개의 종목 추천을 목표**로 하지만, 상황에 따라 더 많거나 적게 추천할 수도 있습니다.
      *   **거래 전략 (매우 중요):** 아래 내용을 포함하여 **최소 3문장 이상**의 구체적이고 실용적인 거래 전략을 생성합니다.
          *   **리밸런싱:** 자산 비중을 원래대로 되돌리는 주기를 명시합니다. (예: "분기별 또는 연 1회 리밸런싱을 통해 자산 배분 비율을 재조정합니다.")
          *   **투자 원칙:** 장기적인 투자 원칙을 제시합니다. (예: "단기 시장 변동성에 흔들리지 않고, 적립식으로 꾸준히 투자하는 것을 원칙으로 합니다.")
          *   **위험 관리:** 손실을 관리하는 방안을 포함합니다. (예: "개별 종목의 손실이 -15%에 도달할 경우, 비중 축소를 검토하여 위험을 관리합니다.")
  4.  **친절한 설명 작성:** 생성된 전략 전체에 대해, 왜 이런 전략이 추천되었는지 상세하고 친절하게 설명합니다. 전문 용어를 최대한 쉽게 풀어서 시니어 투자자도 이해할 수 있도록 작성해야 합니다.

  **출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.**

  **출력 JSON 스키마:**
  \`\`\`json
  ${JSON.stringify(jsonSchema, null, 2)}
  \`\`\`

  **매우 중요한 규칙:**
  - 모든 응답 내용은 **반드시 한글로만 작성해야 합니다.** (티커 심볼 제외)
  - 'assetAllocation'의 'stocks', 'bonds', 'cash' 필드는 반드시 **숫자(number) 또는 숫자로 변환 가능한 문자열(string)**이어야 하며, 그 합은 100에 가까워야 합니다.`;

  const userInput = `다음은 투자자 정보입니다. 이 정보를 바탕으로 투자 전략 초안을 생성하고, 모든 설명을 한글로 작성해주세요.

  - 투자자 이름: ${input.name}
  - 은퇴 시기: ${input.retirementHorizon}
  - 월 필요 소득: ${input.incomeNeed}
  - 총 투자 자산: ${input.assetsSize}
  - 위험 감수 수준: ${input.riskTolerance}
  - 선호 투자 테마: ${input.themePreference}
  - 선호 투자 지역: ${input.regionPreference}
  - 선호 관리 스타일: ${input.managementStyle}
  - 세금 민감도: ${input.taxSensitivity}
  - 기타 자산: ${input.otherAssets || '제공되지 않음'}
  - 은퇴 목표 및 우려 사항: ${input.retirementGoals || '제공되지 않음'}`;

  const messages: Message[] = [{ role: 'user', content: userInput }];
  
  // 1. Generate the initial draft
  const draftResponse = await callHyperClovaX(messages, systemPrompt);
  
  const parsedDraft = InvestmentStrategyDraftSchema.safeParse(draftResponse);
  if (!parsedDraft.success) {
      console.error("HyperClova X draft response validation failed:", parsedDraft.error);
      throw new Error("AI로부터 유효하지 않은 초안 데이터 구조를 받았습니다.");
  }
  
  // 2. Send the draft to the validator/editor AI to refine and enforce rules.
  console.log("Passing draft to validator AI...");
  const finalStrategy = await validateAndRefineStrategy(parsedDraft.data);

  // 3. Normalize asset allocation on the final, validated data
  const { stocks, bonds, cash } = finalStrategy.assetAllocation;
  const total = stocks + bonds + cash;

  if (total !== 100 && total > 0) {
    console.warn(`Original allocation (${stocks}, ${bonds}, ${cash}) sum is ${total}. Normalizing...`);
    finalStrategy.assetAllocation.stocks = Math.round((stocks / total) * 100);
    finalStrategy.assetAllocation.bonds = Math.round((bonds / total) * 100);
    finalStrategy.assetAllocation.cash = 100 - finalStrategy.assetAllocation.stocks - finalStrategy.assetAllocation.bonds;
    console.log(`Normalized allocation: ${finalStrategy.assetAllocation.stocks}, ${finalStrategy.assetAllocation.bonds}, ${finalStrategy.assetAllocation.cash}`);
  }
  
  return finalStrategy;
}
