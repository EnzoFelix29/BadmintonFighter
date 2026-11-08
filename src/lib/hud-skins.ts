// ============================================================
// สกิน HUD สกอร์บอร์ดสด (11 แบบ) — ปรับลุคตารางคะแนนสดบนฟอร์มบันทึกผล
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
  {
    id: 'forest',
    name: 'ป่าเขียว',
    tag: 'เขียวธรรมชาติ สดชื่น',
    chip: 'bg-emerald-100 border border-emerald-400 text-emerald-900 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200',
    card:
      'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-300 rounded-2xl shadow-sm dark:from-emerald-950/60 dark:via-teal-950/50 dark:to-green-950/60 dark:border-emerald-800',
    nameA: 'text-emerald-800 dark:text-emerald-300',
    nameB: 'text-teal-800 dark:text-teal-300',
    score: 'text-emerald-950 dark:text-emerald-50',
    colon: 'text-emerald-300 dark:text-emerald-700',
    sub: 'bg-white/80 ring-1 ring-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:ring-emerald-800 dark:text-emerald-200',
    serve: 'bg-emerald-500 ring-1 ring-emerald-600/40 text-white shadow-sm',
    flipBtn:
      'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white',
    coin: 'bg-gradient-to-br from-lime-300 to-emerald-500 text-white ring-2 ring-emerald-200/70',
    page:
      'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 text-emerald-950 dark:from-emerald-950 dark:via-teal-950 dark:to-green-950 dark:text-emerald-50',
    nav: 'bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/20',
    panel:
      'bg-white rounded-2xl shadow-sm ring-1 ring-emerald-200/70 dark:bg-gray-900 dark:ring-emerald-900',
    panelIcon: 'rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    heading: 'text-emerald-900 dark:text-emerald-100',
    btn: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl shadow-md shadow-emerald-600/25',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-emerald-300/70 dark:ring-emerald-800',
  },
  {
    id: 'sakura',
    name: 'ซากุระ',
    tag: 'ชมพูนุ่ม สไตล์ญี่ปุ่น',
    chip: 'bg-pink-100 border border-pink-300 text-pink-800 dark:bg-pink-950 dark:border-pink-700 dark:text-pink-200',
    card:
      'bg-gradient-to-r from-pink-50 via-rose-50 to-fuchsia-50 border border-pink-300 rounded-2xl shadow-sm dark:from-pink-950/60 dark:via-rose-950/50 dark:to-fuchsia-950/60 dark:border-pink-800',
    nameA: 'text-rose-700 dark:text-rose-300',
    nameB: 'text-fuchsia-700 dark:text-fuchsia-300',
    score: 'text-pink-950 dark:text-pink-50',
    colon: 'text-pink-300 dark:text-pink-700',
    sub: 'bg-white/80 ring-1 ring-pink-200 text-pink-700 dark:bg-pink-950 dark:ring-pink-800 dark:text-pink-200',
    serve: 'bg-rose-500 ring-1 ring-rose-600/40 text-white shadow-sm',
    flipBtn:
      'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white',
    coin: 'bg-gradient-to-br from-rose-200 to-pink-400 text-white ring-2 ring-pink-200/70',
    page:
      'bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 text-pink-950 dark:from-pink-950 dark:via-rose-950 dark:to-fuchsia-950 dark:text-pink-50',
    nav: 'bg-gradient-to-r from-pink-700 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-900/20',
    panel:
      'bg-white rounded-2xl shadow-sm ring-1 ring-pink-200/70 dark:bg-gray-900 dark:ring-pink-900',
    panelIcon: 'rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
    heading: 'text-pink-900 dark:text-pink-100',
    btn: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl shadow-md shadow-rose-500/25',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-pink-300/70 dark:ring-pink-800',
  },
  {
    id: 'ocean',
    name: 'มหาสมุทร',
    tag: 'ฟ้าคราม ลึกเย็นตา',
    chip: 'bg-cyan-100 border border-cyan-400 text-cyan-900 dark:bg-cyan-950 dark:border-cyan-700 dark:text-cyan-200',
    card:
      'bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-300 rounded-2xl shadow-sm dark:from-cyan-950/60 dark:via-sky-950/50 dark:to-blue-950/60 dark:border-cyan-800',
    nameA: 'text-cyan-800 dark:text-cyan-300',
    nameB: 'text-blue-800 dark:text-blue-300',
    score: 'text-cyan-950 dark:text-cyan-50',
    colon: 'text-cyan-300 dark:text-cyan-700',
    sub: 'bg-white/80 ring-1 ring-cyan-200 text-cyan-800 dark:bg-cyan-950 dark:ring-cyan-800 dark:text-cyan-200',
    serve: 'bg-cyan-500 ring-1 ring-cyan-600/40 text-white shadow-sm',
    flipBtn:
      'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white',
    coin: 'bg-gradient-to-br from-cyan-300 to-blue-500 text-white ring-2 ring-cyan-200/70',
    page:
      'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 text-cyan-950 dark:from-cyan-950 dark:via-sky-950 dark:to-blue-950 dark:text-cyan-50',
    nav: 'bg-gradient-to-r from-cyan-800 via-sky-600 to-blue-600 text-white shadow-lg shadow-cyan-900/20',
    panel:
      'bg-white rounded-2xl shadow-sm ring-1 ring-cyan-200/70 dark:bg-gray-900 dark:ring-cyan-900',
    panelIcon: 'rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    heading: 'text-cyan-900 dark:text-cyan-100',
    btn: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl shadow-md shadow-cyan-600/25',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-cyan-300/70 dark:ring-cyan-800',
  },
  {
    id: 'lava',
    name: 'ลาวา',
    tag: 'แดงเพลิง บนพื้นดำ',
    chip: 'bg-gray-950 border border-orange-500 text-orange-300',
    card:
      'bg-gray-950 border-2 border-orange-500/70 rounded-2xl shadow-[0_0_18px_rgba(249,115,22,0.35)]',
    nameA: 'text-orange-300 drop-shadow-[0_0_6px_rgba(251,146,60,0.9)]',
    nameB: 'text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.9)]',
    score: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]',
    colon: 'text-orange-500',
    sub: 'bg-orange-500/10 ring-1 ring-orange-500/40 text-orange-200',
    serve: 'bg-orange-500 ring-1 ring-orange-400/60 text-white drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]',
    flipBtn:
      'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_14px_rgba(249,115,22,0.6)]',
    coin: 'bg-gradient-to-br from-orange-400 to-red-600 text-white ring-2 ring-orange-300/60',
    page:
      'bg-gray-950 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_55%)] text-gray-100',
    nav: 'bg-gray-950/90 backdrop-blur border-b-2 border-orange-500/60 text-white shadow-[0_0_18px_rgba(249,115,22,0.35)]',
    panel: 'bg-gray-950 rounded-2xl border-2 border-orange-500/70 shadow-[0_0_18px_rgba(249,115,22,0.3)]',
    panelIcon: 'rounded-xl bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/50',
    heading: 'text-orange-100 drop-shadow-[0_0_8px_rgba(251,146,60,0.45)]',
    btn: 'bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-[0_0_14px_rgba(249,115,22,0.6)]',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-orange-500/80',
  },
  {
    id: 'galaxy',
    name: 'กาแล็กซี',
    tag: 'ม่วงอวกาศ ดาวระยิบ',
    chip: 'bg-indigo-950 border border-violet-400 text-violet-300',
    card:
      'bg-indigo-950 border-2 border-violet-500/60 rounded-2xl shadow-[0_0_18px_rgba(139,92,246,0.35)] bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.18),transparent_45%)]',
    nameA: 'text-violet-300 drop-shadow-[0_0_6px_rgba(196,181,253,0.9)]',
    nameB: 'text-sky-300 drop-shadow-[0_0_6px_rgba(125,211,252,0.9)]',
    score: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]',
    colon: 'text-violet-400',
    sub: 'bg-violet-500/10 ring-1 ring-violet-500/40 text-violet-200',
    serve: 'bg-violet-500 ring-1 ring-violet-400/60 text-white drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]',
    flipBtn:
      'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_14px_rgba(139,92,246,0.6)]',
    coin: 'bg-gradient-to-br from-violet-400 to-indigo-600 text-white ring-2 ring-violet-300/60',
    page:
      'bg-indigo-950 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.22),transparent_55%)] text-indigo-50',
    nav: 'bg-indigo-950/90 backdrop-blur border-b-2 border-violet-500/60 text-white shadow-[0_0_18px_rgba(139,92,246,0.35)]',
    panel: 'bg-indigo-950 rounded-2xl border-2 border-violet-500/60 shadow-[0_0_18px_rgba(139,92,246,0.3)]',
    panelIcon: 'rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/50',
    heading: 'text-white drop-shadow-[0_0_8px_rgba(221,214,254,0.45)]',
    btn: 'bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-[0_0_14px_rgba(139,92,246,0.6)]',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-violet-500/70',
  },
  {
    id: 'candy',
    name: 'ลูกกวาด',
    tag: 'พาสเทลสายรุ้ง สดใส',
    chip: 'bg-gradient-to-r from-pink-200 via-yellow-100 to-sky-200 border border-pink-300 text-pink-900',
    card:
      'bg-gradient-to-r from-pink-50 via-yellow-50 to-sky-50 border-2 border-pink-300 rounded-2xl shadow-sm dark:from-pink-950/50 dark:via-yellow-950/40 dark:to-sky-950/50 dark:border-pink-700',
    nameA: 'text-pink-600 dark:text-pink-300',
    nameB: 'text-sky-600 dark:text-sky-300',
    score: 'text-gray-800 dark:text-gray-100',
    colon: 'text-yellow-500 dark:text-yellow-600',
    sub: 'bg-white/80 ring-1 ring-pink-200 text-pink-700 dark:bg-pink-950 dark:ring-pink-800 dark:text-pink-200',
    serve: 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm',
    flipBtn:
      'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 hover:from-pink-600 hover:via-fuchsia-600 hover:to-sky-600 text-white',
    coin: 'bg-gradient-to-br from-yellow-200 to-pink-400 text-white ring-2 ring-pink-200/70',
    page:
      'bg-gradient-to-br from-pink-50 via-yellow-50 to-sky-50 text-gray-800 dark:from-pink-950 dark:via-yellow-950 dark:to-sky-950 dark:text-gray-100',
    nav: 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 text-white shadow-lg shadow-pink-900/20',
    panel:
      'bg-white/90 rounded-2xl shadow-sm ring-2 ring-pink-200/70 dark:bg-gray-900 dark:ring-pink-800',
    panelIcon: 'rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
    heading: 'text-gray-800 dark:text-gray-100',
    btn: 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-sky-500 hover:from-pink-600 hover:via-fuchsia-600 hover:to-sky-600 text-white rounded-xl shadow-md shadow-pink-500/25',
    modalCard: 'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-2 ring-pink-300/70 dark:ring-pink-700',
  },
];

// หาสกินจาก id (ถ้าไม่เจอคืนสกินแรก)
export function getHudSkin(id: string | null | undefined): HudSkin {
  return HUD_SKINS.find((s) => s.id === id) ?? HUD_SKINS[0];
}
