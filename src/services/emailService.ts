import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { getAllSubscriptions } from './subscriptionService';
import { generateStockSignal } from '@/ai/flows/stock-signal-generator';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Sends a welcome email to a new subscriber.
 * @param email The recipient's email address.
 * @param ticker The stock ticker they subscribed to.
 * @param indicators The specific indicators that will be used for analysis.
 */
export async function sendWelcomeEmail(email: string, ticker: string, indicators: string[]): Promise<void> {

    const mailOptions = {
        from: `"GoldenLife Navigator" <${process.env.SMTP_USERNAME}>`,
        to: email,
        subject: `📈 ${ticker} 주식 신호 알림 구독 완료`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>안녕하세요! GoldenLife Navigator입니다.</h2>
                <p><b>${ticker}</b>에 대한 매일의 매매 신호 분석 알림을 성공적으로 구독하셨습니다.</p>
                <p>앞으로 다음 지표들을 사용하여 분석된 결과를 보내드리겠습니다:</p>
                <ul>
                    ${indicators.map(indicator => `<li><b>${indicator}</b></li>`).join('')}
                </ul>
                <p>매일 한국 시간(KST) 오전 5시에 분석 결과가 이메일로 발송될 예정입니다. (신호가 '보류'일 경우 제외)</p>
                <p>감사합니다.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
}

/**
 * Sends an email with the daily stock signal.
 * @param email The recipient's email address.
 * @param ticker The stock ticker.
 * @param signal The generated trading signal.
 * @param indicators The indicators used for the signal.
 */
export async function sendSignalEmail(
    email: string,
    ticker: string,
    signal: string,
    indicators: string[]
): Promise<void> {
    const mailOptions = {
        from: `"GoldenLife Navigator" <${process.env.SMTP_USERNAME}>`,
        to: email,
        subject: `🔔 오늘의 ${ticker} 매매 신호: ${signal}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>${ticker} 오늘의 AI 매매 신호 분석</h2>
                <p><b>종합 신호: <span style="font-weight: bold; color: ${signal.includes('매수') ? 'green' : 'red'};">${signal}</span></b></p>
                <p>분석에 사용된 주요 지표:</p>
                <ul>
                    ${indicators.map(indicator => `<li>${indicator}</li>`).join('')}
                </ul>
                <p style="font-size: 12px; color: #777;">본 정보는 투자 참고용이며, 최종 투자 결정은 본인의 책임하에 이루어져야 합니다.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Signal email for ${ticker} sent to ${email}`);
}


/**
 * Fetches signals for all subscriptions and sends emails.
 */
async function checkAndSendSignals() {
    console.log('Running daily signal check...');
    const subscriptions = await getAllSubscriptions();

    for (const sub of subscriptions) {
        try {
            const result = await generateStockSignal({
                ticker: sub.ticker,
                tradingStrategy: sub.tradingStrategy,
            });

            // '보류' 신호가 아닐 경우에만 이메일 발송
            if (result.signal !== '보류') {
                await sendSignalEmail(
                    sub.email,
                    sub.ticker,
                    result.signal,
                    [result.indicator1, result.indicator2, result.indicator3]
                );
            }
        } catch (error) {
            console.error(`Failed to process signal for ${sub.ticker} for ${sub.email}:`, error);
        }
    }
    console.log('Daily signal check finished.');
}


/**
 * Schedules the daily job to check signals and send emails.
 * Runs every day at 5:00 AM KST.
 */
export function scheduleDailySignalChecks() {
    // Cron format: 'Minute Hour Day-of-Month Month Day-of-Week'
    // Set to run at 5:00 AM in Seoul's timezone.
    cron.schedule('0 5 * * *', () => {
        console.log('Scheduler triggered for KST 05:00.');
        checkAndSendSignals();
    }, {
        scheduled: true,
        timezone: "Asia/Seoul"
    });

    console.log('Email scheduler started. Daily checks at 05:00 KST.');
}
