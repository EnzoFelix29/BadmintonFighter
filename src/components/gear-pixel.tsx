'use client';

import { RACKET_PATTERNS, SHOE_PATTERNS, type GearSkin } from '@/lib/gear';
import { shade } from '@/lib/characters';

// แผนที่อักษร -> สี ของสกินอุปกรณ์
// ไม้แบด: F กรอบ / G เส้นเชือก / H สันไม้ / P จับไม้
// รองเท้า: B ตัวรองเท้า / D ลายข้าง / L เชือก / W พื้นรองเท้า
export function gearColorMap(g: GearSkin): Record<string, string> {
  if (g.kind === 'racket') {
    return {
      F: g.primary,
      G: g.string,
      H: shade(g.primary, 0.55),
      P: g.accent,
    };
  }
  return {
    B: g.primary,
    D: g.detail,
    T: shade(g.primary, 0.78),
    L: g.string,
    W: g.accent,
  };
}

// อุปกรณ์ 8-bit — วาดจากกริดพิกเซล 12x14 ด้วย SVG (คมกริบ ไม่เบลอ)
export function GearPixel({
  gear,
  size = 40,
  className = '',
}: {
  gear: GearSkin;
  size?: number;
  className?: string;
}) {
  const colors = gearColorMap(gear);
  const rows =
    gear.kind === 'racket'
      ? RACKET_PATTERNS[gear.shape as 'oval' | 'wide' | 'tear'] ?? RACKET_PATTERNS.oval
      : SHOE_PATTERNS[gear.shape as 'sneaker' | 'hightop'] ?? SHOE_PATTERNS.sneaker;

  const rects: { x: number; y: number; fill: string }[] = [];
  rows.forEach((row, y) => {
    const padded = row.padEnd(12, '.');
    for (let x = 0; x < 12; x++) {
      const ch = padded[x];
      if (ch !== '.' && colors[ch]) rects.push({ x, y, fill: colors[ch] });
    }
  });

  return (
    <svg
      viewBox="0 0 12 14"
      width={size}
      height={Math.round((size * 14) / 12)}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`${gear.kind === 'racket' ? 'ไม้แบด' : 'รองเท้าแบด'}สกิน ${gear.name}`}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={1.02} height={1.02} fill={r.fill} />
      ))}
    </svg>
  );
}
