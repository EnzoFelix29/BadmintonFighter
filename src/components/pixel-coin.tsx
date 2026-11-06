'use client';

import { useMemo, type CSSProperties } from 'react';

// ============================================================
// เหรียญพิกเซล 8-บิต (16×16) — วาดจากแผนที่พิกเซลแบบโปรแกรม
// ดีเทลสวย ๆ แบบเกมยุค 90:
//   ขอบน้ำตาลเข้ม • ไฮไลต์ขอบบนซ้าย (แสงสะท้อน) • เงาโค้งล่างขวา 2 โทน
//   ประกายวาวมุมบนซ้าย • ตัวอักษร A (หัว) / B (ก้อย) แบบฟอนต์พิกเซล 5×7
// ใช้ใน popup จับเหรียญ (เหรียญใหญ่) และปุ่มบน HUD (เหรียญเล็ก)
// ============================================================

const GRID = 16; // ขนาดกริดพิกเซล

// โทนสีเหรียญทอง 8-บิต
const COLORS: Record<string, string> = {
  o: '#5c3a00', // ขอบเหรียญเข้ม
  r: '#ffe98a', // ขอบสะท้อนแสงบนซ้าย
  f: '#ffc93c', // พื้นเหรียญทอง
  d: '#e0a100', // เงาโทนกลาง
  k: '#b26e00', // เงาเข้มโค้งล่างขวา
  l: '#7a4a00', // ตัวอักษร
  w: '#fffbe6', // ประกายวาว
};

// ฟอนต์พิกเซล 5×7 สำหรับหน้าเหรียญ
const LETTERS: Record<'A' | 'B', string[]> = {
  A: ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  B: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
};

type Pixel = { x: number; y: number; fill: string; w?: number };

// สร้างแผนที่พิกเซลหน้าเหรียญ (แสงมาจากบนซ้าย) — ใช้ Map กัน key ซ้ำ: ตัวอักษร/ประกายทับพื้นเหรียญได้
function buildFace(letter: 'A' | 'B'): Pixel[] {
  const map = new Map<string, Pixel>();
  const put = (x: number, y: number, fill: string) => map.set(`${x},${y}`, { x, y, fill });
  const c = GRID / 2 - 0.5; // 7.5 — กึ่งกลางกริด
  const R = 7.9; // รัศมีเหรียญ

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const dist = Math.sqrt((x - c) ** 2 + (y - c) ** 2);
      if (dist > R) continue; // นอกเหรียญ
      const diag = x + y; // มุมสว่าง: น้อย = โดนแสงบนซ้าย
      let ch: string;
      if (dist > R - 1.15) ch = diag <= 14 ? 'r' : 'o'; // ขอบ: บนซ้ายสว่าง ล่างขวาเข้ม
      else if (diag >= 22) ch = 'k'; // เงาเข้มมุมล่างขวา
      else if (diag >= 18) ch = 'd'; // เงาโทนกลาง
      else ch = 'f'; // พื้นทอง
      put(x, y, COLORS[ch]);
    }
  }

  // ประกายวาวเล็ก ๆ มุมบนซ้าย (แนวทแยง) — ทับพื้นเหรียญ
  put(5, 3, COLORS.w);
  put(4, 4, COLORS.w);
  put(3, 5, COLORS.w);

  // ตัวอักษรพิกเซล 5×7 กลางเหรียญ — ทับพื้นเหรียญ
  const glyph = LETTERS[letter];
  glyph.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      if (ch === 'X') put(5 + i, 5 + j, COLORS.l);
    });
  });

  return [...map.values()];
}

// เงาทึบทั้งเหรียญ (ใช้ทำ "ความหนา" ของเหรียญ 3 มิติ)
// merge พิกเซลต่อแถวเป็น rect เดียว — ชั้นเยอะก็เบา (เหรียญหนา 16px ใช้ 11 ชั้น)
function buildSilhouette(edgeColor: string): Pixel[] {
  const out: Pixel[] = [];
  const c = GRID / 2 - 0.5;
  const R = 7.9;
  for (let y = 0; y < GRID; y++) {
    let minX = -1;
    let maxX = -1;
    for (let x = 0; x < GRID; x++) {
      if (Math.sqrt((x - c) ** 2 + (y - c) ** 2) <= R) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1) out.push({ x: minX, y, fill: edgeColor, w: maxX - minX + 1 });
  }
  return out;
}

// หน้าเหรียญพิกเซลเดี่ยว (SVG คมชัด ไม่เบลอ)
export function PixelCoinFace({
  letter,
  silhouette,
  edgeColor = '#c07f00',
  className,
  style,
}: {
  letter: 'A' | 'B';
  silhouette?: boolean; // วาดทึบสีเดียว (ชั้นขอบเหรียญ)
  edgeColor?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const pixels = useMemo(
    () => (silhouette ? buildSilhouette(edgeColor) : buildFace(letter)),
    [letter, silhouette, edgeColor]
  );

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {pixels.map((p) => (
        <rect
          key={`${p.x}-${p.y}`}
          x={p.x}
          y={p.y}
          width={1.02 * (p.w ?? 1)}
          height={1.02}
          fill={p.fill}
        />
      ))}
    </svg>
  );
}
