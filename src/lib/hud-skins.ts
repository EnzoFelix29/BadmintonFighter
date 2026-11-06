// ============================================================
// สกิน HUD สกอร์บอร์ดสด (5 แบบ) — ปรับลุคตารางคะแนนสดบนฟอร์มบันทึกผล
// เลือกไว้แล้วจะจำค่าใน localStorage key: badminton_hud_skin
// ============================================================

export interface HudSkin {
  id: string;
  name: string; // ชื่อสกิน (โชว์บนปุ่มเลือก)
  tag: string; // คำโปรยสั้น ๆ
  chip: string; // ลุคปุ่มเลือกสกิน (ชิปเล็ก)
  card: string; // กรอบ HUD หลัก
  nameA: string; // ชื่อทีม A
  nameB: string; // ชื่อทีม B
  score: string; // ตัวเลขคะแนน (ใช้ร่วมกันทั้งสองฝั่ง)
  scoreA?: string; // สีเฉพาะตัวเลขทีม A (ถ้าสกินนั้นแยกสี)
  scoreB?: string; // สีเฉพาะตัวเลขทีม B
  colon: string; // เครื่องหมาย :
  sub: string; // แถวป้ายข้อมูล (เกมละกี่แต้ม / เสิร์ฟก่อน)
  serve: string; // ป้าย "เสิร์ฟก่อน"
  flipBtn: string; // ปุ่มเหวี่ยงเหรียญ
  coin: string; // หน้าเหรียญ
  // ===== ธีมทั้งหน้าจอ (สกินมีผลทั้งเว็บ ไม่ใช่แค่ HUD/เหรียญ) =====
  page: string; // พื้นหลังทั้งเว็บ + สีตัวอักษรฐาน
  nav: string; // แถบเมนูด้านบน
  panel: string; // การ์ด/กล่องหลัก (ฟอร์มบันทึกผล + ตารางอันดับ)
  panelIcon: string; // ชิปไอคอนหัวการ์ด (รวม rounding ในตัว)
  heading: string; // หัวข้อการ์ด (h2)
  btn: string; // ปุ่มหลัก (บันทึกผล / สรุปภาพรวม / เซฟเป็นรูป) รวม rounding ในตัว
  modalCard: string; // กรอบโมดอล (สรุปภาพรวม/ผู้เล่น/กฎกติกา) — พื้นอ่านง่าย + ขอบตามสกิน
}

export const HUD_SKIN_KEY = 'badminton_hud_skin';

