'use client';

import { colorMapFor, patternFor, SKIN_BY_NAME, getSkin, type Skin } from '@/lib/characters';

// ตัวละคร 8-bit — วาดจากกริดพิกเซล 12x14 ด้วย SVG (คมกริบ ไม่เบลอ)
export function PixelAvatar({
  skin,
  size = 40,
  className = '',
}: {
  skin: Skin;
  size?: number;
  className?: string;
}) {
  const colors = colorMapFor(skin);
  const rows = patternFor(skin);
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
      aria-label={`ตัวละคร 8-bit: ${skin.name}`}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={1.02} height={1.02} fill={r.fill} />
      ))}
    </svg>
  );
}

// อวตารของทีม: ถ้าชื่อตรงกับตัวละครจะแสดงพิกเซลอวตาร
// ถ้าเป็นข้อมูลชื่อแบบเก่า (พิมพ์เอง) จะแสดงตัวอักษรแรกแทน
export function TeamAvatar({ name, size = 24 }: { name: string; size?: number }) {
  const skin = SKIN_BY_NAME.get(name);
  if (skin) return <PixelAvatar skin={skin} size={size} className="shrink-0" />;
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.45) }}
      className="rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-white font-extrabold inline-flex items-center justify-center shrink-0 leading-none"
      aria-hidden="true"
    >
      {name.trim().charAt(0) || '?'}
    </span>
  );
}

export interface PlayerInfo {
  name: string;
  skinId: string;
  racketId?: string; // สกินไม้แบด (ข้อมูลเวอร์ชันใหม่)
  shoeId?: string; // สกินรองเท้าแบด (ข้อมูลเวอร์ชันใหม่)
}

// อวตารของทีมจากรายชื่อผู้เล่น: เดี่ยว = 1 อวตาร, คู่ = 2 อวตารซ้อนกัน
// ถ้าไม่มีข้อมูลผู้เล่น (ข้อมูลเก่า) จะ fallback ด้วย TeamAvatar จากชื่อทีม
export function TeamPlayersAvatar({
  players,
  name,
  size = 24,
}: {
  players?: PlayerInfo[];
  name: string;
  size?: number;
}) {
  const skins = (players ?? []).map((p) => getSkin(p.skinId)).filter((s): s is Skin => !!s);
  if (skins.length >= 2) {
    return (
      <span className="inline-flex items-center shrink-0" aria-hidden="true">
        <PixelAvatar skin={skins[0]} size={size} />
        <span style={{ marginLeft: -size * 0.38 }}>
          <PixelAvatar skin={skins[1]} size={size} />
        </span>
      </span>
    );
  }
  if (skins.length === 1) return <PixelAvatar skin={skins[0]} size={size} className="shrink-0" />;
  return <TeamAvatar name={name} size={size} />;
}
