'use client';

import type { HudSkin } from '@/lib/hud-skins';
import { useLang } from '@/lib/i18n';
import { ShuttlecockIcon } from '@/components/shuttlecock-icon';

// ===== โมดอลกฎกติกา & วิธีได้เหรียญ =====
// สรุปกติกาเหรียญรายบุคคล (ชนะ +7 / แพ้ +3 / ชนะขาด +10) กฎการกรอกแต้ม และจับเหรียญเสิร์ฟก่อน
export function RulesModal({
  open,
  onClose,
  skin,
}: {
  open: boolean;
  onClose: () => void;
  skin: HudSkin; // สกิน HUD ปัจจุบัน — ธีมกรอบโมดอลตามสกินทั้งหน้า
}) {
  const { t } = useLang();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('กฎกติกาและวิธีได้เหรียญ')}
      onClick={onClose}
    >
      <div
        className={`${skin.modalCard} w-full max-w-md max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัวโมดอล */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-amber-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-lg shadow-lg shadow-amber-500/25 shrink-0">
              <i className="fa-solid fa-scale-balanced"></i>
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                {t('กฎกติกา & วิธีได้เหรียญ')}
              </h2>
              <p className="text-xs text-gray-400">
                {t('สรุปกติกาเหรียญ การกรอกแต้ม และการเสิร์ฟก่อน')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('ปิดหน้าต่าง')}
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center shrink-0"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* เนื้อหา */}
        <div className="p-5 space-y-4 text-sm">
          <section>
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-coins text-amber-500"></i>
              {t('วิธีได้เหรียญ (รายบุคคล)')}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2.5 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl px-3 py-2 dark:bg-emerald-950/50 dark:ring-emerald-900">
                <i className="fa-solid fa-circle-check text-emerald-500"></i>
                <span className="text-gray-700 dark:text-gray-200">
                  <b>{t('ชนะ')}</b> {t('ได้')}{' '}
                  <b className="text-emerald-600 dark:text-emerald-300">{t('+7 เหรียญ')}</b>
                  {t('/คน')}
                </span>
              </li>
              <li className="flex items-center gap-2.5 bg-amber-50 ring-1 ring-amber-100 rounded-xl px-3 py-2 dark:bg-amber-950/40 dark:ring-amber-900">
                <i className="fa-solid fa-fire text-amber-500"></i>
                <span className="text-gray-700 dark:text-gray-200">
                  <b>{t('ชนะขาด')}</b> {t('ได้')}{' '}
                  <b className="text-amber-600 dark:text-amber-300">{t('+10 เหรียญ')}</b>
                  {t('/คน')} {t('— ทีมแพ้ได้ต่ำกว่า')} <b>{t('5 แต้ม')}</b> {t('หรือ ชนะห่าง')}{' '}
                  <b>{t('15 แต้ม')}</b> {t('ขึ้นไป')}
                </span>
              </li>
              <li className="flex items-center gap-2.5 bg-rose-50 ring-1 ring-rose-100 rounded-xl px-3 py-2 dark:bg-rose-950/40 dark:ring-rose-900">
                <i className="fa-solid fa-heart-crack text-rose-500"></i>
                <span className="text-gray-700 dark:text-gray-200">
                  <b>{t('แพ้')}</b> {t('ได้')}{' '}
                  <b className="text-rose-500 dark:text-rose-300">{t('+3 เหรียญ')}</b>
                  {t('/คน')}
                </span>
              </li>
            </ul>
            <p className="text-xs text-gray-400 mt-2">
              {t('เหรียญใช้ปลดล็อคสกินไม้แบด/รองเท้าในร้านค้า (100 เหรียญ/สกิน)')}
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-flag text-blue-500"></i>
              {t('กฎการกรอกแต้ม')}
            </h3>
            <div className="bg-blue-50 ring-1 ring-blue-100 rounded-xl px-3 py-2.5 text-gray-700 dark:bg-blue-950/40 dark:ring-blue-900 dark:text-gray-200">
              {t('แต้มที่กรอก')}
              <b>{t('ห้ามเกิน')}</b>
              {t('จำนวนแต้มที่เลือก (เกมละ')} <b>15</b> {t('หรือ')} <b>21</b>{' '}
              {t('แต้ม) — พิมพ์เกินระบบจะตัดเลขให้อัตโนมัติ และแบดมินตันไม่มีผลเสมอ')}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <ShuttlecockIcon className="w-4 h-4 text-rose-500" />
              {t('จับเหรียญเสิร์ฟก่อน')}
            </h3>
            <div className="bg-gray-50 ring-1 ring-gray-100 rounded-xl px-3 py-2.5 text-gray-700 dark:bg-gray-800/60 dark:ring-gray-700 dark:text-gray-200">
              {t('ก่อนเริ่มเกมกดปุ่ม')} <b>{t('“จับเหรียญเสิร์ฟก่อน”')}</b>{' '}
              {t('บน HUD — เหรียญจะเด้งขึ้นกลางจอเป็น popup พร้อมหมุน จนเหรียญตกลงพื้นรู้ผล:')}{' '}
              <b>{t('หัว = ทีม A')}</b>, <b>{t('ก้อย = ทีม B')}</b>{' '}
              {t('ทีมที่ชนะจะได้เสิร์ฟลูกก่อน (กดเหวี่ยงใหม่ได้เสมอ)')}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-utensils text-amber-500"></i>
              {t('สุ่มเมนูอาหารหลังตีแบต (ลูกเล่น)')}
            </h3>
            <div className="bg-amber-50 ring-1 ring-amber-100 rounded-xl px-3 py-2.5 text-gray-700 dark:bg-amber-950/40 dark:ring-amber-900 dark:text-gray-200">
              {t('บันทึกผลแข่งเสร็จ กดปุ่ม')} <b>{t('“สุ่มเมนูอาหาร”')}</b>{' '}
              {t('บน HUD เพื่อสุ่มเมนูได้เลย — มี 6 เมนู ออกตามโอกาส: ข้าวต้ม ข้างทาง')} <b>45%</b>{' '}
              {t('• ชาบู ชาใจ')} <b>15%</b> {t('• สเต็ก ลุงวอ')} <b>15%</b>{' '}
              {t('• ซูชิ ปิ๊แมว')} <b>10%</b> {t('• ส้มตำ ระยำใจ')} <b>10%</b>{' '}
              {t('• IRON GRILL ริวจิตสัมผัส')} <b>5%</b>
            </div>
          </section>
        </div>

        {/* ท้ายโมดอล */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-end dark:border-gray-800 dark:bg-gray-800/60">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition"
          >
            {t('รับทราบ')}
          </button>
        </div>
      </div>
    </div>
  );
}
