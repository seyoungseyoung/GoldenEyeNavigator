'use client';

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

export function TimingLoader() {
    return <TimingAnalysis />;
}
