import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const TimingAnalysis = dynamic(
    () => import('@/components/timing/TimingAnalysis').then(mod => mod.TimingAnalysis),
    { 
        ssr: false,
        loading: () => (
            <div className="space-y-8 max-w-4xl mx-auto">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }
);

export default function TimingPage() {
    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                    AI 주식 매매 타이밍 분석
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    종목과 전략에 맞는 기술 지표를 추천받고 매매 신호를 확인하세요.
                </p>
            </div>
            <TimingAnalysis />
        </div>
    );
}
