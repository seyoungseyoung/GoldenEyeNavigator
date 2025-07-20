import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 md:py-20">
      <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary tracking-tighter">
        Golden Life Navigator
      </h1>
      <p className="mt-4 max-w-2xl text-lg md:text-xl text-foreground/80">
        맞춤형 질문으로 시작하여, 당신만의 투자 전략과 실행 지침을 받아보세요.
      </p>
      <div className="mt-8">
        <Button asChild size="lg" className="font-bold text-lg px-8 py-6">
          <Link href="/survey">
            나만의 맞춤 전략 추천 받기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="font-headline text-xl text-primary mb-2">개인화된 전략</h3>
            <p className="text-muted-foreground">당신의 투자 성향, 목표, 위험 감수 수준에 꼭 맞는 맞춤형 투자 포트폴리오를 받아보세요.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="font-headline text-xl text-primary mb-2">AI 기반 분석</h3>
            <p className="text-muted-foreground">최신 AI 기술을 활용하여 시장 동향을 분석하고, 최적의 매매 타이밍을 포착하세요.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="font-headline text-xl text-primary mb-2">지속적인 관리</h3>
            <p className="text-muted-foreground">시장 변화에 따른 매수/매도 신호를 이메일로 받아보고, 한발 앞서 대응하세요.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
