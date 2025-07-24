/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the investment strategy generation process. It serves as the single 
 * source of truth for the data structures used by both the generator and validator AIs,
 * as well as the client-side components.
 */

import { z } from 'zod';

// Schema for the user's input from the survey form.
export const InvestmentStrategyInputSchema = z.object({
  retirementHorizon: z.enum([
    '이미 은퇴함',
    '5년 미만',
    '5-10년',
    '10-20년',
    '20년 이상',
  ]),
  incomeNeed: z.enum([
    '월 소득 필요 없음',
    '월 0원 - 100만 원',
    '월 101만 원-300만 원',
    '월 301만 원-500만 원',
    '월 500만 원 이상',
  ]),
  assetsSize: z.enum([
    '5천만 원 미만',
    '5천만 원-2억 5천만 원 미만',
    '2억 5천만 원-10억 원 미만',
    '10억 원-50억 원 미만',
    '50억 원 이상',
  ]),
  taxSensitivity: z.enum([
    '매우 민감한',
    '다소 민감함',
    '민감하지 않음',
  ]),
  themePreference: z.enum([
    '배당',
    '성장',
    'ESG(환경, 사회, 지배구조)',
    '국내 중심',
    '해외 중심',
    '균형/분산',
  ]),
  regionPreference: z.enum([
    '국내 주식 중심',
    '미국 주식 중심',
    '기타 선진국 주식 중심(유럽, 일본 등)',
    '신흥국 주식 중심(중국, 인도 등)',
    '글로벌 분산 투자',
  ]),
  managementStyle: z.enum([
    '적극적(직접 관리 선호)',
    '소극적/자동화(설정 후 신경 쓰지 않는 방식 선호)',
  ]),
  riskTolerance: z.enum([
    '보수적(자본 보존 우선)',
    '다소 보수적',
    '중립적(위험과 수익 균형)',
    '다소 공격적',
    '공격적(높은 수익 추구, 높은 위험 감수)',
  ]),
  retirementGoals: z.string().optional(),
  otherAssets: z.string().optional(),
  name: z.string(),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

// The output schema for the GENERATOR AI. It's more flexible to allow for AI creativity.
// The validator AI will then refine this draft into the final output format.
export const InvestmentStrategyDraftSchema = z.object({
  portfolioName: z.string(),
  assetAllocation: z.object({
    stocks: z.coerce.number(),
    bonds: z.coerce.number(),
    cash: z.coerce.number(),
  }),
  etfStockRecommendations: z.array(
    z.object({
      ticker: z.string(),
      rationale: z.string(),
    })
  ), // No min/max constraints here for the draft
  tradingStrategy: z.string(),
  strategyExplanation: z.string(),
});

// Final, validated output schema. This is what the user gets and what the validator AI enforces.
export const InvestmentStrategyOutputSchema = z.object({
  portfolioName: z.string(),
  assetAllocation: z.object({
    stocks: z.coerce.number(),
    bonds: z.coerce.number(),
    cash: z.coerce.number(),
  }),
  etfStockRecommendations: z.array(
    z.object({
      ticker: z.string(),
      rationale: z.string(),
    })
  ).min(3).max(4), // Strict 3-4 item rule for the final output
  tradingStrategy: z.string(),
  strategyExplanation: z.string(),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;
