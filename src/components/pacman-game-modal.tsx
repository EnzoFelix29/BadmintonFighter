'use client';

import { useLang } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import type { HudSkin } from '@/lib/hud-skins';

type SoundFn = (kind: 'success' | 'error' | 'open' | 'clear' | 'select' | 'tick') => void;

// ============================================================
// มินิเกม แพคแมน (Pac-Man) — 8-bit เก็บจุดในเขาวงจร หลบผี 3 ตัว
// ลูกศร / WASD / ปัดจอ / ปุ่มทิศทาง = เคลื่อนที่
// จุดพลัง (วงใหญ่) = ผีกลายเป็นสีฟ้า กินผีได้คะแนน 200→1600
// เก็บจุดครบทุกจุด = ผ่านด่าน (ผีเร็วขึ้น เวลาจับผีสั้นลง) • โดนผี = เสียชีวิต (3 ชีวิต)
// สถิติสูงสุดเก็บใน localStorage: badminton_pacman_best
// วาดบน canvas 2D เขาวงจรตายตัว 19x15 ช่อง (ช่องละ 16px = 304x240)
// ============================================================

const PAC_BEST_KEY = 'badminton_pacman_best';

// ===== เขาวงจร (ตรวจสอบแล้ว: จุดทุกจุดเอื้อมถึง ผีออกจากบ้านได้ครบ ไม่มีทางตัน) =====
// '#' = กำแพง • '.' = จุด • 'o' = จุดพลัง • '-' = ประตูบ้านผี (ผีเท่านั้น) • ' ' = ในบ้านผี (ผีเท่านั้น)
const MAZE: string[] = [
  '###################',
  '#o.......#.......o#',
  '#.##.###.#.###.##.#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#.......#....#',
  '####.####-####.####',
  '#.......#-#.......#',
  '#.##.##.# #.##.##.#',
  '#.......###.......#',
  '#.##.#.#####.#.##.#',
  '#......#...#......#',
  '#.##.###.#.###.##.#',
  '#o...............o#',
  '###################',
];
const COLS = 19;
const ROWS = 15;
const TILE = 16;
const W = COLS * TILE; // 304
const H = ROWS * TILE; // 240

interface Dir {
  dx: number;
  dy: number;
}
const DIR_UP: Dir = { dx: 0, dy: -1 };
const DIR_DOWN: Dir = { dx: 0, dy: 1 };
const DIR_LEFT: Dir = { dx: -1, dy: 0 };
const DIR_RIGHT: Dir = { dx: 1, dy: 0 };
const ALL_DIRS: Dir[] = [DIR_UP, DIR_LEFT, DIR_DOWN, DIR_RIGHT];

const PAC_START = { tx: 9, ty: 11 };
const HOUSE_CELL = { tx: 9, ty: 8 };
const DOOR_OUT = { tx: 9, ty: 6 };

type Phase = 'idle' | 'playing' | 'dying' | 'levelup' | 'over';

interface Actor {
  tx: number;
  ty: number;
  prog: number; // ความคืบหน้า 0..1 จาก tile ไป tile+dir
  dir: Dir;
  want: Dir; // ทิศที่คิวไว้ (แพคแมน)
  speed: number; // ช่อง/วินาที (ใช้จริงในเฟรมนี้)
}

interface Ghost extends Actor {
  mode: 'house' | 'normal' | 'fright' | 'eyes';
  houseT: number; // เวลารอก่อนออกจากบ้าน
  baseSpeed: number;
  color: string;
  offset: number; // เป้าหมายเบี่ยงจากแพคแมน (พฤติกรรมต่างกันแต่ละตัว)
}

interface Game {
  pac: Actor;
  ghosts: Ghost[];
  pellets: Set<string>;
  power: Set<string>;
  score: number;
  lives: number;
  level: number;
  frightT: number;
  frightCombo: number;
  animT: number;
  deathT: number;
  levelT: number;
  eatSndT: number;
  frightBlink: boolean;
  chasing: boolean; // โหมดไล่ (false = scatter แยกย้ายไปมุมของตัวเอง — กันผีวนลูป)
  modeT: number; // เวลาจึงสลับโหมด chase/scatter
}

function mazeCell(tx: number, ty: number): string {
  if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return '#';
  return MAZE[ty][tx];
}

