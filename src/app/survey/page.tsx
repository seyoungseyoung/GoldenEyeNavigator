import { SurveyForm } from '@/components/survey/SurveyForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SurveyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary">투자 성향 설문</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            AI가 당신만을 위한 최적의 투자 전략을 추천해 드립니다.<br/>
            정확한 추천을 위해 아래 질문에 답변해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <SurveyForm />
        </CardContent>
      </Card>
    </div>
  );
}
