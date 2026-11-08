'use client';

import type { HudSkin } from '@/lib/hud-skins';
import { useLang } from '@/lib/i18n';
import { FOOD_MENUS, type FoodMenu, type FoodMenuId } from '@/lib/food-menus';
import { PixelFoodArt } from '@/components/pixel-food';

// ============================================================
// Popup สุ่มเมนูอาหารหลังตีแบต — สล็อตกาชาปอง 6 เมนู
// เปิดเมื่อกดปุ่มสุ่มเมนูบน HUD (ไม่เด้งอัตโนมัติหลังบันทึกผล)
// ตอนสุ่ม: รูปวนเป็นสล็อต + เด้ง + กะพริบ ~3.2 วิ แล้วเด้งผล
// ผลลัพธ์: ชื่อเมนู/ร้าน + มุก + ตารางโอกาสทั้ง 6 เมนู
// ลุคการ์ด/ปุ่ม ตามสกิน HUD ที่เลือกไว้
// ============================================================
export function FoodRouletteModal({
  open,
  state,
  display,
  result,
  skin,
  onRollAgain,
  onClose,
}: {
  open: boolean;
  state: 'rolling' | 'done';
  display: FoodMenuId; // เมนูที่โชว์ในช่องสล็อตขณะกำลังวน
  result: FoodMenu | null; // ผลลัพธ์จริง (null ขณะกำลังสุ่ม)
  skin: HudSkin;
  onRollAgain: () => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  if (!open) return null;

  const rolling = state === 'rolling';

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('สุ่มเมนูอาหารหลังตีแบต')}
      onClick={rolling ? undefined : onClose}
    >
      <div
        className={`${skin.card} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-utensils opacity-70"></i>
            {t('สุ่มเมนูหลังตีแบต')}
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
          <i className="fa-solid fa-bowl-food"></i>
          {t('ตีเสร็จต้องมีกิน — สุ่มตามโอกาสที่กำหนด')}
        </p>

        {/* ช่องสล็อตเมนูพิกเซล 8-บิต */}
        <div className="flex flex-col items-center pt-6 pb-3">
          <div className="rounded-2xl ring-2 ring-black/10 bg-white/50 dark:bg-black/30 dark:ring-white/10 px-6 py-4">
            <div className={rolling ? 'animate-coinbounce' : ''}>
              <div className={rolling ? 'animate-foodflicker' : 'animate-foodpop'}>
                <PixelFoodArt menu={display} className="h-28 w-28 sm:h-32 sm:w-32" />
              </div>
            </div>
          </div>

          {/* ผลสุ่ม */}
          <div aria-live="polite" className="mt-3 text-center min-h-[3.5rem]">
            {rolling ? (
              <p className={`text-lg font-extrabold ${skin.score}`}>{t('กำลังสุ่มเมนู…')}</p>
            ) : (
              result && (
                <>
                  <p
                    className="text-xl font-black leading-tight"
                    style={{ color: result.accent }}
                  >
                    {t(result.dish)}{' '}
                    <span className="text-base font-extrabold">{t(result.shop)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{t(result.tagline)}</p>
                </>
              )
            )}
          </div>
        </div>

        {/* ตารางโอกาสทั้ง 6 เมนู */}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {FOOD_MENUS.map((m) => {
            const isResult = !rolling && result?.id === m.id;
            return (
              <div
                key={m.id}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold ring-1 transition ${
                  isResult
                    ? 'ring-2 bg-white dark:bg-gray-800 scale-[1.03]'
                    : 'ring-black/5 bg-white/60 dark:bg-white/5 text-gray-400'
                }`}
                style={isResult ? { color: m.accent, borderColor: m.accent } : undefined}
              >
                <span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-[2px] shrink-0"
                  style={{ backgroundColor: m.accent }}
                />
                <span className={`truncate ${isResult ? '' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t(m.dish)}
                </span>
                <span className="ml-auto shrink-0 tabular-nums opacity-80">{m.chance}%</span>
              </div>
            );
          })}
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={onRollAgain}
            disabled={rolling}
            title={t('สุ่มเมนูใหม่')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 disabled:opacity-60 cursor-pointer ${skin.flipBtn}`}
          >
            <i className="fa-solid fa-dice"></i>
            {rolling ? t('กำลังสุ่ม…') : t('สุ่มใหม่')}
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