function pacCanWalk(tx: number, ty: number): boolean {
  const c = mazeCell(tx, ty);
  return c === '.' || c === 'o';
}

function ghostCanWalk(tx: number, ty: number, allowDoor: boolean): boolean {
  const c = mazeCell(tx, ty);
  if (c === '#') return false;
  if (c === '-' || c === ' ') return allowDoor;
  return true;
}

function refillDots(g: Game) {
  g.pellets.clear();
  g.power.clear();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = MAZE[y][x];
      if (c === '.') g.pellets.add(`${x},${y}`);
      else if (c === 'o') g.power.add(`${x},${y}`);
    }
  }
}

function spawnActors(g: Game) {
  g.pac = {
    tx: PAC_START.tx,
    ty: PAC_START.ty,
    prog: 0,
    dir: DIR_LEFT,
    want: DIR_LEFT,
    speed: 5.4 + Math.min(g.level * 0.18, 0.9),
  };
  g.frightT = 0;
  g.frightCombo = 0;
  const base = 4.4 + Math.min(g.level * 0.3, 1.6);
  const colors = ['#ff3b3b', '#ffa5d8', '#00e0e0'];
  g.ghosts = colors.map((color, i) => ({
    tx: HOUSE_CELL.tx,
    ty: HOUSE_CELL.ty,
    prog: 0,
    dir: DIR_UP,
    want: DIR_UP,
    speed: base,
    mode: 'house' as const,
    houseT: 0.5 + i * 1.3,
    baseSpeed: base,
    color,
    offset: [0, 3, -3][i],
  }));
}

function freshGame(): Game {
  const g: Game = {
    pac: { tx: PAC_START.tx, ty: PAC_START.ty, prog: 0, dir: DIR_LEFT, want: DIR_LEFT, speed: 5.4 },
    ghosts: [],
    pellets: new Set(),
    power: new Set(),
    score: 0,
    lives: 3,
    level: 1,
    frightT: 0,
    frightCombo: 0,
    animT: 0,
    deathT: 0,
    levelT: 0,
    eatSndT: 0,
    frightBlink: false,
    chasing: true,
    modeT: 20,
  };
  refillDots(g);
  spawnActors(g);
  return g;
}

function actorPx(a: { tx: number; ty: number; dir: Dir; prog: number }): { x: number; y: number } {
  return { x: (a.tx + 0.5 + a.dir.dx * a.prog) * TILE, y: (a.ty + 0.5 + a.dir.dy * a.prog) * TILE };
}

// กลับทิศกลางทาง (สลับ anchor ให้ตำแหน่งบนจอไม่กระโดด)
function reverseMid(a: Actor, d: Dir) {
  a.tx += a.dir.dx;
  a.ty += a.dir.dy;
  a.prog = 1 - a.prog;
  a.dir = d;
  a.want = d;
}

