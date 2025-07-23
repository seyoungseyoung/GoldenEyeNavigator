
import nodemailer from 'nodemailer';
import { getAllSubscriptions } from './subscriptionService';
import { generateStockSignal, StockSignalOutput } from '@/ai/flows/stock-signal-generator';
import { getHistoricalData } from './stockService';

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
 * @param result The full analysis result from the AI.
 */
export async function sendSignalEmail(
    email: string,
    ticker: string,
    result: StockSignalOutput
): Promise<void> {

    const signal = result.finalSignal;
    const indicators = result.recommendedIndicators;
    const rationale = result.rationale;

    const mailOptions = {
        from: `"GoldenLife Navigator" <${process.env.SMTP_USERNAME}>`,
        to: email,
        subject: `🔔 오늘의 ${ticker} 매매 신호: ${signal}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #B8860B; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">${ticker} AI 매매 신호 분석</h2>
                <p style="font-size: 18px;">
                    오늘의 종합 신호는 
                    <span style="font-weight: bold; font-size: 20px; color: ${signal.includes('매수') ? '#2563eb' : '#dc2626'};">
                        "${signal}"
                    </span>
                    입니다.
                </p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <h3 style="margin-top: 0; color: #555;">AI 분석 코멘트</h3>
                    <p style="font-style: italic; color: #666;">"${rationale}"</p>
                </div>
                <div style="margin-top: 20px;">
                    <h4 style="color: #555;">분석에 사용된 주요 지표:</h4>
                    <ul>
                        ${indicators.map(indicator => `<li><b>${indicator.fullName}</b> (${indicator.name})</li>`).join('')}
                    </ul>
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 30px; text-align: center;">
                    본 정보는 투자 참고용이며, 최종 투자 결정은 본인의 책임하에 이루어져야 합니다.<br/>
                    <a href="https://studio--portfolio-revamp-x1zou.us-central1.hosted.app/timing" style="color: #B8860B;">웹에서 직접 분석하기</a>
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Signal email for ${ticker} sent to ${email}`);
}


/**
 * Fetches signals for all subscriptions and sends emails.
 */
export async function checkAndSendSignals() {
    console.log('Running daily signal check...');
    const subscriptions = await getAllSubscriptions();
    // To avoid redundant API calls for the same ticker
    const uniqueTickers = [...new Set(subscriptions.map(sub => sub.ticker))];

    for (const ticker of uniqueTickers) {
        try {
            console.log(`Processing ticker: ${ticker}`);
            const historicalData = await getHistoricalData(ticker);
            const subForTicker = subscriptions.find(s => s.ticker === ticker)!;

            const result = await generateStockSignal({
                ticker: ticker,
                tradingStrategy: subForTicker.tradingStrategy,
                historicalData
            });

            // '보류' 신호가 아닐 경우에만 이메일 발송
            if (result.finalSignal !== '보류') {
                const subsToNotify = subscriptions.filter(s => s.ticker === ticker);
                for(const sub of subsToNotify) {
                    await sendSignalEmail(sub.email, ticker, result);
                }
            } else {
                console.log(`Signal for ${ticker} is '보류'. Skipping email.`);
            }
        } catch (error) {
            console.error(`Failed to process signal for ${ticker}:`, error);
        }
    }
    console.log('Daily signal check finished.');
}
