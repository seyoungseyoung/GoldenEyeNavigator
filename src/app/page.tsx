
// src/app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>애플리케이션 테스트 페이지</h1>
      <p>이 메시지가 보인다면, 기본적인 앱 렌더링은 작동하고 있는 것입니다.</p>
      <p>현재 시간: {new Date().toLocaleTimeString()}</p>
      <p>이 페이지는 lightcoral 배경색을 가져야 합니다 (globals.css에서 설정).</p>
    </div>
  );
}
