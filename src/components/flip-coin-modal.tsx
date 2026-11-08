'use client';

import type { HudSkin } from '@/lib/hud-skins';
import { useLang } from '@/lib/i18n';
import { PixelCoinFace } from '@/components/pixel-coin';

// ============================================================
// ความหนาเหรียญ (16px) — ชั้นขอบพิกเซลซ้อนตามแนว Z 11 ชั้น
// ไล่โทนตามแสงจากบน: ขอบบนสะท้อนแสงทองอ่อน → ขอบล่างเข้มสุด
// ปรับความหนาได้ที่ z ของชั้นแรก/สุดท้าย (FACE_Z = ครึ่งหนา + 0.8)
// ============================================================
const EDGE_LAYERS: Array<{ z: number; color: string }> = [
  { z: -8, color: '#ffe98a' }, // ขอบบนจับแสง (สว่างสุด)
  { z: -6.4, color: '#ffc93c' },
  { z: -4.8, color: '#e0a100' },
  { z: -3.2, color: '#c07f00' },
  { z: -1.6, color: '#a86400' },
  { z: 0, color: '#8a5500' },
  { z: 1.6, color: '#7a4a00' },
  { z: 3.2, color: '#6e4400' },
  { z: 4.8, color: '#5c3a00' },
  { z: 6.4, color: '#4a2d00' },
  { z: 8, color: '#3a2200' }, // ขอบล่างเข้มสุด
];
const FACE_Z = 8.8; // หน้าเหรียญ A/B ยื่นนอกสุดของก้อนความหนา

// ============================================================
// Popup จับเหรียญเสิร์ฟก่อน — เหรียญใหญ่เด้งกลางจอ
// กดปุ่ม "จับเหรียญเสิร์ฟก่อน" บน HUD แล้ว popup จะเปิดขึ้น
// เหรียญเด้งขึ้นกลางจอพร้อมหมุน (rotateX) จนรู้ผล:
//   หัว (A) = ทีม A เสิร์ฟก่อน / ก้อย (B) = ทีม B เสิร์ฟก่อน
// ลุคการ์ด/เหรียญ/ปุ่ม ตามสกิน HUD ที่เลือกไว้ (5 แบบ)
// ============================================================
export function FlipCoinModal({
  open,
  state,
  face,
  teamAName,
  teamBName,
  skin,
  onFlipAgain,
  onClose,
}: {
  open: boolean;
  state: 'flipping' | 'done';
  face: 'A' | 'B';
  teamAName: string;
  teamBName: string;
  skin: HudSkin;
  onFlipAgain: () => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  if (!open) return null;

  const flipping = state === 'flipping';
  const serveName = face === 'A' ? teamAName : teamBName;
  const other = face === 'A' ? 'B' : 'A';

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('จับเหรียญเสิร์ฟก่อน')}
      onClick={flipping ? undefined : onClose}
    >
      <div
        className={`${skin.card} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-coins opacity-70"></i>
            {t('จับเหรียญเสิร์ฟก่อน')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('ปิดหน้าต่าง')}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <p className={`text-[11px] font-semibold ${skin.sub} rounded-full px-2.5 py-1 inline-flex items-center gap-1`}>
          <i className="fa-solid fa-circle-half-stroke"></i>
          {t('หัว = ทีม A • ก้อย = ทีม B')}
        </p>

        {/* เหรียญพิกเซล 8-บิต มุม isometric — เด้งกลางจอพร้อมหมุนรอบแกนตั้ง (หนา 16px) */}
        <div className="flex flex-col items-center pt-12 pb-4">
          <div className="[perspective:900px]">
            <div className={`[transform-style:preserve-3d] ${flipping ? 'animate-coinbounce' : ''}`}>
              <div className={`[transform-style:preserve-3d] ${flipping ? '' : 'animate-coinpop'}`}>
                {/* เอียงเหรียญแบบ isometric ตลอดเวลา — เห็นความหนาเหรียญ + หน้าเอียงเหมือนเกม 8-บิต */}
                <div className="[transform-style:preserve-3d] [transform:rotateX(-24deg)_rotateZ(-8deg)]">
                  <div
                    className={`relative h-32 w-32 sm:h-40 sm:w-40 [transform-style:preserve-3d] ${
                      flipping ? 'animate-coinisospin' : ''
                    }`}
                  >
                    {/* ความหนาของเหรียญ 16px — ชั้นขอบพิกเซลซ้อน 11 ชั้น สว่างบน-เข้มล่างตามแสง */}
                    {EDGE_LAYERS.map((layer) => (
                      <PixelCoinFace
                        key={layer.z}
                        letter="A"
                        silhouette
                        edgeColor={layer.color}
                        className="absolute inset-0 h-full w-full"
                        style={{ transform: `translateZ(${layer.z}px)` }}
                      />
                    ))}
                    {/* หน้าหัว A (หรือหน้าผลลัพธ์ตอนรู้ผล) */}
                    <PixelCoinFace
                      letter={face}
                      className="absolute inset-0 h-full w-full [backface-visibility:hidden]"
                      style={{ transform: `translateZ(${FACE_Z}px)` }}
                    />
                    {/* หน้าก้อย B — ปั๋งด้านหลังโชว์ตอนเหรียญหมุนคว่ำ */}
                    <PixelCoinFace
                      letter={other}
                      className="absolute inset-0 h-full w-full [backface-visibility:hidden]"
                      style={{ transform: `rotateY(180deg) translateZ(${FACE_Z}px)` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* เงาใต้เหรียญ — หด/ขยายตามจังหวะเด้ง */}
          <div
            aria-hidden="true"
            className={`mt-5 h-3 w-28 rounded-[100%] bg-black/30 dark:bg-black/60 ${
              flipping ? 'animate-coinshadow' : ''
            }`}
          />

          {/* ข้อความผล */}
          <p aria-live="polite" className={`mt-4 text-center text-lg font-extrabold ${skin.score}`}>
            {flipping
              ? t('กำลังเหวี่ยงเหรียญ…')
              : t('{side}! {name} เสิร์ฟก่อน', {
                  side: t(face === 'A' ? 'หัว' : 'ก้อย'),
                  name: serveName,
                })}
          </p>
          <p className="mt-1 text-xs text-gray-400 text-center">
            {flipping ? t('รอเหรียญตกลงพื้นก่อนนะ…') : t('ทีมที่ชนะเหรียญได้เสิร์ฟลูกก่อน 🏸')}
          </p>
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <button
            type="button"
            onClick={onFlipAgain}
            disabled={flipping}
            title={t('เหวี่ยงเหรียญใหม่')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 disabled:opacity-60 cursor-pointer ${skin.flipBtn}`}
          >
            <i className="fa-solid fa-rotate-right"></i>
            {flipping ? t('กำลังเหวี่ยง…') : t('เหวี่ยงใหม่')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition active:scale-95 cursor-pointer"
          >
            {t('ปิด')}
          </button>
        </div>
      </div>
    </div>
  );
}
