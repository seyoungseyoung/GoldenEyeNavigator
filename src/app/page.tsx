// src/app/page.tsx
export default function HomePage() {
  return (
    <div style={{ padding: '20px', color: 'black', backgroundColor: 'lightgreen', height: '100vh', fontSize: '24px' }}>
      <h1>애플리케이션 테스트 페이지</h1>
      <p>이 메시지가 보인다면, 기본적인 앱 렌더링은 작동하고 있는 것입니다.</p>
      <p>현재 시간: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
