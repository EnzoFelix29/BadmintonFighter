'use client';

// ============================================================
// Visitor Dashboard — หน้า developer ดูสถิติผู้เข้าใช้งาน
// อยู่ในแอปหลักเป็น route /visitors → deploy ขึ้น Vercel ได้เลย
// อ่านข้อมูลจาก GET /api/visitors (เหมือนเดิม แค่ไม่ต้องรัน :3030)
// อัปเดตอัตโนมัติทุก 5 วินาที + กดปุ่มรีเฟรชเองได้
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface VisitorRow {
  id: string;
  firstSeen: number;
  lastSeen: number;
  visits: number;
  page: string;
  lang: string;
  screen: string;
  online: boolean;
}

interface DayCount {
  day: string;
  count: number;
}

interface ApiResp {
  ok: boolean;
  online: number;
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  daily: DayCount[];
  visitors: VisitorRow[];
  server: {
    now: number;
    uptime: number;
    memoryMB: number;
    rssMB: number;
    nodeVersion: string;
    platform: string;
  };
}

const CSS = `
  :root { --bg:#f6f8fa; --card:#fff; --border:#e5e7eb; --text:#1f2937; --muted:#6b7280; --faint:#9ca3af;
    --ok:#059669; --ok-bg:#ecfdf5; --ok-border:#a7f3d0; --down:#dc2626; --down-bg:#fef2f2; --down-border:#fecaca;
    --amber:#d97706; --violet:#7c3aed; --sky:#0284c7; }
  .vd { background:var(--bg); color:var(--text); min-height:100vh; padding:16px;
    font-family:'Segoe UI',system-ui,-apple-system,'Noto Sans Thai',sans-serif; font-size:14px; line-height:1.5; }
  .vd *, .vd *::before, .vd *::after { box-sizing:border-box; }
  .vd-wrap { max-width:1080px; margin:0 auto; display:flex; flex-direction:column; gap:14px; }
  .vd .mono { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-variant-numeric:tabular-nums; }
  .vd .muted { color:var(--muted); font-weight:500; }
  .vd header { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px 18px;
    display:flex; flex-direction:column; gap:10px; }
  .vd .brand { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .vd .logo { font-size:30px; }
  .vd h1 { font-size:19px; font-weight:800; display:flex; align-items:center; gap:8px; margin:0; }
  .vd .sub { color:var(--muted); font-size:12px; margin:2px 0 0; }
  .vd .brandbtns { margin-left:auto; display:flex; gap:8px; }
  .vd .brandbtns a, .vd .brandbtns button { border:1px solid var(--border); background:#fff; color:var(--muted);
    height:36px; min-width:36px; padding:0 12px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer;
    display:inline-flex; align-items:center; gap:6px; text-decoration:none; transition:.15s; }
  .vd .brandbtns a:hover { color:var(--sky); border-color:var(--sky); }
  .vd .brandbtns button:hover { color:var(--ok); border-color:var(--ok); transform:rotate(20deg); }
  .vd .chips { display:flex; flex-wrap:wrap; gap:8px; }
  .vd .chip { font-size:11px; font-weight:700; padding:4px 10px; border-radius:999px; background:#f3f4f6;
    border:1px solid var(--border); color:var(--muted); display:inline-flex; align-items:center; gap:5px; }
  .vd .chip.ok { background:var(--ok-bg); border-color:var(--ok-border); color:var(--ok); }
  .vd .chip.down { background:var(--down-bg); border-color:var(--down-border); color:var(--down); }
  .vd .chip .dot2 { width:7px; height:7px; border-radius:50%; background:currentColor; }
  .vd-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:12px; }
  .vd .card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:14px 16px; }
  .vd .card .label { font-size:11px; font-weight:700; color:var(--muted); display:flex; align-items:center; gap:6px; }
  .vd .card .value { font-size:34px; font-weight:800; margin-top:4px; }
  .vd .card .hint { font-size:10px; color:var(--faint); margin-top:2px; }
  .vd .card.online { background:var(--ok-bg); border-color:var(--ok-border); }
  .vd .card.online .label, .vd .card.online .value { color:var(--ok); }
  .vd .pulse { position:relative; width:9px; height:9px; border-radius:50%; background:var(--ok); }
  .vd .pulse::after { content:''; position:absolute; inset:-4px; border-radius:50%;
    background:rgba(5,150,105,.35); animation:vdPing 1.6s ease-out infinite; }
  @keyframes vdPing { 0% { transform:scale(.5); opacity:1; } 100% { transform:scale(1.5); opacity:0; } }
  .vd .c-emerald .value { color:var(--ok); } .vd .c-amber .value { color:var(--amber); }
  .vd .c-violet .value { color:var(--violet); } .vd .c-sky .value { color:var(--sky); }
  .vd .panel { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:14px 18px 16px; }
  .vd .panel h2 { font-size:13px; font-weight:800; margin:0 0 10px; }
  .vd .chart { display:flex; align-items:flex-end; gap:4px; height:110px; padding-top:6px; }
  .vd .barCol { flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:3px; height:100%; }
  .vd .barNum { font-size:9px; font-weight:800; color:var(--ok); }
  .vd .bar { width:100%; border-radius:6px 6px 0 0; background:linear-gradient(to top,#10b981,#6ee7b7); min-height:3px; }
  .vd .bar.zero { background:#eef1f4; }
  .vd .chartLabels { display:flex; gap:4px; margin-top:5px; }
  .vd .chartLabels span { flex:1; text-align:center; font-size:8px; font-weight:700; color:var(--faint); }
  .vd .tableWrap { max-height:360px; overflow:auto; border:1px solid var(--border); border-radius:10px; }
  .vd table { width:100%; border-collapse:collapse; font-size:12px; }
  .vd thead th { position:sticky; top:0; background:#f9fafb; color:var(--muted); font-size:10px; text-transform:uppercase;
    letter-spacing:.04em; text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); white-space:nowrap; }
  .vd tbody td { padding:7px 12px; border-bottom:1px solid #f1f3f5; white-space:nowrap; }
  .vd tbody tr:last-child td { border-bottom:none; }
  .vd tbody tr.on { background:var(--ok-bg); }
  .vd .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; vertical-align:middle; }
  .vd .dot.on { background:var(--ok); } .vd .dot.off { background:#d1d5db; }
  .vd .lang { font-size:10px; font-weight:800; padding:1px 6px; border-radius:5px; }
  .vd .lang.TH { background:#fef3c7; color:#b45309; } .vd .lang.EN { background:#e0f2fe; color:#0369a1; }
  .vd .emptyRow { text-align:center; color:var(--faint); padding:26px 0; font-weight:600; }
  .vd .kv { display:flex; justify-content:space-between; gap:10px; padding:6px 0; border-bottom:1px dashed #f1f3f5; font-size:12px; }
  .vd .kv:last-child { border-bottom:none; }
  .vd .kv .k { color:var(--muted); font-weight:600; }
  .vd .kv .v { font-weight:700; text-align:right; }
  .vd details.raw summary { cursor:pointer; font-size:13px; font-weight:800; list-style:none;
    display:flex; align-items:center; gap:8px; }
  .vd details.raw summary::before { content:'\\25B8'; transition:.15s; color:var(--faint); }
  .vd details.raw[open] summary::before { transform:rotate(90deg); }
  .vd details.raw summary button { margin-left:auto; border:1px solid var(--border); background:#fff; color:var(--muted);
    font-size:11px; font-weight:700; padding:4px 12px; border-radius:8px; cursor:pointer; }
  .vd details.raw summary button:hover { color:var(--ok); border-color:var(--ok); }
  .vd pre.rawJson { margin-top:10px; background:#0f172a; color:#a5f3fc; border-radius:10px; padding:14px; font-size:11px;
    max-height:340px; overflow:auto; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
  .vd .err { background:var(--down-bg); border:1px solid var(--down-border); color:var(--down); border-radius:12px;
    padding:10px 14px; font-size:12px; font-weight:700; }
  .vd footer { text-align:center; color:var(--faint); font-size:11px; padding:6px 0 10px; }
  .vd footer .mono { font-size:10px; }
  @media (max-width:560px) {
    .vd { padding:10px; }
    .vd-cards { grid-template-columns:1fr 1fr; }
    .vd .card .value { font-size:26px; }
    .vd .tableWrap { max-height:300px; }
    .vd tbody td, .vd thead th { padding:6px 8px; }
  }
`;

