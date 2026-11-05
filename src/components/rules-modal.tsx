'use client';

// ============================================================
// Modal กฎกติกา & วิธีได้เหรียญ (เปิดจากปุ่ม "กฎกติกา" บนหัวเว็บ)
// ตัวเลขทุกค่าดึงจาก src/lib/players.ts กับ src/lib/gear.ts โดยตรง
// — แก้กฎเหรียญที่เดียว หน้านี้อัปเดตตามอัตโนมัติ
// ============================================================
import {
  WIN_COINS,
  LOSE_COINS,
  CRUSH_WIN_COINS,
  CRUSH_LOSER_BELOW,
  CRUSH_GAP_MIN,
} from '@/lib/players';
import { SHOP_PRICE } from '@/lib/gear';

export function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 justify-center items-center p-4 ${
        open ? 'flex' : 'hidden'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden dark:bg-gray-900">
        {/* หัวโมดอล */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 via-white to-white dark:border-gray-800 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <i className="fa-solid fa-book-open"></i>
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 leading-tight truncate">
                กฎกติกา &amp; วิธีได้เหรียญ
              </h2>
              <p className="text-xs text-gray-400">จบแมตช์ปุ๊บ ทุกคนในทีมได้เหรียญเท่ากันทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้ากฎกติกา"
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition flex items-center justify-center shrink-0"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* เนื้อหา */}
        <div className="overflow-y-auto p-5 space-y-6">
          {/* 1) วิธีได้เหรียญ */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-coins text-amber-500"></i>วิธีได้เหรียญ (รายบุคคล)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:ring-emerald-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="fa-solid fa-trophy text-emerald-600 dark:text-emerald-400"></i>
                  <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">ชนะ</span>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  +{WIN_COINS} <span className="text-xs font-bold">เหรียญ</span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  ทีมไหนชนะ ผู้เล่นทุกคนในทีมนั้นได้เหรียญเท่ากัน
                </p>
              </div>
              <div className="rounded-2xl p-4 bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:ring-amber-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="fa-solid fa-fire text-amber-600 dark:text-amber-400"></i>
                  <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">ชนะขาด</span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
                  +{CRUSH_WIN_COINS} <span className="text-xs font-bold">เหรียญ</span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  ชนะห่าง {CRUSH_GAP_MIN} แต้มขึ้นไป <b>หรือ</b> ฝ่ายแพ้ได้ต่ำกว่า {CRUSH_LOSER_BELOW} แต้ม
                  (ได้แทนชนะปกติ)
                </p>
              </div>
              <div className="rounded-2xl p-4 bg-rose-50 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:ring-rose-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="fa-solid fa-heart-crack text-rose-600 dark:text-rose-400"></i>
                  <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">แพ้</span>
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 leading-none">
                  +{LOSE_COINS} <span className="text-xs font-bold">เหรียญ</span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  แพ้ก็ยังได้เหรียญปลอบใจ ต่อคน
                </p>
              </div>
            </div>
          </section>

          {/* 2) ตัวอย่างคะแนน */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-calculator text-blue-500"></i>ตัวอย่างคะแนนจบเกม
            </h3>
            <div className="overflow-x-auto ring-1 ring-gray-200 rounded-2xl dark:ring-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold dark:bg-gray-800/80 dark:text-gray-400">
                  <tr>
                    <th className="p-2.5">คะแนนจบ</th>
                    <th className="p-2.5 text-center">เหรียญทีมชนะ</th>
                    <th className="p-2.5 text-center">เหรียญทีมแพ้</th>
                    <th className="p-2.5">เหตุผล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="p-2.5 font-bold text-gray-800 dark:text-gray-100">21-15</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">+{WIN_COINS}</td>
                    <td className="p-2.5 text-center font-bold text-rose-600 dark:text-rose-400">+{LOSE_COINS}</td>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400 text-xs">ชนะปกติ (ห่าง 6 แต้ม)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-gray-800 dark:text-gray-100">21-14</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">+{WIN_COINS}</td>
                    <td className="p-2.5 text-center font-bold text-rose-600 dark:text-rose-400">+{LOSE_COINS}</td>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400 text-xs">ชนะปกติ (ห่าง 7 แต้ม)</td>
                  </tr>
                  <tr className="bg-amber-50/70 dark:bg-amber-950/30">
                    <td className="p-2.5 font-bold text-gray-800 dark:text-gray-100">21-6</td>
                    <td className="p-2.5 text-center font-bold text-amber-600 dark:text-amber-400">+{CRUSH_WIN_COINS}</td>
                    <td className="p-2.5 text-center font-bold text-rose-600 dark:text-rose-400">+{LOSE_COINS}</td>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400 text-xs">
                      ชนะขาด — ชนะห่าง {CRUSH_GAP_MIN} แต้ม
                    </td>
                  </tr>
                  <tr className="bg-amber-50/70 dark:bg-amber-950/30">
                    <td className="p-2.5 font-bold text-gray-800 dark:text-gray-100">21-4</td>
                    <td className="p-2.5 text-center font-bold text-amber-600 dark:text-amber-400">+{CRUSH_WIN_COINS}</td>
                    <td className="p-2.5 text-center font-bold text-rose-600 dark:text-rose-400">+{LOSE_COINS}</td>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400 text-xs">
                      ชนะขาด — ฝ่ายแพ้ได้ต่ำกว่า {CRUSH_LOSER_BELOW} แต้ม
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-gray-800 dark:text-gray-100">30-29</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">+{WIN_COINS}</td>
                    <td className="p-2.5 text-center font-bold text-rose-600 dark:text-rose-400">+{LOSE_COINS}</td>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400 text-xs">ชนะปกติ (ดิวอลสุด ๆ ห่าง 1 แต้ม)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3) เหรียญใช้ทำอะไรได้ */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bag-shopping text-blue-500"></i>เหรียญใช้ทำอะไรได้?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-shirt mt-0.5 text-amber-500"></i>
                <span>
                  ปลดล็อคสกินไม้แบดและรองเท้าพิเศษที่ร้านค้า —{' '}
                  <b className="text-gray-800 dark:text-gray-100">{SHOP_PRICE} เหรียญ/ชิ้น</b>{' '}
                  (เปิดร้านได้ที่ปุ่มร้านค้าในหน้าผู้เล่น)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-user-group mt-0.5 text-amber-500"></i>
                <span>
                  เหรียญเป็นของ<b className="text-gray-800 dark:text-gray-100">ผู้เล่นรายบุคคล</b> แยกกันทุกคน —
                  เดี่ยว 1 คน/ทีม, คู่ 2 คน/ทีม คนในทีมได้เท่ากัน
                </span>
              </li>
            </ul>
          </section>

          {/* 4) ข้อควรรู้ */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-blue-500"></i>ข้อควรรู้
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-shield-heart mt-0.5 text-emerald-500"></i>
                <span>
                  ล้างข้อมูลสถิติ = แมตช์กับตารางอันดับหาย แต่{' '}
                  <b className="text-gray-800 dark:text-gray-100">เหรียญและสกินของผู้เล่นยังอยู่ครบ</b>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-hard-drive mt-0.5 text-emerald-500"></i>
                <span>
                  ข้อมูลทั้งหมดเก็บในเบราว์เซอร์ของเครื่องนี้ (localStorage) —{' '}
                  <b className="text-gray-800 dark:text-gray-100">ไม่มีเซิร์ฟเวอร์ ไม่มีรหัส PIN</b> ใช้ได้เลยทุกอย่าง
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-id-card mt-0.5 text-emerald-500"></i>
                <span>ลงทะเบียนผู้เล่นฟรี ใช้แค่ชื่อ — ชนะ/แพ้/ชนะขาดนับจากคะแนนจริงในแมตช์เสมอ</span>
              </li>
            </ul>
          </section>
        </div>

        {/* ท้ายโมดอล */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 hidden sm:block">
            <i className="fa-solid fa-circle-question mr-1"></i>
            สงสัยตรงไหนถามผู้ดูแลระบบได้เลย
          </p>
          <button
            onClick={onClose}
            className="ml-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-5 py-2 rounded-xl font-bold shadow-md shadow-amber-500/25 transition text-sm"
          >
            เข้าใจแล้ว ปิดหน้านี้
          </button>
        </div>
      </div>
    </div>
  );
}
