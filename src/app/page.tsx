// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setCurrentTime(new Date().toLocaleTimeString());
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div style={{ padding: '20px' }}>
      <h1>애플리케이션 테스트 페이지</h1>
      <p>이 메시지가 보인다면, 기본적인 앱 렌더링은 작동하고 있는 것입니다.</p>
      {currentTime !== null ? (
        <p>현재 시간 (클라이언트): {currentTime}</p>
      ) : (
        <p>현재 시간 불러오는 중...</p>
      )}
      <p>이 페이지는 lightcoral 배경색을 가져야 합니다 (globals.css에서 설정).</p>
    </div>
  );
}
