'use client';

import { useEffect, useId, useState } from 'react';

// อินโฟกราฟิกวงกลม Win Rate — วงแหวน SVG แบบ animate เติมรอบ
// ใช้สีแบบ attribute/inline style ทั้งหมด เพื่อให้ html2canvas เซฟรูปได้ถูกต้อง
export function WinRateRing({
  pct,
  size = 92,
  stroke = 10,
  from = '#2563eb',
  to = '#22d3ee',
  track = '#e5e7eb',
  text = '#334155',
}: {
  pct: number;
  size?: number;
  stroke?: number;
  from?: string;
  to?: string;
  track?: string;
  text?: string;
}) {
  const rawId = useId();
  const gid = `wr${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const radius = (100 - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, pct));
  const targetOffset = circumference * (1 - clamped / 100);

  // เริ่ม animate หลัง mount (วาดจาก 0 → ค่าจริง)
  const [on, setOn] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const label = Number(clamped.toFixed(1)).toString();

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`อัตราชนะ ${label}%`}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      {/* รางวงกลม */}
      <circle cx="50" cy="50" r={radius} fill="none" stroke={track} strokeWidth={stroke} />
      {/* วงแหวนอัตราชนะ */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={on ? targetOffset : circumference}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      {/* ตัวเลขกลางวง */}
      <text
        x="50"
        y="52"
        textAnchor="middle"
        fill={text}
        fontSize="21"
        fontWeight="800"
        fontFamily="'Noto Sans Thai','Segoe UI',sans-serif"
      >
        {label}%
      </text>
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fill={text}
        fontSize="8"
        fontWeight="600"
        opacity="0.65"
        fontFamily="'Noto Sans Thai','Segoe UI',sans-serif"
      >
        WIN RATE
      </text>
    </svg>
  );
}
