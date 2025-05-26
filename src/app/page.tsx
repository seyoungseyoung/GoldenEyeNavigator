
// src/app/page.tsx
"use client";

// All dynamic logic removed for extreme simplification
// import { useState, useEffect } from 'react';

export default function HomePage() {
  // const [currentTime, setCurrentTime] = useState<string | null>(null);

  // useEffect(() => {
  //   // This will only run on the client, after initial hydration
  //   setCurrentTime(new Date().toLocaleTimeString());
  // }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div style={{ padding: '20px' }}>
      <h1>애플리케이션 기본 테스트 페이지</h1>
      <p>이 메시지가 보인다면, Next.js 앱의 기본 렌더링은 작동하는 것입니다.</p>
      <p>이 페이지 배경은 globals.css에 정의된 lightcoral 색상이어야 합니다.</p>
      {/* {currentTime !== null ? (
        <p>현재 시간 (클라이언트): {currentTime}</p>
      ) : (
        <p>현재 시간 불러오는 중...</p>
      )} */}
    </div>
  );
}
