'use client';

// ============================================================
// แท่นรับเหรียญรางวัล อันดับ 1-3 (หน้าสรุปภาพรวม)
// เหรียญวาดแบบพิกเซล 8-bit ด้วย SVG เหมือนตัวละคร (คมกริบ ไม่เบลอ)
// เรียงบนแท่น: อันดับ 2 (เงิน) — อันดับ 1 (ทอง, แท่นสูงสุด) — อันดับ 3 (ทองแดง)
// ============================================================
import { TeamPlayersAvatar, type PlayerInfo } from './pixel-avatar';

export interface PodiumTeam {
  name: string;
  played: number;
  win: number;
  lose: number;
  winRate: number;
}

// สีเหรียญแต่ละอันดับ: m = ตัวเหรียญ, d = ร่องล่าง, w = แสงวาบ, ribbon = ริบบิ้น
const MEDAL_COLORS: Record<1 | 2 | 3, { m: string; d: string; w: string; ribbon: string }> = {
  1: { m: '#fbbf24', d: '#b45309', w: '#fef9c3', ribbon: '#dc2626' }, // ทอง
  2: { m: '#cbd5e1', d: '#64748b', w: '#ffffff', ribbon: '#2563eb' }, // เงิน
  3: { m: '#d97706', d: '#7c2d12', w: '#fde68a', ribbon: '#991b1b' }, // ทองแดง
};

// แพทเทิร์นเหรียญ 12x12: R ริบบิ้น, M ตัวเหรียญ, W แสงวาบ, D ร่องล่าง
const MEDAL_PATTERN = [
  '....RRRR....',
  '...RRRRRR...',
  '...RRRRRR...',
  '..MMMMMMMM..',
  '.MMMMMMMMMM.',
  '.MMWWMMMMMM.',
  '.MMWMMMMMMM.',
  '.MMMMMMMMMM.',
  '.MMMMMMMMMM.',
  '..MDDDDDDM..',
  '..MMMMMMMM..',
  '...MMMMMM...',
];

// เหรียญพิกเซลอันดับ 1/2/3 (ทอง/เงิน/ทองแดง)
export function PixelMedal({ rank, size = 40 }: { rank: 1 | 2 | 3; size?: number }) {
  const c = MEDAL_COLORS[rank];
  const map: Record<string, string> = { R: c.ribbon, M: c.m, W: c.w, D: c.d };
  const rects: { x: number; y: number; fill: string }[] = [];
  MEDAL_PATTERN.forEach((row, y) => {
    for (let x = 0; x < 12; x++) {
      const ch = row[x];
      if (ch !== '.' && map[ch]) rects.push({ x, y, fill: map[ch] });
    }
  });
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`เหรียญอันดับ ${rank}`}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={1.02} height={1.02} fill={r.fill} />
      ))}
    </svg>
  );
}

// สไตล์แท่นของแต่ละอันดับ
const PED_STYLE: Record<1 | 2 | 3, { h: string; bg: string; ring: string; num: string; chip: string }> = {
  1: {
    h: 'h-28 sm:h-32',
    bg: 'bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500',
    ring: 'ring-amber-500/50',
    num: 'text-amber-900',
    chip: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:ring-amber-700',
  },
  2: {
    h: 'h-20 sm:h-24',
    bg: 'bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400',
    ring: 'ring-slate-400/50',
    num: 'text-slate-700',
    chip: 'bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600',
  },
  3: {
    h: 'h-14 sm:h-16',
    bg: 'bg-gradient-to-b from-orange-200 via-orange-400 to-orange-600',
    ring: 'ring-orange-500/40',
    num: 'text-orange-900',
    chip: 'bg-orange-100 text-orange-800 ring-1 ring-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:ring-orange-700',
  },
};

function PodiumColumn({
  rank,
  team,
  players,
}: {
  rank: 1 | 2 | 3;
  team?: PodiumTeam;
  players?: PlayerInfo[];
}) {
  if (!team) return <div className="flex-1 min-w-0" />; // เว้นช่องไว้ให้อันดับ 1 อยู่กลางเสมอ
  const ped = PED_STYLE[rank];
  return (
    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[230px]">
      <PixelMedal rank={rank} size={rank === 1 ? 46 : 36} />
      <span className={`mt-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${ped.chip}`}>
        อันดับ {rank}
      </span>
      <div className="mt-2 flex items-center justify-center">
        <TeamPlayersAvatar players={players} name={team.name} size={rank === 1 ? 38 : 30} />
      </div>
      <p className="mt-1.5 px-2 font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight text-center truncate w-full">
        {team.name}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">
        ชนะ {team.win} • แพ้ {team.lose} • {Math.round(team.winRate)}%
      </p>
      {/* แท่นรับเหรียญ */}
      <div
        className={`mt-2 w-full ${ped.h} ${ped.bg} ${ped.ring} ring-1 rounded-t-2xl border-t-4 border-white/60 flex items-start justify-center pt-1.5 shadow-inner`}
      >
        <span className={`text-3xl sm:text-4xl font-black leading-none ${ped.num}`}>{rank}</span>
      </div>
    </div>
  );
}

// แท่นรับเหรียญรางวัล 1-3: เรียง อันดับ 2 | อันดับ 1 | อันดับ 3 (อันดับ 1 กลาง แท่นสูงสุด)
export function Podium({
  teams,
  teamPlayersMap,
}: {
  teams: PodiumTeam[];
  teamPlayersMap: Record<string, PlayerInfo[]>;
}) {
  const podium = [teams[1], teams[0], teams[2]];
  const ranks: (1 | 2 | 3)[] = [2, 1, 3];
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6">
      {podium.map((team, i) => (
        <PodiumColumn
          key={team ? team.name : `empty-${i}`}
          rank={ranks[i]}
          team={team}
          players={team ? teamPlayersMap[team.name] : undefined}
        />
      ))}
    </div>
  );
}
