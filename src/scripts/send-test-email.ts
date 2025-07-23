
import 'dotenv/config';
import { getHistoricalData } from '@/services/stockService';
import { generateStockSignal } from '@/ai/flows/stock-signal-generator';
import { sendSignalEmail } from '@/services/emailService';

async function runTest() {
  const args = process.argv.slice(2);
  const [email, ticker] = args;

  if (!email || !ticker) {
    console.error('오류: 이메일 주소와 티커를 모두 입력해야 합니다.');
    console.log('사용법: pnpm run test:email <이메일> <티커>');
    console.log('예시: pnpm run test:email jake@example.com AAPL');
    process.exit(1);
  }

  console.log(`'${email}' 주소로 '${ticker}'에 대한 테스트 이메일 발송을 시작합니다...`);

  try {
    // 1. 주가 데이터 가져오기
    console.log(`[1/3] ${ticker}의 과거 주가 데이터를 가져오는 중...`);
    const historicalData = await getHistoricalData(ticker);
    console.log('✅ 데이터 가져오기 완료.');

    // 2. AI로 신호 생성하기
    console.log(`[2/3] AI를 통해 최신 매매 신호를 생성하는 중...`);
    // 테스트 목적이므로 tradingStrategy는 빈 값으로 전달합니다.
    const signalResult = await generateStockSignal({
      ticker,
      historicalData,
      tradingStrategy: '장기 투자 관점', // 테스트용 기본 전략
    });
    console.log(`✅ AI 신호 생성 완료: "${signalResult.finalSignal}"`);

    // 3. 이메일 발송하기
    console.log(`[3/3] '${email}'로 분석 이메일을 발송하는 중...`);
    await sendSignalEmail(email, ticker, signalResult);
    console.log('✅ 이메일 발송 완료!');

    console.log('\n🎉 테스트가 성공적으로 완료되었습니다.');

  } catch (error) {
    console.error('\n테스트 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

runTest();