export function PacmanGameModal({
  open,
  skin,
  sound,
  onClose,
}: {
  open: boolean;
  skin: HudSkin;
  sound: SoundFn;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>('idle');
  const [best, setBest] = useState(0);
  const [newRecord, setNewRecord] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gRef = useRef<Game>(freshGame());
  const phaseRef = useRef<Phase>('idle');
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const [, forceTick] = useState(0); // บังคับ re-render ให้ HUD/overlay ตามเกม

  // โหลดสถิติสูงสุด + รีเซ็ตตอนเปิด popup
  useEffect(() => {
    if (!open) return;
    try {
      setBest(parseInt(localStorage.getItem(PAC_BEST_KEY) || '0', 10) || 0);
    } catch {
      // ไม่มี localStorage ข้าม
    }
    setPhase('idle');
    phaseRef.current = 'idle';
    setNewRecord(false);
    gRef.current = freshGame();
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function stopLoop() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // ===== ตัดสินใจทิศของแพคแมน (ที่กึ่งกลางช่อง): คิวก่อน → ทิศเดิม → หยุด =====
  function decidePac(g: Game): Dir | null {
    const p = g.pac;
    if (pacCanWalk(p.tx + p.want.dx, p.ty + p.want.dy)) return p.want;
    if (pacCanWalk(p.tx + p.dir.dx, p.ty + p.dir.dy)) return p.dir;
    return null;
  }

  // ===== ตัดสินใจทิศของผี =====
  function decideGhost(g: Game, gh: Ghost): Dir {
    const corner = [[17, 1], [1, 1], [17, 13]][g.ghosts.indexOf(gh)] ?? [17, 1];
    const target =
      gh.mode === 'eyes'
        ? HOUSE_CELL
        : gh.mode === 'house'
          ? DOOR_OUT
          : !g.chasing
            ? { tx: corner[0], ty: corner[1] }
            : { tx: g.pac.tx + g.pac.dir.dx * gh.offset, ty: g.pac.ty + g.pac.dir.dy * gh.offset };
    const allowDoor = gh.mode === 'eyes' || gh.mode === 'house';
    const rev = { dx: -gh.dir.dx, dy: -gh.dir.dy };

    let options = ALL_DIRS.filter(
      (d) => !(d.dx === rev.dx && d.dy === rev.dy) && ghostCanWalk(gh.tx + d.dx, gh.ty + d.dy, allowDoor)
    );
    if (options.length === 0) options = [rev].filter((d) => ghostCanWalk(gh.tx + d.dx, gh.ty + d.dy, allowDoor));
    if (options.length === 0) return rev;

    // สุ่มบ้างเล็กน้อยเพื่อทำลายการวนซ้ำ (oscillation) ของ greedy+no-reverse
    const rnd = gh.mode === 'fright' || gh.mode === 'house' ? 1 : g.chasing ? 0.12 : 0.2;
    if (Math.random() < rnd) return options[Math.floor(Math.random() * options.length)];

    // เลือกทางที่ใกล้เป้าหมายที่สุด (สุ่มลำดับกันวนลูป)
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    let bestD = shuffled[0];
    let bestDist = Infinity;
    for (const d of shuffled) {
      const dist = Math.abs(gh.tx + d.dx - target.tx) + Math.abs(gh.ty + d.dy - target.ty);
      if (dist < bestDist) {
        bestDist = dist;
        bestD = d;
      }
    }
    return bestD;
  }

  // ===== เดิน 1 เฟรม: เข้ากึ่งกลางช่องแล้วตัดสินใจทิศใหม่ =====
  function stepActor(a: Actor, dt: number, decide: () => Dir | null) {
    let remaining = a.speed * dt;
    let guard = 0;
    while (remaining > 1e-9 && guard++ < 8) {
      if (a.prog === 0) {
        const nd = decide();
        if (!nd) return;
        a.dir = nd;
      }
      const step = Math.min(remaining, 1 - a.prog);
      a.prog += step;
      remaining -= step;
      if (a.prog >= 1 - 1e-9) {
        a.tx += a.dir.dx;
        a.ty += a.dir.dy;
        a.prog = 0;
      }
    }
  }

  // ===== กินจุดที่ช่อง anchor ปัจจุบันของแพคแมน =====
  function eatAt(g: Game) {
    const p = g.pac;
    const key = `${p.tx},${p.ty}`;
    if (g.pellets.has(key)) {
      g.pellets.delete(key);
      g.score += 10;
      if (g.eatSndT <= 0) {
        sound('tick');
        g.eatSndT = 0.14;
      }
    } else if (g.power.has(key)) {
      g.power.delete(key);
      g.score += 50;
      g.frightT = Math.max(2, 6.5 - (g.level - 1) * 0.75);
      g.frightCombo = 0;
      sound('clear');
      for (const gh of g.ghosts) {
        if (gh.mode === 'normal') {
          gh.mode = 'fright';
          reverseMid(gh, { dx: -gh.dir.dx, dy: -gh.dir.dy });
        }
      }
    }
    if (g.pellets.size === 0 && g.power.size === 0) {
      g.score += 100;
      g.levelT = 1.5;
      phaseRef.current = 'levelup';
      setPhase('levelup');
      sound('success');
    }
  }

  function loseLife() {
    const g = gRef.current;
    g.deathT = 1.0;
    phaseRef.current = 'dying';
    setPhase('dying');
    sound('error');
  }

  function afterDeath() {
    const g = gRef.current;
    g.lives -= 1;
    if (g.lives <= 0) {
      endGame();
      return;
    }
    spawnActors(g);
    phaseRef.current = 'playing';
    setPhase('playing');
  }

  function afterLevelUp() {
    const g = gRef.current;
    g.level += 1;
    refillDots(g);
    spawnActors(g);
    phaseRef.current = 'playing';
    setPhase('playing');
  }

  function endGame() {
    stopLoop();
    const g = gRef.current;
    phaseRef.current = 'over';
    setPhase('over');
    if (g.score > best) {
      setBest(g.score);
      setNewRecord(true);
      try {
        localStorage.setItem(PAC_BEST_KEY, String(g.score));
      } catch {
        // บันทึกไม่ได้ก็ข้าม
      }
      setTimeout(() => sound('success'), 320);
    }
    forceTick((v) => v + 1);
  }

  // ===== วนเกมหลัก =====
  function startLoop() {
    stopLoop();
    lastRef.current = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const g = gRef.current;
      const ph = phaseRef.current;

      g.animT += dt;
      g.eatSndT -= dt;

      if (ph === 'dying') {
        g.deathT -= dt;
        draw();
        if (g.deathT <= 0) afterDeath();
        forceTick((v) => v + 1);
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (ph === 'levelup') {
        g.levelT -= dt;
        draw();
        if (g.levelT <= 0) afterLevelUp();
        forceTick((v) => v + 1);
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // ===== playing =====
      // สลับโหมด chase/scatter (กันผีวนลูปไม่ยอมลงมาจับ)
      g.modeT -= dt;
      if (g.modeT <= 0) {
        g.chasing = !g.chasing;
        g.modeT = g.chasing ? 20 : 6;
      }

      if (g.frightT > 0) {
        g.frightT -= dt;
        g.frightBlink = g.frightT <= 2 && Math.floor(g.frightT * 5) % 2 === 0;
        if (g.frightT <= 0) {
          g.frightT = 0;
          for (const gh of g.ghosts) if (gh.mode === 'fright') gh.mode = 'normal';
        }
      }

      // แพคแมนเดิน
      stepActor(g.pac, dt, () => decidePac(g));
      eatAt(g);
      if (phaseRef.current !== 'playing') {
        draw();
        forceTick((v) => v + 1);
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // ผีเดิน
      for (const gh of g.ghosts) {
        if (gh.mode === 'house' && gh.houseT > 0) {
          gh.houseT -= dt;
          continue;
        }
        gh.speed =
          gh.mode === 'eyes' ? 9 : gh.mode === 'fright' ? 3.0 : gh.mode === 'house' ? 4.0 : gh.baseSpeed;
        stepActor(gh, dt, () => decideGhost(g, gh));
        if (gh.mode === 'house' && gh.tx === DOOR_OUT.tx && gh.ty === DOOR_OUT.ty && gh.prog === 0) {
          gh.mode = g.frightT > 0 ? 'fright' : 'normal';
        }
        if (gh.mode === 'eyes' && gh.tx === HOUSE_CELL.tx && gh.ty === HOUSE_CELL.ty && gh.prog === 0) {
          gh.mode = 'house';
          gh.houseT = 1.0;
          gh.dir = DIR_UP;
          gh.want = DIR_UP;
        }
      }

      // ===== ชนผี? =====
      const pc = actorPx(g.pac);
      for (const gh of g.ghosts) {
        if (gh.mode !== 'normal' && gh.mode !== 'fright') continue;
        const gc = actorPx(gh);
        if (Math.hypot(pc.x - gc.x, pc.y - gc.y) < TILE * 0.62) {
          if (gh.mode === 'fright') {
            const gain = 200 * Math.pow(2, g.frightCombo);
            g.frightCombo = Math.min(g.frightCombo + 1, 3);
            g.score += gain;
            gh.mode = 'eyes';
            sound('success');
          } else {
            loseLife();
            draw();
            forceTick((v) => v + 1);
            rafRef.current = requestAnimationFrame(step);
            return;
          }
        }
      }

      draw();
      forceTick((v) => v + 1);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  // ===== ตั้งทิศที่ต้องการ (ปุ่ม/ปัดจอ) + เริ่มเกมถ้ายังไม่เริ่ม =====
  function setWant(d: Dir) {
    if (phaseRef.current === 'idle' || phaseRef.current === 'over') {
      startGame();
    }
    if (phaseRef.current !== 'playing') return;
    const g = gRef.current;
    g.pac.want = d;
    if (g.pac.prog > 0 && d.dx === -g.pac.dir.dx && d.dy === -g.pac.dir.dy) {
      reverseMid(g.pac, d);
    }
  }

  function startGame() {
    gRef.current = freshGame();
    setNewRecord(false);
    phaseRef.current = 'playing';
    setPhase('playing');
    sound('select');
    startLoop();
  }

  // ===== คีย์บอร์ด =====
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        setWant(DIR_UP);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        setWant(DIR_DOWN);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        setWant(DIR_LEFT);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        setWant(DIR_RIGHT);
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (phaseRef.current === 'idle' || phaseRef.current === 'over') startGame();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, best]);

  // ===== วาดเฟรม =====
  function draw() {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const g = gRef.current;

    // พื้นหลัง
    ctx.fillStyle = '#04040f';
    ctx.fillRect(0, 0, W, H);

    // กำแพง (เส้นขอบด้านที่เปิดโล่ง — สไตล์เส้นคลาสสิก)
    ctx.strokeStyle = '#2b3bff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.beginPath();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (mazeCell(x, y) !== '#') continue;
        const px = x * TILE;
        const py = y * TILE;
        if (mazeCell(x, y - 1) !== '#') {
          ctx.moveTo(px, py + 1);
          ctx.lineTo(px + TILE, py + 1);
        }
        if (mazeCell(x, y + 1) !== '#') {
          ctx.moveTo(px, py + TILE - 1);
          ctx.lineTo(px + TILE, py + TILE - 1);
        }
        if (mazeCell(x - 1, y) !== '#') {
          ctx.moveTo(px + 1, py);
          ctx.lineTo(px + 1, py + TILE);
        }
        if (mazeCell(x + 1, y) !== '#') {
          ctx.moveTo(px + TILE - 1, py);
          ctx.lineTo(px + TILE - 1, py + TILE);
        }
      }
    }
    ctx.stroke();

    // ประตูบ้านผี
    ctx.fillStyle = '#ffb8de';
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (mazeCell(x, y) === '-') ctx.fillRect(x * TILE, y * TILE + TILE / 2 - 1.5, TILE, 3);
      }
    }

    // จุดปกติ
    ctx.fillStyle = '#ffd9a8';
    for (const key of g.pellets) {
      const [x, y] = key.split(',').map(Number);
      ctx.fillRect(x * TILE + TILE / 2 - 1.5, y * TILE + TILE / 2 - 1.5, 3, 3);
    }
    // จุดพลัง (กะพริบ)
    if (Math.floor(g.animT * 4) % 2 === 0) {
      for (const key of g.power) {
        const [x, y] = key.split(',').map(Number);
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2;
        ctx.fillRect(cx - 3.5, cy - 3.5, 7, 7);
        ctx.fillRect(cx - 2, cy - 5, 4, 2);
        ctx.fillRect(cx - 2, cy + 3, 4, 2);
        ctx.fillRect(cx - 5, cy - 2, 2, 4);
        ctx.fillRect(cx + 3, cy - 2, 2, 4);
      }
    }

    // ===== ผี =====
    for (const gh of g.ghosts) {
      const c = actorPx(gh);
      const r = TILE * 0.44;
      const fright = gh.mode === 'fright';
      const eyes = gh.mode === 'eyes';
      const blink = fright && g.frightBlink;
      const body = blink ? '#f4f4ff' : fright ? '#2121de' : eyes ? '#cfd2ff' : gh.color;
      const cy = c.y - r * 0.1;
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(c.x, cy - r * 0.15, r, Math.PI, 0);
      ctx.lineTo(c.x + r, cy + r * 0.72);
      const segW = (r * 2) / 6;
      let sx = c.x + r;
      for (let i = 0; i < 6; i++) {
        sx -= segW;
        ctx.lineTo(sx, i % 2 === 0 ? cy + r * 0.44 : cy + r * 0.72);
      }
      ctx.closePath();
      ctx.fill();
      // ตา
      if (fright && !eyes) {
        ctx.fillStyle = blink ? '#e23b3b' : '#f4f4ff';
        ctx.fillRect(c.x - r * 0.55, cy - r * 0.35, 3, 3);
        ctx.fillRect(c.x + r * 0.3, cy - r * 0.35, 3, 3);
        ctx.fillRect(c.x - r * 0.55, cy + r * 0.15, r * 1.1, 2);
      } else {
        ctx.fillStyle = '#f4f4ff';
        ctx.fillRect(c.x - r * 0.62, cy - r * 0.45, 5, 5);
        ctx.fillRect(c.x + r * 0.18, cy - r * 0.45, 5, 5);
        ctx.fillStyle = '#2233dd';
        const ox = gh.dir.dx * 1.6;
        const oy = gh.dir.dy * 1.6;
        ctx.fillRect(c.x - r * 0.62 + 1.5 + ox, cy - r * 0.45 + 1.5 + oy, 2.5, 2.5);
        ctx.fillRect(c.x + r * 0.18 + 1.5 + ox, cy - r * 0.45 + 1.5 + oy, 2.5, 2.5);
      }
    }

    // ===== แพคแมน =====
    const pc = actorPx(g.pac);
    const pr = TILE * 0.46;
    let mouth: number;
    if (phaseRef.current === 'dying') {
      const k = Math.min(1, (1 - g.deathT) / 0.85);
      mouth = (0.55 + 0.45 * k) * Math.PI;
    } else {
      mouth = (0.1 + 0.42 * Math.abs(Math.sin(g.animT * 11))) * Math.PI;
    }
    const base = g.pac.dir.dy === 0 ? (g.pac.dir.dx > 0 ? 0 : Math.PI) : g.pac.dir.dy > 0 ? Math.PI / 2 : -Math.PI / 2;
    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.moveTo(pc.x, pc.y);
    ctx.arc(pc.x, pc.y, pr, base + mouth, base - mouth + Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  // วาดเฟรมแรกทันทีที่เปิด popup
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const g = gRef.current;
  const phaseNow = phaseRef.current;

  return (
    <div
      className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('มินิเกมแพคแมน Pac-Man')}
      onClick={onClose}
    >
      <div
        className={`${skin.card} w-full max-w-sm shadow-2xl px-5 py-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* หัว popup */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`flex items-center gap-2 text-base font-extrabold ${skin.score}`}>
            <i className="fa-solid fa-ghost opacity-70"></i>
            {t('แพคแมน — เก็บจุดหลบผี')}
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
          <i className="fa-solid fa-circle-info"></i>
          {t('ลูกศร / WASD = เคลื่อนที่ • เก็บจุดให้ครบ = ผ่านด่าน • จุดพลังใหญ่ = กลับกินผีได้')}
        </p>

        {/* สถิติ */}
        <div aria-live="polite" className="mt-3 flex items-center justify-center gap-2 text-xs font-extrabold flex-wrap">
          <span className={`rounded-full px-2.5 py-1 ${skin.sub}`}>{t('คะแนน: {score}', { score: g.score })}</span>
          <span className={`rounded-full px-2.5 py-1 ${skin.sub}`}>{t('🏆 สถิติสูงสุด: {best}', { best })}</span>
          <span className={`rounded-full px-2.5 py-1 ${skin.sub} inline-flex items-center gap-1`}>
            {t('ชีวิต: {n}', { n: g.lives })}
            {Array.from({ length: Math.max(0, g.lives) }).map((_, i) => (
              <LifePac key={i} />
            ))}
          </span>
        </div>

        {/* ===== พื้นที่เล่นเกม + โอเวอร์เลย์ ===== */}
        <div className="relative flex justify-center mt-3">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              role="button"
              tabIndex={0}
              aria-label={t('พื้นที่เล่นเกมแพคแมน — ปัดหรือใช้ปุ่มลูกศรเพื่อเคลื่อนที่')}
              className="rounded-xl ring-1 ring-black/60 shadow-inner select-none touch-none block"
              style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', backgroundColor: '#04040f' }}
              onPointerDown={(e) => {
                e.preventDefault();
                swipeRef.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerUp={(e) => {
                const s = swipeRef.current;
                swipeRef.current = null;
                if (!s) return;
                const dx = e.clientX - s.x;
                const dy = e.clientY - s.y;
                if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
                  if (phaseRef.current === 'idle' || phaseRef.current === 'over') startGame();
                  return;
                }
                if (Math.abs(dx) > Math.abs(dy)) setWant(dx > 0 ? DIR_RIGHT : DIR_LEFT);
                else setWant(dy > 0 ? DIR_DOWN : DIR_UP);
              }}
            />

            {/* โอเวอร์เลย์เริ่มเกม */}
            {phaseNow === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 rounded-xl backdrop-blur-[1px]">
                <span className="text-3xl" aria-hidden="true">🟡</span>
                <p className="text-sm font-black text-white drop-shadow">{t('เก็บจุดให้ครบ หลบผีให้ไว!')}</p>
                <p className="text-[11px] font-semibold text-white/80">
                  {t('กดปุ่มลูกศรหรือแตะเพื่อเริ่ม')}
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  className={`mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
                >
                  <i className="fa-solid fa-play"></i>
                  {t('เริ่มเกม')}
                </button>
              </div>
            )}

            {/* โอเวอร์เลย์ผ่านด่าน */}
            {phaseNow === 'levelup' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <p className="text-xl font-black text-emerald-400 drop-shadow">{t('ผ่านด่าน! +{n}', { n: 100 })}</p>
              </div>
            )}

            {/* โอเวอร์เลย์จบเกม */}
            {phaseNow === 'over' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 rounded-xl backdrop-blur-[1px]">
                <span className="text-3xl" aria-hidden="true">👻</span>
                <p className="text-lg font-black text-white drop-shadow">
                  {t('จบเกม! ได้ {score} แต้ม', { score: g.score })}
                </p>
                {newRecord && (
                  <p className="text-sm font-black text-yellow-300 drop-shadow">{t('สถิติใหม่! 🏆')}</p>
                )}
                <button
                  type="button"
                  onClick={startGame}
                  className={`mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
                >
                  <i className="fa-solid fa-rotate-right"></i>
                  {t('เริ่มใหม่')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มทิศทาง (สำหรับมือถือ) */}
        <div className="mt-3 flex justify-center" role="group" aria-label={t('ปุ่มทิศทางเคลื่อนแพคแมน')}>
          <div className="grid grid-cols-3 gap-1.5" style={{ gridTemplateRows: 'auto auto' }}>
            <span aria-hidden="true"></span>
            <DPadBtn label={t('เคลื่อนขึ้น')} skin={skin} onPress={() => setWant(DIR_UP)} icon="fa-arrow-up" />
            <span aria-hidden="true"></span>
            <DPadBtn label={t('เคลื่อนซ้าย')} skin={skin} onPress={() => setWant(DIR_LEFT)} icon="fa-arrow-left" />
            <DPadBtn label={t('เคลื่อนลง')} skin={skin} onPress={() => setWant(DIR_DOWN)} icon="fa-arrow-down" />
            <DPadBtn label={t('เคลื่อนขวา')} skin={skin} onPress={() => setWant(DIR_RIGHT)} icon="fa-arrow-right" />
          </div>
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={startGame}
            title={phaseNow === 'idle' ? t('เริ่มเกมแพคแมน') : t('เริ่มเกมใหม่')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer ${skin.flipBtn}`}
          >
            <i className={`fa-solid ${phaseNow === 'idle' ? 'fa-play' : 'fa-rotate-right'}`}></i>
            {phaseNow === 'idle' ? t('เริ่มเกม') : t('เริ่มใหม่')}
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

// ปุ่มทิศทางรูปเหลี่ยม
function DPadBtn({
  label,
  skin,
  onPress,
  icon,
}: {
  label: string;
  skin: HudSkin;
  onPress: () => void;
  icon: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={`w-11 h-9 rounded-lg inline-flex items-center justify-center text-sm transition active:scale-90 cursor-pointer ${skin.flipBtn}`}
    >
      <i className={`fa-solid ${icon}`}></i>
    </button>
  );
}

// ไอคอนแพคแมนเล็ก (โชว์จำนวนชีวิต)
function LifePac() {
  return (
    <svg viewBox="0 0 20 20" className="w-3 h-3" aria-hidden="true" focusable="false">
      <path d="M10 10 L17.5 5.8 A8.5 8.5 0 1 0 17.5 14.2 Z" fill="#f59e0b" />
    </svg>
  );
}
