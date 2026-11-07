'use client';

import { HUD_SKINS, type HudSkin } from '@/lib/hud-skins';
import { PixelCoinFace } from '@/components/pixel-coin';
import { PixelFoodArt } from '@/components/pixel-food';

// ===== HUD สกอร์บอร์ดสด =====
// มิเรอร์คะแนนที่กรอกในฟอร์มแบบเรียลไทม์ + ป้ายเกมละกี่แต้ม + ผลจับเหรียญเสิร์ฟก่อน
// เปลี่ยนลุคได้ 5 สกิน (คลาสสิก / นีออน / เรโทร 8-บิต / ทองหรู / มินิมอล)
export function ScoreHud({
  skin,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  maxScore,
  serveTeam,
  flipState,
  flipFace,
  onFlip,
  onFoodRoll,
  onPickSkin,
}: {
  skin: HudSkin;
  teamAName: string;
  teamBName: string;
  scoreA: string;
  scoreB: string;
  maxScore: string;
  serveTeam: 'A' | 'B' | null;
  flipState: 'idle' | 'flipping' | 'done';
  flipFace: 'A' | 'B';
  onFlip: () => void;
  onFoodRoll: () => void; // สุ่มเมนูอาหารหลังตีแบต (popup สล็อตกาชาปอง)
  onPickSkin: (id: string) => void;
}) {
  const a = scoreA === '' ? '0' : scoreA;
  const b = scoreB === '' ? '0' : scoreB;

  return (
    <div className="mb-5">
      {/* แถวหัว: ป้าย HUD + ตัวเลือกสกิน 5 แบบ */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <i className="fa-solid fa-tv text-blue-500"></i>สกอร์บอร์ด HUD — อัปเดตสดตามที่กรอก
        </p>
        <div role="group" aria-label="เลือกสกิน HUD" className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-gray-400">สกิน HUD:</span>
          {HUD_SKINS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPickSkin(s.id)}
              title={`สกิน ${s.name} — ${s.tag}`}
              aria-pressed={s.id === skin.id}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${s.chip} ${
                s.id === skin.id
                  ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900 scale-[1.04]'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* กรอบ HUD ตามสกินที่เลือก */}
      <div className={`${skin.card} px-4 py-3 sm:px-6 sm:py-4`}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* ทีม A */}
          <div className="text-center sm:text-left min-w-0">
            <p className={`text-xs sm:text-sm font-extrabold truncate ${skin.nameA}`}>{teamAName}</p>
            <p className="text-[10px] font-semibold text-gray-400">ทีม A</p>
          </div>
          {/* คะแนนสด */}
          <div className="flex items-center gap-2 sm:gap-3" aria-live="polite">
            <span
              className={`text-3xl sm:text-4xl font-black tabular-nums leading-none ${skin.score} ${skin.scoreA ?? ''}`}
            >
              {a}
            </span>
            <span className={`text-2xl font-black ${skin.colon}`}>:</span>
            <span
              className={`text-3xl sm:text-4xl font-black tabular-nums leading-none ${skin.score} ${skin.scoreB ?? ''}`}
            >
              {b}
            </span>
          </div>
          {/* ทีม B */}
          <div className="text-center sm:text-right min-w-0">
            <p className={`text-xs sm:text-sm font-extrabold truncate ${skin.nameB}`}>{teamBName}</p>
            <p className="text-[10px] font-semibold text-gray-400">ทีม B</p>
          </div>
        </div>

        {/* แถวล่าง: ป้ายสถานะ + จับเหรียญเสิร์ฟก่อน */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 ${skin.sub}`}
            >
              <i className="fa-solid fa-flag"></i>เกมละ {maxScore} แต้ม
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 ${
                serveTeam ? skin.serve : skin.sub
              }`}
            >
              <i className="fa-solid fa-table-tennis-paddle-ball"></i>
              {serveTeam
                ? `ทีม ${serveTeam} เสิร์ฟก่อน${flipState === 'done' ? (serveTeam === 'A' ? ' (หัว)' : ' (ก้อย)') : ''}`
                : 'ยังไม่ได้จับเหรียญเสิร์ฟ'}
            </span>
          </div>
          <button
            type="button"
            onClick={onFlip}
            disabled={flipState === 'flipping'}
            title="จับเหรียญเลือกทีมเสิร์ฟก่อน — popup เหรียญเด้งกลางจอ (หัว = ทีม A, ก้อย = ทีม B)"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-60 cursor-pointer ${skin.flipBtn}`}
          >
            <span
              aria-hidden="true"
              className={`w-7 h-7 flex items-center justify-center ${
                flipState === 'flipping' ? 'animate-coinflip' : flipState === 'done' ? 'animate-coinpop' : ''
              }`}
            >
              <PixelCoinFace letter={flipFace} className="h-full w-full" />
            </span>
            {flipState === 'flipping'
              ? 'กำลังเหวี่ยง…'
              : flipState === 'done'
                ? 'เหวี่ยงใหม่'
                : 'จับเหรียญเสิร์ฟก่อน'}
          </button>
          {/* ปุ่มสุ่มเมนูอาหารหลังตีแบต — สล็อตกาชาปอง 6 เมนูเด้งกลางจอ */}
          <button
            type="button"
            onClick={onFoodRoll}
            title="สุ่มเมนูอาหารหลังตีแบต — สล็อต 6 เมนูตามโอกาส 45/15/15/10/10/5 (เด้งกลางจอ)"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
          >
            <span aria-hidden="true" className="w-7 h-7 flex items-center justify-center">
              <PixelFoodArt menu="congee" className="h-full w-full" />
            </span>
            สุ่มเมนูอาหาร
          </button>
        </div>
      </div>
    </div>
  );
}
