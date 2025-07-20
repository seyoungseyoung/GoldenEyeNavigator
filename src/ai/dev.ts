import { config } from 'dotenv';
config();

// Since we are no longer using genkit flows directly for model calls,
// we just need to ensure the email scheduler starts when the server runs.
import '@/ai/flows/market-insight-analyzer';
import '@/ai/flows/investment-strategy-generator';
import '@/ai/flows/stock-signal-generator';
import '@/ai/flows/subscribeToSignals';
import { scheduleDailySignalChecks } from '@/services/emailService';

// Start the daily email scheduler
scheduleDailySignalChecks();

console.log('Server started and email scheduler is running.');
