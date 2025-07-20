'use server';

/**
 * @fileOverview Handles user subscriptions to daily stock signal emails.
 *
 * - subscribeToSignals - A function to subscribe a user to stock signal notifications.
 */

import { z } from 'zod';
import { addSubscription } from '@/services/subscriptionService';
import { sendWelcomeEmail } from '@/services/emailService';

const SubscriptionInputSchema = z.object({
    email: z.string().email().describe('The email address of the user.'),
    ticker: z.string().describe('The stock ticker symbol to subscribe to.'),
    tradingStrategy: z.string().optional().describe('The trading strategy for the analysis.'),
    indicators: z.array(z.string()).min(3).max(3).describe('The list of indicators used for the analysis.')
});
type SubscriptionInput = z.infer<typeof SubscriptionInputSchema>;

export async function subscribeToSignals(input: SubscriptionInput): Promise<{ success: boolean; message: string }> {
    try {
        // The indicators are now passed directly, so no need to call generateStockSignal again.

        // Add subscription to the JSON file
        await addSubscription({
            email: input.email,
            ticker: input.ticker,
            tradingStrategy: input.tradingStrategy
        });

        // Send a welcome email with the specific indicators
        await sendWelcomeEmail(input.email, input.ticker, input.indicators);

        return {
            success: true,
            message: `성공적으로 구독했습니다! 매일 오전 5시에 ${input.ticker}에 대한 분석 메일이 발송됩니다.`,
        };
    } catch (error: any) {
        console.error('Subscription flow failed:', error);
        return {
            success: false,
            message: error.message || '구독 처리 중 오류가 발생했습니다.',
        };
    }
}
