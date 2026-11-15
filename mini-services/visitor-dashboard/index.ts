/// <reference types="bun-types" />
// ============================================================
// Visitor Dashboard — mini service แยกออกจากแอป badminton
// พอร์ต 3030 • เข้าผ่าน gateway: /?XTransformPort=3030
//
// "เชื่อมต่อข้อมูลกัน" ด้วยไฟล์เดียวกัน:
//   แอป badminton (:3000) เขียน db/visitors.json ผ่าน /api/visitors
//   หน้านี้อ่านไฟล์เดียวกันมาคำนวณ/แสดงผล → ข้อมูลตรงกันเสมอ
//
// API ภายใน:
//   GET /          → หน้าแดชบอร์ด (index.html)
//   GET /api/stats → สถิติทั้งหมด + สถานะ main app / mini service / ไฟล์
// ============================================================

import fs from 'fs';
import path from 'path';

const PORT = 3030;
const ROOT = path.resolve(import.meta.dir, '../..'); // โฟลเดอร์โปรเจกต์หลัก
const DATA_FILE = path.join(ROOT, 'db', 'visitors.json');
const HTML_FILE = path.join(import.meta.dir, 'index.html');
const MAIN_APP_URL = 'http://127.0.0.1:3000/api/visitors';

const ONLINE_MS = 60_000; // ออนไลน์ = heartbeat ภายใน 60 วินาที (ต้องตรงกับฝั่ง main app)

interface VisitorRecord {
  id: string;
  firstSeen: number;
  lastSeen: number;
  visits: number;
  page: string;
  lang: string;
  screen: string;
}

interface VisitorsData {
  visitors: Record<string, VisitorRecord>;
  totalVisits: number;
  daily: Record<string, number>;
}

/** วันที่แบบเวลาไทย (Asia/Bangkok, UTC+7) — ต้องตรงกับฝั่ง main app */
function bangkokDay(ts: number): string {
  return new Date(ts + 7 * 3_600_000).toISOString().slice(0, 10);
}

function loadData(): VisitorsData {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Partial<VisitorsData>;
    return {
      visitors: parsed.visitors ?? {},
      totalVisits: typeof parsed.totalVisits === 'number' ? parsed.totalVisits : 0,
      daily: parsed.daily ?? {},
    };
  } catch {
    return { visitors: {}, totalVisits: 0, daily: {} };
  }
}

/** คำนวณสถิติจากไฟล์ที่แชร์กัน (ตรรกะเดียวกับ src/app/api/visitors/route.ts) */
function computeStats(d: VisitorsData, now: number) {
  const all = Object.values(d.visitors).sort((a, b) => b.lastSeen - a.lastSeen);
  const today = bangkokDay(now);
  return {
    online: all.filter((v) => now - v.lastSeen <= ONLINE_MS).length,
    totalVisits: d.totalVisits,
    uniqueVisitors: all.length,
    todayVisits: d.daily[today] ?? 0,
    daily: Object.entries(d.daily)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([day, count]) => ({ day, count })),
    visitors: all.slice(0, 100).map((v) => ({ ...v, online: now - v.lastSeen <= ONLINE_MS })),
  };
}

/** เช็คว่า main app (badminton :3000) รันอยู่ไหม + ขอสถานะเซิร์ฟเวอร์มาโชว์ด้วย */
async function mainAppState(): Promise<{
  up: boolean;
  error: string | null;
  server: Record<string, number | string> | null;
}> {
  try {
    const res = await fetch(MAIN_APP_URL, { signal: AbortSignal.timeout(1500), cache: 'no-store' });
    if (!res.ok) return { up: false, error: `HTTP ${res.status}`, server: null };
    const j = (await res.json()) as { server?: Record<string, number | string> };
    return { up: true, error: null, server: j.server ?? null };
  } catch (e) {
    return { up: false, error: e instanceof Error ? e.message : String(e), server: null };
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    // ---- สถิติทั้งหมดสำหรับหน้าเว็บ ----
    if (pathname === '/api/stats') {
      const now = Date.now();
      const stats = computeStats(loadData(), now);
      const mainApp = await mainAppState();
      let file = { exists: false, sizeKB: 0, ageSec: -1 };
      try {
        const st = fs.statSync(DATA_FILE);
        file = {
          exists: true,
          sizeKB: round1(st.size / 1024),
          ageSec: Math.max(0, Math.floor((now - st.mtimeMs) / 1000)),
        };
      } catch {
        // ยังไม่มีไฟล์ (ยังไม่มีคนเข้าใช้เลย)
      }
      const mem = process.memoryUsage();
      return Response.json(
        {
          ok: true,
          now,
          mainApp,
          stats,
          self: {
            uptime: process.uptime(),
            memoryMB: round1(mem.heapUsed / 1024 / 1024),
            rssMB: round1(mem.rss / 1024 / 1024),
            bunVersion: Bun.version,
            platform: `${process.platform} ${process.arch}`,
          },
          file,
        },
        { headers: { 'cache-control': 'no-store' } }
      );
    }

    // ---- หน้าแดชบอร์ด ----
    if (pathname === '/') {
      try {
        const html = fs.readFileSync(HTML_FILE, 'utf-8');
        return new Response(html, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
        });
      } catch (e) {
        return new Response(`index.html หายไป: ${e instanceof Error ? e.message : e}`, {
          status: 500,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
});

console.log(`[visitor-dashboard] รันอยู่ที่ http://localhost:${PORT} • อ่านข้อมูลจาก ${DATA_FILE}`);