export const HUD_SKINS: HudSkin[] = [
  {
    id: 'classic',
    name: 'คลาสสิก',
    tag: 'ฟ้า-ขาว สไตล์แอป',
    chip:
      'bg-gradient-to-r from-blue-100 to-rose-100 border border-blue-300 text-blue-900 dark:from-blue-900 dark:to-rose-900 dark:text-blue-200',
    card:
      'bg-gradient-to-r from-blue-50 via-white to-rose-50 border border-blue-200 rounded-2xl shadow-sm dark:from-blue-950/60 dark:via-gray-900 dark:to-rose-950/50 dark:border-gray-700',
    nameA: 'text-blue-800 dark:text-blue-300',
    nameB: 'text-rose-800 dark:text-rose-300',
    score: 'text-gray-800 dark:text-gray-100',
    colon: 'text-gray-300 dark:text-gray-600',
    sub: 'bg-white/80 ring-1 ring-gray-200 text-gray-500 dark:bg-gray-800 dark:ring-gray-700 dark:text-gray-300',
    serve: 'bg-emerald-50 ring-1 ring-emerald-200 text-emerald-600 dark:bg-emerald-950/60 dark:ring-emerald-800 dark:text-emerald-300',
    flipBtn:
      'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white',
    coin: 'bg-gradient-to-br from-amber-300 to-yellow-500 text-white ring-2 ring-amber-200/70',
    page:
      'bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50 text-gray-800 dark:from-slate-950 dark:via-gray-950 dark:to-blue-950 dark:text-gray-100',
    nav: 'bg-gradient-to-r from-blue-800 via-blue-600 to-sky-500 text-white shadow-lg shadow-blue-900/20',
    panel:
      'bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-900 dark:ring-gray-700/60',
    panelIcon: 'rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    heading: 'text-gray-800 dark:text-gray-100',
    btn: 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white rounded-xl shadow-md shadow-blue-600/25',
    modalCard:
      'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200/70 dark:ring-gray-700/60',
  },
  {
    id: 'neon',
    name: 'นีออน',
    tag: 'ฟ้า-ชมพู เรืองแสง',
    chip: 'bg-gray-950 border border-fuchsia-500 text-fuchsia-300',
    card:
      'bg-gray-950 border-2 border-fuchsia-500/70 rounded-2xl shadow-[0_0_18px_rgba(217,70,239,0.35)]',
    nameA: 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]',
    nameB: 'text-pink-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.9)]',
    score: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]',
    colon: 'text-fuchsia-400',
    sub: 'bg-fuchsia-500/10 ring-1 ring-fuchsia-500/40 text-fuchsia-200',
    serve: 'bg-cyan-500/15 ring-1 ring-cyan-400/60 text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]',
    flipBtn:
      'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_14px_rgba(217,70,239,0.6)]',
    coin: 'bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white ring-2 ring-fuchsia-300/60',
    page:
      'bg-gray-950 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.16),transparent_55%)] text-gray-100',
    nav: 'bg-gray-950/90 backdrop-blur border-b-2 border-fuchsia-500/60 text-white shadow-[0_0_18px_rgba(217,70,239,0.35)]',
    panel: 'bg-gray-950 rounded-2xl border-2 border-fuchsia-500/70 shadow-[0_0_18px_rgba(217,70,239,0.3)]',
    panelIcon: 'rounded-xl bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/50',
    heading: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]',
    btn: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl shadow-[0_0_14px_rgba(217,70,239,0.6)]',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-fuchsia-500/80',
  },
  {
    id: 'retro',
    name: 'เรโทร 8-บิต',
    tag: 'พิกเซลเกมยุค 90',
    chip: 'bg-purple-800 border-2 border-black text-yellow-300 rounded-none',
    card:
      'bg-purple-800 border-4 border-black rounded-none shadow-[6px_6px_0_#000] font-mono',
    nameA: 'text-yellow-300',
    nameB: 'text-green-300',
    score: 'text-white',
    colon: 'text-purple-300',
    sub: 'bg-black/40 ring-2 ring-black text-yellow-100 rounded-none',
    serve: 'bg-yellow-400 ring-2 ring-black text-purple-900 rounded-none font-extrabold',
    flipBtn:
      'bg-yellow-400 hover:bg-yellow-300 text-purple-900 border-2 border-black rounded-none shadow-[3px_3px_0_#000] font-extrabold',
    coin: 'bg-yellow-400 text-purple-900 border-2 border-black rounded-none',
    page: 'bg-purple-900 text-yellow-50',
    nav: 'bg-purple-800 border-b-4 border-black text-white shadow-[0_4px_0_#000]',
    panel: 'bg-purple-800 rounded-none border-4 border-black shadow-[6px_6px_0_#000] text-yellow-50',
    panelIcon: 'rounded-none bg-yellow-400 text-purple-900 border-2 border-black',
    heading: 'text-yellow-300',
    btn: 'bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-none border-2 border-black shadow-[3px_3px_0_#000] font-extrabold',
    modalCard: 'bg-white dark:bg-gray-900 rounded-none shadow-[8px_8px_0_#000] border-4 border-black',
  },
  {
    id: 'gold',
    name: 'ทองหรู',
    tag: 'ทองเงา สไตล์แชมป์',
    chip: 'bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500 text-amber-900',
    card:
      'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 border border-amber-400 rounded-2xl shadow-md dark:from-amber-900 dark:via-amber-950 dark:to-yellow-950 dark:border-amber-700',
    nameA: 'text-amber-900 dark:text-amber-200',
    nameB: 'text-orange-900 dark:text-orange-300',
    score: 'text-amber-900 dark:text-yellow-100',
    colon: 'text-amber-500 dark:text-amber-600',
    sub: 'bg-white/60 ring-1 ring-amber-300 text-amber-800 dark:bg-amber-950/60 dark:ring-amber-700 dark:text-amber-200',
    serve: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm ring-1 ring-amber-500/50',
    flipBtn:
      'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white',
    coin: 'bg-gradient-to-br from-yellow-200 to-amber-600 text-amber-900 ring-2 ring-yellow-300/80',
    page:
      'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-amber-950 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-900 dark:text-amber-50',
    nav: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white shadow-lg shadow-amber-900/30',
    panel:
      'bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl shadow-md ring-1 ring-amber-300/70 dark:from-amber-950 dark:to-yellow-950 dark:ring-amber-800',
    panelIcon: 'rounded-xl bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    heading: 'text-amber-900 dark:text-amber-100',
    btn: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl shadow-md shadow-amber-600/30',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-2 ring-amber-400/70',
  },
  {
    id: 'mono',
    name: 'มินิมอล',
    tag: 'ขาวดำ สะอาดตา',
    chip: 'bg-white border border-gray-400 text-gray-800 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200',
    card:
      'bg-white border border-gray-300 rounded-xl dark:bg-gray-900 dark:border-gray-700',
    nameA: 'text-gray-800 dark:text-gray-200',
    nameB: 'text-gray-800 dark:text-gray-200',
    score: 'text-gray-900 dark:text-gray-100',
    colon: 'text-gray-400',
    sub: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    serve: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
    flipBtn:
      'bg-gray-900 hover:bg-gray-700 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900',
    coin: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 ring-2 ring-gray-300 dark:ring-gray-600',
    page: 'bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100',
    nav: 'bg-gray-900 text-white shadow-md dark:bg-gray-950 dark:border-b dark:border-gray-800',
    panel: 'bg-white rounded-xl border border-gray-300 dark:bg-gray-900 dark:border-gray-700',
    panelIcon: 'rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900',
    heading: 'text-gray-900 dark:text-gray-100',
    btn: 'bg-gray-900 hover:bg-gray-700 text-white rounded-xl dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900',
    modalCard: 'bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-900 dark:border-gray-600',
  },
];

// หาสกินจาก id (ถ้าไม่เจอคืนสกินแรก)
export function getHudSkin(id: string | null | undefined): HudSkin {
  return HUD_SKINS.find((s) => s.id === id) ?? HUD_SKINS[0];
}