function relTime(ts: number): string {
  const d = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (d < 10) return 'เมื่อสักครู่';
  if (d < 60) return `${d} วิที่แล้ว`;
  if (d < 3600) return `${Math.floor(d / 60)} นาทีที่แล้ว`;
  if (d < 86400) return `${Math.floor(d / 3600)} ชม.ที่แล้ว`;
  return `${Math.floor(d / 86400)} วันที่แล้ว`;
}

function upTime(sec: number): string {
  const s = Math.floor(sec);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (d > 0) return `${d} ว ${h} ชม`;
  if (h > 0) return `${h} ชม ${m} น`;
  if (m > 0) return `${m} น ${r} วิ`;
  return `${r} วิ`;
}

export default function VisitorsPage() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [err, setErr] = useState('');
  const [ms, setMs] = useState(0);
  const [updated, setUpdated] = useState('');
  const [copied, setCopied] = useState(false);
  const dataRef = useRef<ApiResp | null>(null);

  const load = useCallback(async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/visitors', { cache: 'no-store' });
      const j = (await res.json()) as ApiResp;
      if (!j.ok) throw new Error('bad response');
      dataRef.current = j;
      setData(j);
      setErr('');
      setMs(Math.round(performance.now() - t0));
      setUpdated(new Date().toLocaleTimeString('th-TH', { hour12: false }));
    } catch {
      setErr('เชื่อมต่อ /api/visitors ไม่สำเร็จ — จะลองใหม่ใน 5 วินาทีเอง');
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [load]);

  const s = data;
  const days = Array.from({ length: 14 }, (_, i) =>
    new Date(Date.now() + 7 * 3600000 - (13 - i) * 86400000).toISOString().slice(0, 10));
  const counts = days.map((d) => s?.daily.find((e) => e.day === d)?.count ?? 0);
  const max = Math.max(1, ...counts);

  const copyJson = () => {
    if (!dataRef.current) return;
    const text = JSON.stringify(dataRef.current, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(() => { /* เงียบ ๆ */ });
    }
  };

  return (
    <div className="vd">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="vd-wrap">

        <header>
          <div className="brand">
            <span className="logo" aria-hidden="true">🛰️</span>
            <div>
              <h1>
                Visitor Dashboard
                <span className="chip" style={{ background: '#fce7f3', borderColor: '#fbcfe8', color: '#be185d' }}>dev</span>
              </h1>
              <p className="sub">
                แดชบอร์ดสำหรับ developer — สถิติผู้ใช้งานเว็บนับแต้ม (ในแอปหลัก ไม่ต้องรันเซิร์ฟเวอร์แยก)
              </p>
            </div>
            <div className="brandbtns">
              <Link href="/" aria-label="กลับหน้าหลัก">← นับแต้ม</Link>
              <button type="button" onClick={load} title="รีเฟรชเดี๋ยวนี้" aria-label="รีเฟรช">⟳</button>
            </div>
          </div>
          <div className="chips">
            <span className={`chip ${s ? 'ok' : 'down'}`}>
              <span className="dot2" />API {s ? 'UP' : 'กำลังโหลด…'}
            </span>
            {s && (
              <>
                <span className="chip">
                  ⟳ อัปเดต {updated} • {ms} ms
                </span>
                <span className="chip">⏱ รันมาแล้ว {upTime(s.server.uptime)}</span>
              </>
            )}
          </div>
        </header>

        {err && <div className="err">⚠ {err}</div>}

        <section className="vd-cards">
          <div className="card online">
            <div className="label"><span className="pulse" />ออนไลน์ตอนนี้</div>
            <div className="value mono">{s?.online ?? '–'}</div>
            <div className="hint">heartbeat ภายใน 60 วิ</div>
          </div>
          <div className="card c-emerald">
            <div className="label">👁 ยอดเข้าชมทั้งหมด</div>
            <div className="value mono">{(s?.totalVisits ?? 0).toLocaleString()}</div>
            <div className="hint">นับเป็นเซสชัน (เว้น &gt;30 นาที = ครั้งใหม่)</div>
          </div>
          <div className="card c-violet">
            <div className="label">🧑‍🤝‍🧑 ผู้เข้าชมไม่ซ้ำ</div>
            <div className="value mono">{(s?.uniqueVisitors ?? 0).toLocaleString()}</div>
            <div className="hint">นับจากรหัสผู้ใช้ใน localStorage</div>
          </div>
          <div className="card c-amber">
            <div className="label">📅 เข้าชมวันนี้</div>
            <div className="value mono">{(s?.todayVisits ?? 0).toLocaleString()}</div>
            <div className="hint">นับเที่ยงคืนเวลาไทย (UTC+7)</div>
          </div>
        </section>

        <section className="panel">
          <h2>📊 ยอดเข้าชมรายวัน <span className="muted">(14 วันล่าสุด • เขตเวลาไทย)</span></h2>
          <div className="chart">
            {days.map((d, i) => {
              const c = counts[i];
              return (
                <div className="barCol" key={d} title={`${d} • ${c} ครั้ง`}>
                  {c > 0 && <span className="barNum">{c}</span>}
                  <div className={`bar${c > 0 ? '' : ' zero'}`}
                    style={{ height: `${c > 0 ? Math.max(Math.round((c / max) * 100), 6) : 4}%` }} />
                </div>
              );
            })}
          </div>
          <div className="chartLabels">
            {days.map((d) => <span key={d}>{d.slice(8)}</span>)}
          </div>
        </section>

        <section className="panel">
          <h2>👥 รายชื่อผู้เข้าใช้ <span className="muted">({s?.visitors.length ?? 0} คนล่าสุด • เรียงจากใช้ล่าสุด)</span></h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>รหัสผู้ใช้</th><th>สถานะ</th><th>ภาษา</th><th>เข้าชม</th>
                  <th>หน้าจอ</th><th>ใช้ล่าสุด</th><th>เริ่มใช้ครั้งแรก</th>
                </tr>
              </thead>
              <tbody>
                {!s || s.visitors.length === 0 ? (
                  <tr><td colSpan={7} className="emptyRow">
                    ยังไม่มีผู้เข้าใช้ — เปิดเว็บนับแต้มในอีกแท็บเพื่อเริ่มนับ
                  </td></tr>
                ) : (
                  s.visitors.map((v) => (
                    <tr className={v.online ? 'on' : ''} key={v.id}>
                      <td className="mono">{v.id}</td>
                      <td><span className={`dot ${v.online ? 'on' : 'off'}`} />{v.online ? 'ออนไลน์' : 'ออฟไลน์'}</td>
                      <td><span className={`lang ${v.lang.toUpperCase()}`}>{v.lang.toUpperCase()}</span></td>
                      <td className="mono">{v.visits}</td>
                      <td className="mono">{v.screen || '–'}</td>
                      <td>{relTime(v.lastSeen)}</td>
                      <td>{relTime(v.firstSeen)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>🖥 เซิร์ฟเวอร์ (ฝั่ง API)</h2>
          {s ? (
            <div>
              <div className="kv"><span className="k">รันมาแล้ว</span><span className="v mono">{upTime(s.server.uptime)}</span></div>
              <div className="kv"><span className="k">หน่วยความจำ (heap / rss)</span>
                <span className="v mono">{s.server.memoryMB} / {s.server.rssMB} MB</span></div>
              <div className="kv"><span className="k">Node</span><span className="v mono">{s.server.nodeVersion}</span></div>
              <div className="kv"><span className="k">แพลตฟอร์ม</span><span className="v mono">{s.server.platform}</span></div>
            </div>
          ) : (
            <p className="muted">กำลังโหลด…</p>
          )}
        </section>

        <details className="panel raw">
          <summary>
            🧾 Raw JSON
            <button type="button" onClick={copyJson}>{copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก'}</button>
          </summary>
          <pre className="rawJson">{data ? JSON.stringify(data, null, 2) : '—'}</pre>
        </details>

        <footer>
          Visitor Dashboard • route /visitors (ในแอปหลัก) • เข้าถึงได้ทั้ง localhost และ Vercel<br />
          <span className="muted">
            หน้าเว็บส่ง heartbeat ทุก 20 วิ → /api/visitors → หน้านี้อ่านแสดงผล อัปเดตทุก 5 วิ
            (บน Vercel serverless เก็บข้อมูลในหน่วยความจำ — รีสตาร์ท instance เมื่อไรสถิติรีเซ็ต)
          </span>
        </footer>
      </div>
    </div>
  );
}
