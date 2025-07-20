'use server';

/**
 * @fileOverview Handles user subscriptions to daily stock signal emails.
 *
 * - subscribeToSignals - A function to subscribe a user to stock signal notifications.
 */

import { z } from 'genkit';
import { addSubscription } from '@/services/subscriptionService';
import { sendWelcomeEmail } from '@/services/emailService';
import { generateStockSignal } from './stock-signal-generator';

const SubscriptionInputSchema = z.object({
    email: z.string().email().describe('The email address of the user.'),
    ticker: z.string().describe('The stock ticker symbol to subscribe to.'),
    tradingStrategy: z.string().optional().describe('The trading strategy for the analysis.'),
});
type SubscriptionInput = z.infer<typeof SubscriptionInputSchema>;

export async function subscribeToSignals(input: SubscriptionInput): Promise<{ success: boolean; message: string }> {
    try {
        // First, generate the signal to get the indicators
        const signalResult = await generateStockSignal({
            ticker: input.ticker,
            tradingStrategy: input.tradingStrategy
        });
        const indicators = [signalResult.indicator1, signalResult.indicator2, signalResult.indicator3];

        // Add subscription to the JSON file
        await addSubscription(input);

        // Send a welcome email with the specific indicators
        await sendWelcomeEmail(input.email, input.ticker, indicators);

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
