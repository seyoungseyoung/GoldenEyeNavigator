
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
      <h1 className="text-5xl font-bold text-primary mb-6">
        애플리케이션 로딩 중...
      </h1>
      <p className="text-xl text-foreground/80 mb-10 max-w-2xl">
        페이지가 올바르게 표시되지 않으면 알려주세요.
      </p>
      <div style={{ padding: '20px', border: '1px solid #D4AF37', backgroundColor: '#F5F5DC' }}>
        <p style={{ color: '#808000' }}>이 박스가 보이면 기본 HTML과 CSS는 작동하는 것입니다.</p>
      </div>
    </div>
  );
}
