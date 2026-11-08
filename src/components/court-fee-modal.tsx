'use client';

import { useLang } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import type { HudSkin } from '@/lib/hud-skins';

// ============================================================
// Popup คิดตังค่าสนาม — ใส่ราคารวมค่าคอร์ท + จำนวนคนที่จะหาร
// คำนวณสด ๆ ทันทีที่พิมพ์: หารกันคนละเท่าไร
// + ถ้าปัดเศษขึ้น คนละกี่บาท รวมแล้วเกินกี่บาท
// ลุคกรอบ/ปุ่ม ตามสกิน HUD ที่เลือกไว้
// ============================================================

const fmt = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 2 });

const INPUT_CLS =
  'w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-lg font-extrabold text-center text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100';

const PEOPLE_CHIPS = [2, 4, 5, 6, 8, 10];

export function CourtFeeModal({
  open,
  skin,
  onClose,
}: {
  open: boolean;
  skin: HudSkin;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [total, setTotal] = useState('');
  const [people, setPeople] = useState('');

  // คำนวณสดจากค่าที่พิมพ์ (ราคารวม / จำนวนคน)
  const calc = useMemo(() => {
    const t = parseFloat(total);
    const p = parseInt(people, 10);
    if (isNaN(t) || isNaN(p) || t <= 0 || p <= 0) return null;
    const exact = t / p;
    const up = Math.ceil(exact); // ปัดเศษขึ้นเป็นจำนวนเต็มบาท
    const tip = Math.round((up * p - t) * 100) / 100; // ส่วนเกินรวมเมื่อปัดขึ้น
    return { exact, up, tip };
  }, [total, people]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('คิดตังค่าสนาม')}
      onClick={onClose}
    >
      <div
        className={`${skin.modalCard} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-calculator opacity-70"></i>
            {t('คิดตังค่าสนาม')}
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
          <i className="fa-solid fa-coins"></i>
          {t('ใส่ราคารวมค่าคอร์ท + จำนวนคนที่จะหาร')}
        </p>

        {/* ช่องกรอก: ราคารวม + จำนวนคน */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label htmlFor="feeTotal" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {t('ราคารวมค่าคอร์ท (บาท)')}
            </label>
            <input
              type="number"
              id="feeTotal"
              inputMode="decimal"
              min={0}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder={t('เช่น 800')}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label htmlFor="feePeople" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {t('จำนวนคนที่จะหาร (คน)')}
            </label>
            <input
              type="number"
              id="feePeople"
              inputMode="numeric"
              min={1}
              max={99}
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder={t('เช่น 4')}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* ปุ่มด่วนจำนวนคน */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-400 mr-0.5">{t('ด่วน:')}</span>
          {PEOPLE_CHIPS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPeople(String(n))}
              title={t('ตั้งจำนวนคน {n} คน', { n })}
              className={`w-8 h-7 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                people === String(n)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* ผลคำนวณ */}
        <div
          aria-live="polite"
          className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200 dark:from-emerald-950/50 dark:to-teal-950/40 dark:ring-emerald-800 px-4 py-4 text-center"
        >
          {calc ? (
            <>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300">{t('หารกันคนละ')}</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-300 leading-tight mt-0.5 tabular-nums">
                {fmt(calc.exact)}{' '}
                <span className="text-base font-extrabold">{t('บาท')}</span>
              </p>
              {calc.tip > 0 ? (
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1.5">
                  {t('ปัดเศษขึ้น')} <b className="text-emerald-600 dark:text-emerald-300">{t('คนละ {up} บาท', { up: fmt(calc.up) })}</b>{' '}
                  {t('(รวมเกิน {tip} บาท)', { tip: fmt(calc.tip) })}
                </p>
              ) : (
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1.5">
                  {t('ลงตัวพอดี ไม่ต้องปัดเศษ 👌')}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-semibold text-gray-400">
              {t('กรอกราคารวมและจำนวนคนเพื่อคำนวณ')}
            </p>
          )}
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              setTotal('');
              setPeople('');
            }}
            title={t('ล้างตัวเลขที่กรอก')}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition active:scale-95 cursor-pointer"
          >
            <i className="fa-solid fa-eraser mr-1"></i>{t('ล้าง')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
          >
            {t('เสร็จแล้ว')}
          </button>
        </div>
      </div>
    </div>
  );
}
