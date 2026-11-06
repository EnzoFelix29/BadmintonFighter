'use client';

import { TeamPlayersAvatar, type PlayerInfo } from './pixel-avatar';

export interface PodiumTeam {
  name: string;
  win: number;
  lose: number;
  played: number;
  winRate: number;
}

type Place = 1 | 2 | 3;

const PLACE_STYLE: Record<
  Place,
  { bar: string; medal: string; crown: boolean; avatar: number }
> = {
  1: {
    bar: 'h-24 sm:h-28 bg-gradient-to-t from-amber-500 to-yellow-300',
    medal: 'bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow-lg shadow-amber-400/40',
    crown: true,
    avatar: 44,
  },
  2: {
    bar: 'h-16 sm:h-20 bg-gradient-to-t from-slate-400 to-slate-300',
    medal: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-md shadow-slate-400/30',
    crown: false,
    avatar: 36,
  },
  3: {
    bar: 'h-12 sm:h-16 bg-gradient-to-t from-orange-600 to-amber-400',
    medal: 'bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-md shadow-orange-400/30',
    crown: false,
    avatar: 36,
  },
};

// แถวของทีมเดียวบนแท่น: เหรียญ + อวตาร + ชื่อ + สถิติ + แท่นสูงตามอันดับ
function PodiumColumn({
  team,
  place,
  playersMap,
}: {
  team: PodiumTeam;
  place: Place;
  playersMap: Record<string, PlayerInfo[]>;
}) {
  const conf = PLACE_STYLE[place];
  return (
    <div className="flex flex-col items-center w-24 sm:w-36 min-w-0">
      {conf.crown ? (
        <span className="text-2xl sm:text-3xl leading-none mb-1" role="img" aria-label="แชมป์">
          👑
        </span>
      ) : (
        <span className="h-8 sm:h-10 mb-1" aria-hidden="true"></span>
      )}
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${conf.medal}`}
        title={`อันดับ ${place}`}
      >
        <i className="fa-solid fa-medal"></i>
      </span>
      <div className="my-2">
        <TeamPlayersAvatar players={playersMap[team.name]} name={team.name} size={conf.avatar} />
      </div>
      <p className="font-extrabold text-sm text-gray-800 dark:text-gray-100 truncate max-w-full text-center leading-tight">
        {team.name}
      </p>
      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 text-center">
        {team.winRate.toFixed(1)}% • ชนะ {team.win} แพ้ {team.lose}
      </p>
      <div
        className={`w-full ${conf.bar} rounded-t-xl mt-2 flex items-start justify-center pt-1 ring-1 ring-black/5`}
      >
        <span className="text-xl sm:text-2xl font-black text-white/90 drop-shadow">{place}</span>
      </div>
    </div>
  );
}

// ===== แท่นรับเหรียญรางวัล อันดับ 1-3 =====
// อันดับ 1 ตรงกลาง (สูงสุด), อันดับ 2 ซ้าย, อันดับ 3 ขวา — เรียงตาม Win Rate
export function Podium({
  teams,
  playersMap,
}: {
  teams: PodiumTeam[]; // เรียงอันดับแล้ว (สูงสุดก่อน)
  playersMap: Record<string, PlayerInfo[]>;
}) {
  if (teams.length === 0) return null;
  const first = teams[0];
  const second = teams[1];
  const third = teams[2];

  return (
    <section className="bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/40 dark:to-gray-900 ring-1 ring-blue-100 dark:ring-blue-900/60 rounded-2xl p-4 sm:p-6">
      <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
        <i className="fa-solid fa-ranking-star text-amber-500"></i>
        แท่นรับเหรียญรางวัล • อันดับ 1-3
      </h3>
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {second && <PodiumColumn team={second} place={2} playersMap={playersMap} />}
        {first && <PodiumColumn team={first} place={1} playersMap={playersMap} />}
        {third && <PodiumColumn team={third} place={3} playersMap={playersMap} />}
      </div>
    </section>
  );
}
