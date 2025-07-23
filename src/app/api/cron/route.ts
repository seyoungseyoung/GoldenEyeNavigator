
import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendSignals } from '@/services/emailService';

export async function GET(request: NextRequest) {
  // Simple security check using a secret key
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', {
      status: 401,
    });
  }

  try {
    console.log("CRON job started by API request.");
    await checkAndSendSignals();
    console.log("CRON job finished successfully.");
    return NextResponse.json({ success: true, message: 'Signal checks completed.' });
  } catch (error) {
    console.error('CRON job failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
