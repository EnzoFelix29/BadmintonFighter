// ============================================================
// API นับผู้เข้าใช้งานเว็บ — /api/visitors
// - POST  : heartbeat จากหน้าเว็บ (ทุก 20 วินาที) → บันทึกการเข้าใช้
// - GET   : ดึงสถิติทั้งหมด (ออนไลน์/ยอดเข้าชม/รายวัน/รายชื่อ/สถานะเซิร์ฟเวอร์)
// เก็บข้อมูล 2 ชั้น:
//   1) แรม (globalThis) — รอดตลอดช่วง instance มีชีวิต ใช้ได้แม้บน Vercel
//   2) ไฟล์ db/visitors.json — ถ้าเขียนได้ (เครื่อง/sandbox) ข้อมูลอยู่รอดแม้รีสตาร์ท
//      บน Vercel serverless เขียนไฟล์ไม่ได้ → อยู่แค่ในแรม รีสตาร์ท instance = รีเซ็ต
// นิยาม:
//   "ออนไลน์"      = ส่ง heartbeat มาภายใน 60 วินาทีล่าสุด
//   "เข้าชม 1 ครั้ง" = เปิดเซสชันใหม่ (ห่างหาย > 30 นาที หรือมาครั้งแรก)
// ============================================================

import fs from 'fs';
import path from 'path';
import { bootVisitorDashboard } from '@/lib/dashboard-boot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'db');
const DATA_FILE = path.join(DATA_DIR, 'visitors.json');

const ONLINE_MS = 60_000;          // เกณฑ์ "ออนไลน์อยู่" = heartbeat ภายใน 60 วิ
const SESSION_MS = 30 * 60_000;    // เว้นช่วงมากกว่านี้ = เริ่มนับเข้าชมครั้งใหม่
const MAX_VISITORS = 300;          // เก็บรายชื่อได้สูงสุด (ตัดตัวเก่าทิ้ง)
const MAX_DAYS = 90;               // เก็บสถิติรายวันล่าสุด 90 วัน

interface VisitorRecord {
  id: string;
  firstSeen: number;
  lastSeen: number;
  visits: number; // จำนวนครั้งที่เข้าใช้ (นับเซสชัน)
  page: string;
  lang: string;
  screen: string;
}

interface VisitorsData {
  visitors: Record<string, VisitorRecord>;
  totalVisits: number;
  daily: Record<string, number>;
}

/** วันที่แบบเวลาไทย (Asia/Bangkok, UTC+7) เช่น "2026-11-15" */
function bangkokDay(ts: number): string {
  return new Date(ts + 7 * 3_600_000).toISOString().slice(0, 10);
}

function emptyData(): VisitorsData {
  return { visitors: {}, totalVisits: 0, daily: {} };
}

// แคชในหน่วยความจำระดับโปรเซส — สำคัญมากบน Vercel serverless เพราะเขียนไฟล์ไม่ได้
// (ไฟล์จะโดนลบ/แก้ไม่ได้) ข้อมูลจึงต้องอยู่ในแรม รอดตลอดช่วง instance อุ่นเครื่อง
const g = globalThis as unknown as { __visitorsMem?: VisitorsData };
let memLoaded = false;

function loadData(): VisitorsData {
  if (memLoaded && g.__visitorsMem) return g.__visitorsMem;
  let d = emptyData();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<VisitorsData>;
    d = {
      visitors: parsed.visitors ?? {},
      totalVisits: typeof parsed.totalVisits === 'number' ? parsed.totalVisits : 0,
      daily: parsed.daily ?? {},
    };
  } catch {
    // ไม่มีไฟล์/อ่านไม่ได้ (Vercel) — เริ่มว่าง ใช้แรมแทน
  }
  g.__visitorsMem = d;
  memLoaded = true;
  return d;
}

