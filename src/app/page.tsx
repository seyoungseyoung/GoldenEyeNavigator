
// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, BarChart3, Users, Zap, Target, MessageSquareHeart, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <main className="max-w-5xl w-full">
        <section className="mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 animate-fade-in-down">
            황금빛 노후, AI와 함께 설계하세요
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto animate-fade-in-up">
            복잡한 은퇴 준비, 이제 AI 금융 전문가에게 맡기세요. 당신만을 위한 맞춤형 투자 전략을 쉽고 빠르게 받아볼 수 있습니다.
          </p>
          <Button
            size="lg"
            className="text-lg py-7 px-10 bg-accent text-accent-foreground hover:bg-accent/90 transition-transform transform hover:scale-105 animate-bounce-slow"
            onClick={() => router.push("/questionnaire")}
          >
            <Zap className="mr-3" />
            AI 투자 전략 받으러 가기
          </Button>
        </section>

        <section className="mb-20">
          <h2 className="text-4xl font-semibold text-foreground mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target size={40} className="text-primary" />}
              title="맞춤형 투자 전략"
              description="간단한 설문을 통해 개인의 재정 상황, 목표, 위험 감수 수준에 딱 맞는 투자 포트폴리오를 AI가 생성해 드립니다."
            />
            <FeatureCard
              icon={<BarChart3 size={40} className="text-primary" />}
              title="AI 주식 분석"
              description="관심 있는 주식의 매수/매도 타이밍을 AI가 분석하고, 시장 상황에 따른 전략적 조언을 제공합니다."
            />
            <FeatureCard
              icon={<TrendingUp size={40} className="text-primary" />}
              title="시장 해설 및 전망"
              description="최신 시장 뉴스와 동향을 입력하면, AI가 현재 포트폴리오에 미칠 영향을 분석하고 대응 방안을 제안합니다."
            />
             <FeatureCard
              icon={<ShieldCheck size={40} className="text-primary" />}
              title="안전한 자산 관리"
              description="보수적 투자자부터 공격적 투자자까지, 다양한 투자 성향을 고려한 안전하고 효율적인 자산 배분을 추천합니다."
            />
            <FeatureCard
              icon={<Users size={40} className="text-primary" />}
              title="사용자 친화적 인터페이스"
              description="금융 지식이 많지 않아도 괜찮아요. 누구나 쉽게 이해하고 사용할 수 있도록 직관적으로 설계되었습니다."
            />
            <FeatureCard
              icon={<MessageSquareHeart size={40} className="text-primary" />}
              title="지속적인 지원"
              description="궁금한 점이나 필요한 기능이 있다면 언제든지 문의하세요. 지속적인 업데이트로 더 나은 서비스를 제공하겠습니다."
            />
          </div>
        </section>
        
        <section className="mb-16 bg-card p-8 md:p-12 rounded-xl shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-6">
                왜 황금빛 노후 포트폴리오인가?
              </h2>
              <p className="text-lg text-foreground/80 mb-4">
                은퇴 후의 삶은 새로운 시작입니다. 저희는 AI 기술을 활용하여 여러분의 소중한 자산을 지키고, 안정적인 노후를 설계할 수 있도록 돕습니다. 더 이상 막막한 투자 고민은 그만, 전문가 수준의 AI 분석을 경험해보세요.
              </p>
              <ul className="space-y-3 text-foreground/70 list-inside list-disc">
                <li>데이터 기반의 객관적인 투자 분석</li>
                <li>개인별 상황을 고려한 1:1 맞춤 전략</li>
                <li>변화하는 시장에 대한 신속한 AI 인사이트</li>
                <li>이해하기 쉬운 용어와 직관적인 가이드</li>
              </ul>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image
                src="https://i.imgur.com/hUu0i8t.png"
                alt="행복한 노후"
                width={400}
                height={300}
                className="rounded-lg shadow-lg object-cover"
                data-ai-hint="happy retirement"
              />
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-6">준비되셨나요?</h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
            지금 바로 설문지를 작성하고, AI가 제안하는 당신만을 위한 황금빛 포트폴리오를 확인해보세요.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="text-lg py-6 px-8 border-primary text-primary hover:bg-primary/10 hover:text-primary transition-all"
            onClick={() => router.push("/questionnaire")}
          >
            무료로 내 포트폴리오 진단받기
          </Button>
        </section>
      </main>

      <footer className="mt-20 py-8 border-t border-border w-full">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 황금빛 노후 포트폴리오. 모든 권리 보유. <br />
          본 서비스에서 제공되는 정보는 투자 참고용이며, 투자 결정은 개인의 판단과 책임 하에 이루어져야 합니다.
        </p>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.3s forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-card/50 hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="items-center">
        <div className="p-3 bg-primary/10 rounded-full mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center text-foreground/70">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