function saveData(d: VisitorsData): void {
  // บันทึกลงแรมก่อนเสมอ — ทำให้ serverless (Vercel) นับสถิติได้จริงขณะ instance ยังรัน
  g.__visitorsMem = d;
  memLoaded = true;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 1));
  } catch {
    // เขียนไฟล์ไม่ได้ (Vercel serverless) — มีแรมพอแล้ว ข้าม
  }
}

/** ตัดข้อมูลเก่าทิ้ง กันไฟล์โตไม่จำกัด */
function prune(d: VisitorsData): void {
  const ids = Object.keys(d.visitors);
  if (ids.length > MAX_VISITORS) {
    ids
      .sort((a, b) => d.visitors[a].lastSeen - d.visitors[b].lastSeen)
      .slice(0, ids.length - MAX_VISITORS)
      .forEach((id) => delete d.visitors[id]);
  }
  const days = Object.keys(d.daily);
  if (days.length > MAX_DAYS) {
    days.sort().slice(0, days.length - MAX_DAYS).forEach((day) => delete d.daily[day]);
  }
}

function computeStats(d: VisitorsData, now: number) {
  const all = Object.values(d.visitors).sort((a, b) => b.lastSeen - a.lastSeen);
  const online = all.filter((v) => now - v.lastSeen <= ONLINE_MS).length;
  const today = bangkokDay(now);
  const todayVisits = d.daily[today] ?? 0;
  const daily = Object.entries(d.daily)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-14)
    .map(([day, count]) => ({ day, count }));
  return {
    online,
    totalVisits: d.totalVisits,
    uniqueVisitors: all.length,
    todayVisits,
    daily,
    visitors: all.slice(0, 50).map((v) => ({ ...v, online: now - v.lastSeen <= ONLINE_MS })),
  };
}

// ---------- POST : heartbeat จากเว็บ ----------
export async function POST(request: Request) {
  // บูตแดชบอร์ด developer (:3030) แบบขี้เกียจ — ถ้ายังไม่รันครั้งแรกที่มี visitor เข้า
  void bootVisitorDashboard();
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // body ไม่ใช่ JSON ก็ถือว่าว่าง
  }
  const rawId = typeof body.visitorId === 'string' ? body.visitorId.trim() : '';
  if (!rawId) {
    return Response.json({ ok: false, error: 'visitorId required' }, { status: 400 });
  }
  const visitorId = rawId.slice(0, 64);
  const page = typeof body.page === 'string' ? body.page.slice(0, 120) : '/';
  const lang = body.lang === 'en' ? 'en' : 'th';
  const screen = typeof body.screen === 'string' ? body.screen.slice(0, 20) : '';

  const d = loadData();
  const now = Date.now();
  const prev = d.visitors[visitorId];
  const newSession = !prev || now - prev.lastSeen > SESSION_MS;

  if (!prev) {
    d.visitors[visitorId] = { id: visitorId, firstSeen: now, lastSeen: now, visits: 1, page, lang, screen };
  } else {
    prev.lastSeen = now;
    prev.page = page;
    prev.lang = lang;
    if (screen) prev.screen = screen;
    if (newSession) prev.visits += 1;
  }

  if (newSession) {
    d.totalVisits += 1;
    const day = bangkokDay(now);
    d.daily[day] = (d.daily[day] ?? 0) + 1;
  }
  prune(d);
  saveData(d);

  const stats = computeStats(d, now);
  return Response.json({ ok: true, online: stats.online, totalVisits: stats.totalVisits });
}

// ---------- GET : สถิติทั้งหมดสำหรับหน้าแสดงผล ----------
export async function GET() {
  // บูตแดชบอร์ด (:3030) ด้วยถ้ายังไม่รัน (กันกรณีไม่มี heartbeat เลย)
  void bootVisitorDashboard();
  const d = loadData();
  const now = Date.now();
  const mem = process.memoryUsage();
  const stats = computeStats(d, now);
  return Response.json({
    ok: true,
    ...stats,
    server: {
      now,
      uptime: process.uptime(),
      memoryMB: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      rssMB: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      nodeVersion: process.version,
      platform: `${process.platform} ${process.arch}`,
    },
  });
}
