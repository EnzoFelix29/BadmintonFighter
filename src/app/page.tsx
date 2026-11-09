'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { getSkin, type Skin } from '@/lib/characters';
import { getGear, type GearKind, type GearSkin } from '@/lib/gear';
import {
  awardCoins,
  calcMatchCoins,
  deletePlayer,
  loadPlayers,
  purchaseGear,
  registerPlayer,
  updateProfile,
  type PlayerProfile,
} from '@/lib/players';
import { getHudSkin, HUD_SKIN_KEY, type HudSkin } from '@/lib/hud-skins';
import { useLang, type Lang } from '@/lib/i18n';
import { PixelAvatar, TeamPlayersAvatar, type PlayerInfo } from '@/components/pixel-avatar';
import { ScoreHud } from '@/components/score-hud';
import { FlipCoinModal } from '@/components/flip-coin-modal';
import { FoodRouletteModal } from '@/components/food-roulette-modal';
import { FOOD_MENUS, pickFoodMenu, type FoodMenu, type FoodMenuId } from '@/lib/food-menus';
import { CourtFeeModal } from '@/components/court-fee-modal';
import { CrocGameModal } from '@/components/croc-game-modal';
import { HiLoGameModal } from '@/components/hilo-game-modal';
import { DinoGameModal } from '@/components/dino-game-modal';
import { RulesModal } from '@/components/rules-modal';
import { ShuttlecockIcon } from '@/components/shuttlecock-icon';
import { Podium } from '@/components/podium';
import { WinRateRing } from '@/components/win-rate-ring';
import { CharacterPicker, type PickerSlot } from '@/components/character-picker';
import { GearPixel } from '@/components/gear-pixel';
import { SkinReel } from '@/components/skin-reel';
import { ShopModal } from '@/components/shop-modal';
import { RegisterModal, type RosterAction } from '@/components/register-modal';

interface PlayerSlot {
  name: string; // ชื่อผู้เล่นที่เลือกจากรายชื่อที่ลงทะเบียนไว้ ('' = ยังไม่เลือก)
}

interface Match {
  id: number;
  court: string;
  type: string;
  teamA: string;
  teamB: string;
  playersA?: PlayerInfo[];
  playersB?: PlayerInfo[];
  scoreA: number;
  scoreB: number;
  maxScore: string;
  date?: string;
}

interface TeamStat {
  name: string;
  played: number;
  win: number;
  lose: number;
}

interface RankedTeam extends TeamStat {
  winRate: number;
}

// วันที่วันนี้ตามเวลาท้องถิ่น (รูปแบบ yyyy-mm-dd สำหรับ date input)
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// แปลงเป็นรูปแบบวันที่ตามภาษา: ไทย = ด/ด/ดดด พ.ศ. (+543) | อังกฤษ = ด/ด/ดดด ค.ศ.
function formatMatchDate(iso?: string, lang: Lang = 'th'): string {
  if (!iso) return '-';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return iso;
  return lang === 'en' ? `${d}/${m}/${y}` : `${d}/${m}/${y + 543}`;
}

// สีตราอันดับ: ทอง / เงิน / ทองแดง / ธรรมดา
function rankBadgeClass(index: number): string {
  if (index === 0) return 'bg-[#e9e2ca] text-[#5b4a22]';
  if (index === 1) return 'bg-[#e4e8e6] text-[#4e5651]';
  if (index === 2) return 'bg-[#e9d8ca] text-[#744d2f]';
  return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
}

// ตัดเลขแต้มให้ไม่เกินจำนวนแต้มที่เลือก (เกมละกี่แต้ม): พิมพ์เกิน = ตัดที่เลขสูงสุด, ติดลบ = 0
function clampScoreStr(raw: string, cap: number): string {
  if (raw === '') return '';
  const n = parseInt(raw, 10);
  if (isNaN(n)) return '';
  if (n <= 0) return '0';
  return n > cap ? String(cap) : String(n);
}

type SoundKind = 'success' | 'error' | 'open' | 'clear' | 'select' | 'tick';

// แถวผู้เล่น 1 คน: ปุ่มอวตาร (คลิกเปิดตู้ Reel เปลี่ยนสกินอุปกรณ์)
// + ช่องเลือกชื่อจากผู้เล่นที่ลงทะเบียนไว้ (สกินโหลดตามโปรไฟล์อัตโนมัติ) + ลิงก์เปลี่ยนตัวละคร
function PlayerSlotField({
  id,
  label,
  slot,
  profile,
  players,
  takenNames,
  accent,
  onSelectName,
  onOpenPicker,
  onOpenReel,
  onOpenRegister,
  hudSkin,
}: {
  id: string;
  label: string;
  slot: PlayerSlot;
  profile?: PlayerProfile;
  players: PlayerProfile[];
  takenNames: string[]; // ชื่อที่ถูกใช้อยู่ในสล็อตอื่นของแมตช์นี้
  accent: 'blue' | 'rose';
  onSelectName: (name: string) => void;
  onOpenPicker: () => void;
  onOpenReel: () => void;
  onOpenRegister: () => void;
  hudSkin: HudSkin;
}) {
  const { t } = useLang();
  const styles =
    accent === 'blue'
      ? {
          btnBg: hudSkin.card,
          input: hudSkin.chip,
          link: hudSkin.nameA,
        }
      : {
          btnBg: hudSkin.card,
          input: hudSkin.chip,
          link: hudSkin.nameB,
        };

  const skin = profile ? getSkin(profile.skinId) : undefined;
  const racket = profile ? getGear(profile.racketId) : undefined;
  const shoe = profile ? getGear(profile.shoeId) : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
        <button
          type="button"
          onClick={onOpenPicker}
          className={`text-xs font-medium transition-colors cursor-pointer ${styles.link}`}
        >
          <i className="fa-solid fa-user-pen mr-0.5"></i>
          {t('เปลี่ยนตัวละคร')}
        </button>
      </div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={onOpenReel}
          aria-label={t('เปลี่ยนสกินไม้แบดและรองเท้าของ{label}', { label })}
          title={
            profile
              ? t('เปิดตู้ Reel เปลี่ยนสกินไม้แบด / รองเท้าของผู้เล่นคนนี้')
              : t('เลือกผู้เล่นก่อน')
          }
          className={`relative shrink-0 w-11 rounded-lg ${styles.btnBg} flex items-center justify-center transition-colors hover:ring-2 focus:ring-2 focus:ring-current outline-none cursor-pointer ${accent === 'blue' ? hudSkin.nameA : hudSkin.nameB}`}
        >
          {skin && <PixelAvatar skin={skin} size={34} />}
          {racket && (
            <span className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-md bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center shadow-sm">
              <GearPixel gear={racket} size={12} />
            </span>
          )}
          {shoe && (
            <span className="absolute -bottom-1 -left-1 w-[18px] h-[18px] rounded-md bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-600 flex items-center justify-center shadow-sm">
              <GearPixel gear={shoe} size={12} />
            </span>
          )}
        </button>
        <select
          id={id}
          value={slot.name}
          onChange={(e) => {
            if (e.target.value === '__register') onOpenRegister();
            else onSelectName(e.target.value);
          }}
          className={`flex-1 min-w-0 rounded-lg px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 cursor-pointer ${styles.input}`}
        >
          <option value="">— {t('เลือกผู้เล่น')} —</option>
          {players.map((p) => {
            const taken = takenNames.includes(p.name);
            return (
              <option key={p.name} value={p.name} disabled={taken}>
                {p.name} • {t('{n} เหรียญ', { n: p.coins })}
                {taken ? t(' (เล่นอยู่)') : ''}
              </option>
            );
          })}
          <option value="__register">＋ {t('ลงทะเบียนผู้เล่นใหม่')}…</option>
        </select>
      </div>
    </div>
  );
}

export default function Home() {
  const { lang, setLang, t } = useLang();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamStats, setTeamStats] = useState<Record<string, TeamStat>>({});

  // ฟอร์มกรอกข้อมูล
  const [court, setCourt] = useState('');
  const [type, setType] = useState('เดี่ยว');
  const [maxScore, setMaxScore] = useState('21');
  // ผู้เล่น 4 สล็อต: เดี่ยวใช้ A1/B1, คู่ใช้ครบทุกสล็อต — เลือกชื่อจากผู้เล่นที่ลงทะเบียนไว้
  const [slotA1, setSlotA1] = useState<PlayerSlot>({ name: '' });
  const [slotA2, setSlotA2] = useState<PlayerSlot>({ name: '' });
  const [slotB1, setSlotB1] = useState<PlayerSlot>({ name: '' });
  const [slotB2, setSlotB2] = useState<PlayerSlot>({ name: '' });
  const [pickerSlot, setPickerSlot] = useState<PickerSlot | null>(null);
  const [reelSlot, setReelSlot] = useState<PickerSlot | null>(null);

  // ระบบสมาชิก: โปรไฟล์ผู้เล่น (เหรียญ + สกินรายบุคคล) + ร้านค้ารายบุคคล
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerBackTo, setRegisterBackTo] = useState<PickerSlot | null>(null);
  const [shopFor, setShopFor] = useState<string | null>(null); // ชื่อผู้เล่นที่เปิดร้านค้า
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [matchDate, setMatchDate] = useState('');

  // HUD สกอร์บอร์ดสด: สกินที่เลือก (5 แบบ — จำค่าใน localStorage)
  const [hudSkinId, setHudSkinId] = useState('classic');
  // จับเหรียญเสิร์ฟก่อน: idle = ยังไม่จับ / flipping = เหรียญกำลังหมุน / done = รู้ผลแล้ว
  const [flipState, setFlipState] = useState<'idle' | 'flipping' | 'done'>('idle');
  const [flipFace, setFlipFace] = useState<'A' | 'B'>('A'); // หน้าเหรียญที่โชว์ตอนนี้ (A = หัว, B = ก้อย)
  const [serveTeam, setServeTeam] = useState<'A' | 'B' | null>(null); // ทีมที่ได้เสิร์ฟก่อน
  const [flipOpen, setFlipOpen] = useState(false); // popup จับเหรียญ — เหรียญใหญ่เด้งกลางจอ
  const flipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // ลูกเล่นสุ่มเมนูอาหารหลังตีแบต — สล็อตกาชาปอง 6 เมนู
  const [foodOpen, setFoodOpen] = useState(false);
  const [foodState, setFoodState] = useState<'rolling' | 'done'>('rolling');
  const [foodDisplay, setFoodDisplay] = useState<FoodMenuId>('congee'); // เมนูที่โชว์ในช่องสล็อตขณะวน
  const [foodResult, setFoodResult] = useState<FoodMenu | null>(null);
  const foodTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // ลูกเล่นหลังตีแบตอีก 4 อย่าง: คิดตังค่าสนาม / มินิเกมจระเข้กดนิ้ว / มินิเกม HI-LO / มินิเกมดีโน่รัน
  const [feeOpen, setFeeOpen] = useState(false);
  const [crocOpen, setCrocOpen] = useState(false);
  const [hiloOpen, setHiloOpen] = useState(false);
  const [dinoOpen, setDinoOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false); // Modal กฎกติกา & วิธีได้เหรียญ
  // โหมดการแสดงผลของจอ: 'portrait' = แนวตั้ง | 'landscape' = แนวนอน
  const [disp, setDisp] = useState<'portrait' | 'landscape'>('portrait');
  const dispManualRef = useRef(false); // เลือกเองแล้วจะไม่สลับตามการหมุนจออัตโนมัติ

  // UI state
  const [alertMsg, setAlertMsg] = useState<{ msg: string; isError: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportableRef = useRef<HTMLDivElement>(null);
  const soundMutedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Theme (light/dark)
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้ (real time)
    setMatchDate(todayISO());
    // โหลดสถานะเสียง
    try {
      const muted = localStorage.getItem('badminton_sound') === 'off';
      soundMutedRef.current = muted;
      setSoundMuted(muted);
    } catch {
      // ไม่มี localStorage ใช้ค่าเริ่มต้น
    }
    try {
      const savedMatches = localStorage.getItem('badminton_matches');
      const savedStats = localStorage.getItem('badminton_teamStats');
      if (savedMatches && savedStats) {
        setMatches(JSON.parse(savedMatches));
        setTeamStats(JSON.parse(savedStats));
      }
    } catch {
      // ข้อมูลเสียหาย ไม่ต้องโหลด
    }
    // โหลดโปรไฟล์ผู้เล่นที่ลงทะเบียนไว้ (ชื่อ / เหรียญ / สกินรายบุคคล)
    setPlayers(loadPlayers());
    // โหลดสกิน HUD ที่เลือกไว้ครั้งก่อน
    try {
      const savedHud = localStorage.getItem(HUD_SKIN_KEY);
      if (savedHud) setHudSkinId(savedHud);
    } catch {
      // ข้าม
    }
    return () => {
      if (alertTimer.current) clearTimeout(alertTimer.current);
      if (flipTimerRef.current) clearInterval(flipTimerRef.current);
      if (foodTimerRef.current) clearInterval(foodTimerRef.current);
    };
  }, []);

  // เซฟโปรไฟล์ผู้เล่นทุกครั้งที่เปลี่ยน (ชื่อ / เหรียญ / สกินเป็นของรายบุคคล)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('badminton_players', JSON.stringify(players));
    } catch {
      // บันทึกไม่ได้ก็ข้าม
    }
  }, [players, mounted]);

  // เซฟสกิน HUD ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HUD_SKIN_KEY, hudSkinId);
    } catch {
      // บันทึกไม่ได้ก็ข้าม
    }
  }, [hudSkinId, mounted]);

  // โหมดการแสดงผล: โหลดค่าที่เคยเลือกไว้ / ไม่มีก็ตามสัดส่วนจอจริง (สลับอัตโนมัติเมื่อหมุนจอ)
  useEffect(() => {
    function followOrientation() {
      setDisp(window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait');
    }
    try {
      const saved = localStorage.getItem('badminton_display_mode');
      if (saved === 'portrait' || saved === 'landscape') {
        dispManualRef.current = true;
        setDisp(saved);
      } else {
        followOrientation();
      }
    } catch {
      followOrientation();
    }
    const onResize = () => {
      if (!dispManualRef.current) followOrientation();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // ===== ระบบเสียงเอฟเฟกต์ (Web Audio API — สังเคราะห์เสียงสด ไม่ต้องโหลดไฟล์) =====
  function getAudioCtx(): AudioContext | null {
    try {
      if (!audioCtxRef.current) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        audioCtxRef.current = new AC();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }

  function playTone(
    ctx: AudioContext,
    freq: number,
    start: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.12
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + start;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  function playSound(kind: SoundKind) {
    if (soundMutedRef.current) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    switch (kind) {
      case 'success': // บันทึกสำเร็จ: เสียงเหรียญเกม 8-bit ไล่โน้ตขึ้น E5 → G5 → C6
        playTone(ctx, 659.25, 0, 0.08, 'square', 0.05);
        playTone(ctx, 783.99, 0.08, 0.08, 'square', 0.05);
        playTone(ctx, 1046.5, 0.16, 0.25, 'square', 0.05);
        break;
      case 'select': // เลือกตัวละคร: บลิปสั้นแบบ 8-bit
        playTone(ctx, 880, 0, 0.06, 'square', 0.045);
        playTone(ctx, 1174.66, 0.06, 0.1, 'square', 0.045);
        break;
      case 'error': // กรอกไม่ครบ/ผิดพลาด: เสียงต่ำสั้น 2 จังหวะ
        playTone(ctx, 233.08, 0, 0.15, 'square', 0.05);
        playTone(ctx, 174.61, 0.13, 0.22, 'square', 0.05);
        break;
      case 'open': // เปิดสรุปภาพรวม: โน้ตคู่สั้นเบา
        playTone(ctx, 523.25, 0, 0.09, 'sine', 0.07);
        playTone(ctx, 659.25, 0.07, 0.12, 'sine', 0.07);
        break;
      case 'clear': // ล้างข้อมูล: ไล่โน้ตลง
        playTone(ctx, 659.25, 0, 0.1, 'triangle', 0.07);
        playTone(ctx, 523.25, 0.09, 0.1, 'triangle', 0.07);
        playTone(ctx, 392, 0.18, 0.2, 'triangle', 0.07);
        break;
      case 'tick': // เสียงรีลหมุนทีละช่อง (เบา ๆ)
        playTone(ctx, 1318.5, 0, 0.03, 'square', 0.018);
        break;
    }
  }

  function toggleSound() {
    const next = !soundMutedRef.current;
    soundMutedRef.current = next;
    setSoundMuted(next);
    try {
      localStorage.setItem('badminton_sound', next ? 'off' : 'on');
    } catch {
      // บันทึกไม่ได้ก็ข้าม
    }
    if (!next) playSound('open'); // เสียงตอบกลับตอนเปิดเสียง
  }

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  // เลือกสกิน HUD (5 แบบ) — จำค่าไว้ใน localStorage
  function pickHudSkin(id: string) {
    setHudSkinId(id);
    playSound('select');
  }

  // เปลี่ยนโหมดการแสดงผลของจอ (เลือกเองแล้วจะไม่สลับตามการหมุนจออัตโนมัติ)
  function setDisplayMode(mode: 'portrait' | 'landscape') {
    if (mode === disp) return;
    dispManualRef.current = true;
    setDisp(mode);
    playSound('select');
    try {
      localStorage.setItem('badminton_display_mode', mode);
    } catch {
      // บันทึกไม่ได้ก็ข้าม
    }
  }

  // จับเหรียญเสิร์ฟก่อน: เปิด popup เหรียญใหญ่เด้งกลางจอ ~5 วินาที แล้วสุ่มผล — หัว = ทีม A, ก้อย = ทีม B
  function flipCoin() {
    if (flipState === 'flipping') return;
    setFlipOpen(true); // เด้งเหรียญขึ้นบนจอเลย
    playSound('select');
    const result: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
    setFlipState('flipping');
    let ticks = 0;
    const total = 50; // 50 × 100ms = 5 วินาที — เหรียญเด้ง 5 รอบ หมุน 10 รอบพอดี (สปิน 0.5 วิ/รอบ)
    if (flipTimerRef.current) clearInterval(flipTimerRef.current);
    flipTimerRef.current = setInterval(() => {
      ticks++;
      if (ticks >= total) {
        if (flipTimerRef.current) clearInterval(flipTimerRef.current);
        flipTimerRef.current = null;
        setFlipFace(result);
        setServeTeam(result);
        setFlipState('done');
        playSound('success');
        return;
      }
      if (ticks % 2 === 0) setFlipFace((f) => (f === 'A' ? 'B' : 'A'));
      if (ticks % 4 === 0) playSound('tick');
    }, 100);
  }

  // ลูกเล่นสุ่มเมนูอาหารหลังตีแบต: สล็อตวนรูป ~3.2 วิ แล้วเด้งผลตามโอกาส (45/15/15/10/10/5)
  function rollFood() {
    if (foodOpen && foodState === 'rolling') return; // กันกดซ้ำขณะกำลังสุ่ม (popup เปิดอยู่เท่านั้น)
    setFoodOpen(true);
    playSound('select');
    const result = pickFoodMenu();
    setFoodState('rolling');
    setFoodResult(null);
    let ticks = 0;
    const total = 40; // 40 × 80ms ≈ 3.2 วินาที — วนรูปสล็อตจนช้าลงแล้วเด้งผล
    if (foodTimerRef.current) clearInterval(foodTimerRef.current);
    foodTimerRef.current = setInterval(() => {
      ticks++;
      if (ticks >= total) {
        if (foodTimerRef.current) clearInterval(foodTimerRef.current);
        foodTimerRef.current = null;
        setFoodDisplay(result.id);
        setFoodResult(result);
        setFoodState('done');
        playSound('success');
        return;
      }
      setFoodDisplay(FOOD_MENUS[ticks % FOOD_MENUS.length].id); // วนรูปสล็อตทีละเมนู
      if (ticks % 2 === 0) playSound('tick');
    }, 80);
  }

  function showAlert(msg: string, isError = true) {
    setAlertMsg({ msg, isError });
    playSound(isError ? 'error' : 'success');
    if (alertTimer.current) clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(() => setAlertMsg(null), 3000);
  }

  // ฟังก์ชันเซฟข้อมูลลง Local Storage
  function saveDataToLocal(newMatches: Match[], newStats: Record<string, TeamStat>) {
    localStorage.setItem('badminton_matches', JSON.stringify(newMatches));
    localStorage.setItem('badminton_teamStats', JSON.stringify(newStats));
  }

  // ล้างข้อมูลสถิติทั้งหมด: ยืนยันก่อนหนึ่งครั้ง (แมตช์ + ตารางอันดับจะหายหมด)
  function requestClearData() {
    if (
      window.confirm(
        t(
          'ต้องการล้างข้อมูลสถิติทั้งหมดใช่หรือไม่?\n(แมตช์และตารางอันดับจะหายทั้งหมด ย้อนกลับไม่ได้ — โปรไฟล์ผู้เล่น/เหรียญ/สกินยังอยู่)'
        )
      )
    ) {
      doClearData();
    }
  }

  function doClearData() {
    localStorage.removeItem('badminton_matches');
    localStorage.removeItem('badminton_teamStats');
    setMatches([]);
    setTeamStats({});
    showAlert(t('ล้างข้อมูลเรียบร้อยแล้ว'), false);
    playSound('clear');
  }

  // ===== ระบบสมาชิก: ลงทะเบียน / เหรียญและสกินรายบุคคล =====

  const slotStateMap: Record<PickerSlot, PlayerSlot> = { A1: slotA1, A2: slotA2, B1: slotB1, B2: slotB2 };
  const slotSetterMap: Record<PickerSlot, (s: PlayerSlot) => void> = {
    A1: setSlotA1,
    A2: setSlotA2,
    B1: setSlotB1,
    B2: setSlotB2,
  };

  // โปรไฟล์ของผู้เล่นในสล็อต
  function profileOf(slot: PlayerSlot): PlayerProfile | undefined {
    return players.find((p) => p.name === slot.name);
  }

  // ลงทะเบียนผู้เล่นใหม่ (คืนข้อความ error, '' = สำเร็จ)
  function handleRegister(rawName: string): string {
    const res = registerPlayer(players, rawName);
    if (!res.ok) return res.error ?? t('ลงทะเบียนไม่สำเร็จ');
    const name = res.players[res.players.length - 1].name;
    setPlayers(res.players);
    // ถ้าเปิดฟอร์มลงทะเบียนจากช่องผู้เล่น → เลือกชื่อให้สล็อตนั้นทันที
    if (registerBackTo) {
      slotSetterMap[registerBackTo]({ name });
      setRegisterBackTo(null);
    }
    return '';
  }

  function removePlayer(name: string) {
    setPlayers((ps) => deletePlayer(ps, name));
    setSlotA1((s) => (s.name === name ? { name: '' } : s));
    setSlotA2((s) => (s.name === name ? { name: '' } : s));
    setSlotB1((s) => (s.name === name ? { name: '' } : s));
    setSlotB2((s) => (s.name === name ? { name: '' } : s));
    if (shopFor === name) setShopFor(null);
    if (reelSlot && slotStateMap[reelSlot].name === name) setReelSlot(null);
    if (pickerSlot && slotStateMap[pickerSlot].name === name) setPickerSlot(null);
    showAlert(t('ลบผู้เล่น "{name}" เรียบร้อยแล้ว', { name }), false);
  }

  // ปุ่มในโมดอลลงทะเบียน: ร้านค้า / ลบ (ลบมี confirm กันกดพลาด)
  function rosterAction(name: string, action: RosterAction) {
    if (action === 'delete') {
      if (window.confirm(t('ลบผู้เล่น {name} พร้อมเหรียญและสกินทั้งหมด? ย้อนกลับไม่ได้', { name }))) {
        removePlayer(name);
      }
      return;
    }
    setShopFor(name);
    playSound('open');
  }

  // คลิกช่องตัวละคร → ตู้ Reel เปลี่ยนสกินอุปกรณ์ของผู้เล่นในช่องนั้น
  function openSlotReel(slotKey: PickerSlot) {
    if (!slotStateMap[slotKey].name) return showAlert(t('กรุณาเลือกผู้เล่นในช่องนี้ก่อน'));
    setReelSlot(slotKey);
    playSound('open');
  }

  // ลิงก์เปลี่ยนตัวละคร → โมดอลเลือกสกินตัวละคร
  function openSlotPicker(slotKey: PickerSlot) {
    if (!slotStateMap[slotKey].name) return showAlert(t('กรุณาเลือกผู้เล่นในช่องนี้ก่อน'));
    setPickerSlot(slotKey);
    playSound('open');
  }

  // เปิดฟอร์มลงทะเบียนจากช่องผู้เล่น (ลงทะเบียนเสร็จจะเลือกชื่อให้อัตโนมัติ)
  function openRegisterFor(slotKey: PickerSlot) {
    setRegisterBackTo(slotKey);
    setRegisterOpen(true);
    playSound('open');
  }

  // เลือกสกินตัวละคร → บันทึกเป็นค่าเริ่มต้นของผู้เล่นคนนั้น
  function pickCharacter(skin: Skin) {
    if (!pickerSlot) return;
    const name = slotStateMap[pickerSlot].name;
    if (!name) return;
    setPlayers((ps) => updateProfile(ps, name, { skinId: skin.id }));
    setPickerSlot(null);
    playSound('select');
  }

  // เลือกสกินอุปกรณ์จากตู้ Reel → บันทึกเป็นค่าเริ่มต้นของผู้เล่นคนนั้น
  function pickGear(kind: GearKind, gear: GearSkin) {
    if (!reelSlot) return;
    const name = slotStateMap[reelSlot].name;
    if (!name) return;
    setPlayers((ps) =>
      updateProfile(ps, name, kind === 'racket' ? { racketId: gear.id } : { shoeId: gear.id })
    );
    playSound('select');
  }

  // แตะสกินล็อคในรีล → เปิดร้านค้าของผู้เล่นคนนี้ (รีลยังเปิดอยู่)
  function lockedGearPick() {
    if (!reelSlot) return;
    const name = slotStateMap[reelSlot].name;
    if (!name) return;
    setShopFor(name);
    playSound('open');
  }

  // ซื้อสกินจากร้านค้าด้วยเหรียญรายบุคคล (100 เหรียญ/สกิน)
  function buyGear(gear: GearSkin) {
    if (!shopFor) return;
    const res = purchaseGear(players, shopFor, gear);
    if (!res.ok) return showAlert(t(res.error ?? 'ซื้อสกินไม่สำเร็จ'));
    setPlayers(res.players);
    playSound('success');
    showAlert(t('ปลดล็อค "{name}" สำเร็จ!', { name: t(gear.name) }), false);
  }

  // สลับประเภทการตี เดี่ยว/คู่ (สกินมาจากโปรไฟล์ของแต่ละคนอยู่แล้ว)
  function changeType(next: string) {
    setType(next);
  }

  function saveMatch() {
    const courtVal = court.trim() || '-';
    const isDoubles = type === 'คู่';
    const slots: PlayerSlot[] = isDoubles ? [slotA1, slotA2, slotB1, slotB2] : [slotA1, slotB1];
    const sA = parseInt(scoreA);
    const sB = parseInt(scoreB);

    if (players.length === 0)
      return showAlert(t('ยังไม่มีผู้เล่น — กด "＋ ลงทะเบียนผู้เล่นใหม่" ที่ช่องชื่อก่อน'));
    // ทุกช่องต้องเลือกผู้เล่นที่ลงทะเบียนไว้
    if (slots.some((s) => !s.name)) return showAlert(t('กรุณาเลือกผู้เล่นให้ครบทุกช่อง'));
    const names = slots.map((s) => s.name);
    if (new Set(names).size !== names.length)
      return showAlert(t('ผู้เล่นต้องไม่ซ้ำกันในแมตช์เดียวกัน'));
    const profs: PlayerProfile[] = [];
    for (const n of names) {
      const p = players.find((x) => x.name === n);
      if (!p) return showAlert(t('ไม่พบโปรไฟล์ผู้เล่น กรุณาลงทะเบียนใหม่'));
      profs.push(p);
    }
    const skinIds = profs.map((p) => p.skinId);
    if (new Set(skinIds).size !== skinIds.length)
      return showAlert(t('สกินตัวละครแต่ละคนต้องไม่ซ้ำกันในแมตช์เดียวกัน'));
    if (isNaN(sA) || isNaN(sB) || sA < 0 || sB < 0) return showAlert(t('กรุณากรอกคะแนนให้ถูกต้อง'));
    if (sA === sB) return showAlert(t('แบดมินตันไม่มีผลเสมอ กรุณาตรวจสอบคะแนน'));
    // แต้มที่กรอกห้ามเกินจำนวนแต้มที่เลือก (เกมละกี่แต้ม)
    if (sA > scoreCap || sB > scoreCap)
      return showAlert(
        t('แต้มห้ามเกิน {cap} — คุณเลือกเกมละ {max} แต้ม (กรอก {a}-{b} ไม่ได้)', {
          cap: scoreCap,
          max: maxScore,
          a: sA,
          b: sB,
        })
      );

    const playersA: PlayerInfo[] = isDoubles
      ? [
          { name: profs[0].name, skinId: profs[0].skinId, racketId: profs[0].racketId, shoeId: profs[0].shoeId },
          { name: profs[1].name, skinId: profs[1].skinId, racketId: profs[1].racketId, shoeId: profs[1].shoeId },
        ]
      : [{ name: profs[0].name, skinId: profs[0].skinId, racketId: profs[0].racketId, shoeId: profs[0].shoeId }];
    const playersB: PlayerInfo[] = isDoubles
      ? [
          { name: profs[2].name, skinId: profs[2].skinId, racketId: profs[2].racketId, shoeId: profs[2].shoeId },
          { name: profs[3].name, skinId: profs[3].skinId, racketId: profs[3].racketId, shoeId: profs[3].shoeId },
        ]
      : [{ name: profs[1].name, skinId: profs[1].skinId, racketId: profs[1].racketId, shoeId: profs[1].shoeId }];

    // ชื่อทีม: เดี่ยว = ชื่อผู้เล่น, คู่ = "ชื่อ1 / ชื่อ2"
    const teamAVal = isDoubles ? `${names[0]} / ${names[1]}` : names[0];
    const teamBVal = isDoubles ? `${names[2]} / ${names[3]}` : names[1];

    const matchData: Match = {
      id: matches.length + 1,
      court: courtVal,
      type,
      teamA: teamAVal,
      teamB: teamBVal,
      playersA,
      playersB,
      scoreA: sA,
      scoreB: sB,
      maxScore,
      date: matchDate || todayISO(),
    };

    const newMatches = [...matches, matchData];
    setMatches(newMatches);

    const newStats = { ...teamStats };
    if (!newStats[teamAVal]) newStats[teamAVal] = { name: teamAVal, played: 0, win: 0, lose: 0 };
    if (!newStats[teamBVal]) newStats[teamBVal] = { name: teamBVal, played: 0, win: 0, lose: 0 };
    newStats[teamAVal] = { ...newStats[teamAVal], played: newStats[teamAVal].played + 1 };
    newStats[teamBVal] = { ...newStats[teamBVal], played: newStats[teamBVal].played + 1 };
    if (sA > sB) {
      newStats[teamAVal] = { ...newStats[teamAVal], win: newStats[teamAVal].win + 1 };
      newStats[teamBVal] = { ...newStats[teamBVal], lose: newStats[teamBVal].lose + 1 };
    } else {
      newStats[teamBVal] = { ...newStats[teamBVal], win: newStats[teamBVal].win + 1 };
      newStats[teamAVal] = { ...newStats[teamAVal], lose: newStats[teamAVal].lose + 1 };
    }
    setTeamStats(newStats);

    // บันทึกลงเบราว์เซอร์
    saveDataToLocal(newMatches, newStats);

    setScoreA('');
    setScoreB('');
    setMatchDate(todayISO()); // รีเซ็ตกลับเป็นวันนี้สำหรับแมตช์ถัดไป

    // เหรียญรายบุคคล: ชนะ +7 / แพ้ +3 / ชนะขาด (แพ้ < 5 แต้ม หรือ ห่าง ≥ 15 แต้ม) ผู้ชนะได้ +10 แทน +7
    const split = isDoubles ? 2 : 1;
    const winnerNames = sA > sB ? names.slice(0, split) : names.slice(split);
    const loserNames = sA > sB ? names.slice(split) : names.slice(0, split);
    const coins = calcMatchCoins(Math.max(sA, sB), Math.min(sA, sB));
    setPlayers((ps) => awardCoins(ps, winnerNames, loserNames, coins.winCoins, coins.loseCoins).players);
    showAlert(
      coins.crush
        ? t(
            'บันทึกผลสำเร็จ! ชนะขาด {hi}-{lo} 🔥 ชนะ: {winners} +{wc} เหรียญ • แพ้: {losers} +{lc} เหรียญ',
            {
              hi: Math.max(sA, sB),
              lo: Math.min(sA, sB),
              winners: winnerNames.join(', '),
              wc: coins.winCoins,
              losers: loserNames.join(', '),
              lc: coins.loseCoins,
            }
          )
        : t('บันทึกผลสำเร็จ! ชนะ: {winners} +{wc} เหรียญ • แพ้: {losers} +{lc} เหรียญ', {
            winners: winnerNames.join(', '),
            wc: coins.winCoins,
            losers: loserNames.join(', '),
            lc: coins.loseCoins,
          }),
      false
    );
    // (ไม่สุ่มเมนูอาหารอัตโนมัติหลังบันทึกผล — กดปุ่มสุ่มเมนูบน HUD เองเมื่อไหร่ก็ได้)

    // รีเซ็ตผลจับเหรียญเสิร์ฟสำหรับแมตช์ถัดไป
    setServeTeam(null);
    setFlipState('idle');
    setFlipFace('A');
  }

  async function downloadAsImage() {
    const content = exportableRef.current;
    if (!content) return;
    const originalOverflow = content.style.overflow;
    const originalMaxHeight = content.style.maxHeight;

    content.style.overflow = 'visible';
    content.style.maxHeight = 'none';

    try {
      // ใช้ html2canvas-pro เพราะรองรับสี oklch/lab ของ Tailwind v4 (html2canvas ตัวเดิม parse ไม่ได้)
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(content, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'badminton_summary.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      content.style.overflow = originalOverflow;
      content.style.maxHeight = originalMaxHeight;
    }
  }

  // อันดับ (เรียงตาม Win Rate)
  const rankedTeams: RankedTeam[] = Object.values(teamStats)
    .map((t) => ({ ...t, winRate: (t.win / t.played) * 100 }))
    .sort((a, b) => b.winRate - a.winRate || b.win - a.win);

  const summaryTeams: RankedTeam[] = Object.values(teamStats)
    .map((t) => ({ ...t, winRate: (t.win / t.played) * 100 }))
    .sort((a, b) => b.winRate - a.winRate);

  // โปรไฟล์ + ตัวละครและอุปกรณ์ของทุกสล็อต (ดึงจากโปรไฟล์ผู้เล่นที่เลือก)
  const profA1 = profileOf(slotA1);
  const profA2 = profileOf(slotA2);
  const profB1 = profileOf(slotB1);
  const profB2 = profileOf(slotB2);
  const skinA1 = profA1 ? getSkin(profA1.skinId) : undefined;
  const skinA2 = profA2 ? getSkin(profA2.skinId) : undefined;
  const skinB1 = profB1 ? getSkin(profB1.skinId) : undefined;
  const skinB2 = profB2 ? getSkin(profB2.skinId) : undefined;
  const racketA1 = profA1 ? getGear(profA1.racketId) : undefined;
  const shoeA1 = profA1 ? getGear(profA1.shoeId) : undefined;
  const racketA2 = profA2 ? getGear(profA2.racketId) : undefined;
  const shoeA2 = profA2 ? getGear(profA2.shoeId) : undefined;
  const racketB1 = profB1 ? getGear(profB1.racketId) : undefined;
  const shoeB1 = profB1 ? getGear(profB1.shoeId) : undefined;
  const racketB2 = profB2 ? getGear(profB2.racketId) : undefined;
  const shoeB2 = profB2 ? getGear(profB2.shoeId) : undefined;
  const isDoublesType = type === 'คู่';

  // สกินที่ถูกผู้เล่นอื่นในแมตช์นี้ใช้อยู่ (สำหรับล็อกในโมดอลเลือกสกิน)
  const skinIdBySlot: Record<PickerSlot, string> = {
    A1: profA1?.skinId ?? '',
    A2: profA2?.skinId ?? '',
    B1: profB1?.skinId ?? '',
    B2: profB2?.skinId ?? '',
  };
  const gearIdBySlot: Record<PickerSlot, { racketId: string; shoeId: string }> = {
    A1: { racketId: profA1?.racketId ?? 'r1', shoeId: profA1?.shoeId ?? 's1' },
    A2: { racketId: profA2?.racketId ?? 'r1', shoeId: profA2?.shoeId ?? 's1' },
    B1: { racketId: profB1?.racketId ?? 'r1', shoeId: profB1?.shoeId ?? 's1' },
    B2: { racketId: profB2?.racketId ?? 'r1', shoeId: profB2?.shoeId ?? 's1' },
  };
  const activeSlots: PickerSlot[] = isDoublesType ? ['A1', 'A2', 'B1', 'B2'] : ['A1', 'B1'];
  const pickerExcludeIds = activeSlots
    .filter((k) => k !== pickerSlot)
    .map((k) => skinIdBySlot[k]);

  // แต้มสูงสุดของเกม (จากตัวเลือก "เกมละกี่แต้ม") — ตัวเลขที่กรอกห้ามเกินนี้
  const scoreCap = parseInt(maxScore, 10) || 21;
  // สกิน HUD ที่เลือก + ชื่อทีมสำหรับโชว์บน HUD
  const hudSkin = getHudSkin(hudSkinId);
  const hudTeamAName =
    (isDoublesType ? [slotA1.name, slotA2.name] : [slotA1.name]).filter(Boolean).join(' / ') ||
    t('ทีม A');
  const hudTeamBName =
    (isDoublesType ? [slotB1.name, slotB2.name] : [slotB1.name]).filter(Boolean).join(' / ') ||
    t('ทีม B');

  // แผนที่: ชื่อทีม → รายชื่อผู้เล่น (ใช้แสดงอวตารในอันดับ/สรุป, แมตช์ล่าสุดมีน้ำหนักสุดท้าย)
  const teamPlayersMap: Record<string, PlayerInfo[]> = {};
  for (const m of matches) {
    if (m.playersA?.length) teamPlayersMap[m.teamA] = m.playersA;
    if (m.playersB?.length) teamPlayersMap[m.teamB] = m.playersB;
  }

  const inputBase = `w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-current ${hudSkin.chip}`;

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div
      className={`min-h-screen ${hudSkin.page}`}
      style={{ fontFamily: "'Noto Sans Thai', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* ===== Navbar ===== */}
      <nav className={`sticky top-0 z-40 ${hudSkin.nav}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto justify-center sm:justify-start">
            <span
              className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center shrink-0"
              role="img"
              aria-label={t('แบดมินตัน')}
            >
              <ShuttlecockIcon className="h-5 w-5 text-[#d9e7d9]" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold truncate leading-tight">
                {t('บันทึกสถิติแบดมินตัน')}
              </h1>
              <p className="hidden sm:block text-xs text-white/70 leading-tight">
                {t('ระบบเก็บสถิติการแข่งขัน • Badminton Stats')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mx-auto sm:mx-0">
            {/* ปุ่มสลับภาษา ไทย / English — อยู่บนสุดของหน้า (navbar) จำค่าไว้ใน localStorage */}
            <div
              role="group"
              aria-label={t('ภาษา / Language')}
              className="flex items-center rounded-xl overflow-hidden border border-white/25 bg-white/5"
            >
              <button
                onClick={() => setLang('th')}
                aria-pressed={lang === 'th'}
                title="ไทย — กดเพื่อสลับเป็นภาษาไทย"
                className={`h-9 px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  lang === 'th' ? 'bg-white/30 text-white' : 'hover:bg-white/15 text-white/80'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                title="English — switch to English"
                className={`h-9 px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-white/30 text-white' : 'hover:bg-white/15 text-white/80'
                }`}
              >
                EN
              </button>
            </div>
            {/* ลงทะเบียน/จัดการผู้เล่น — เหรียญและสกินเป็นของรายบุคคล */}
            <button
              onClick={() => {
                setRegisterOpen(true);
                setRegisterBackTo(null);
                playSound('open');
              }}
              aria-label={t('ลงทะเบียนผู้เล่น')}
              title={t('ลงทะเบียน/จัดการผู้เล่น — เหรียญและสกินเป็นของรายบุคคล')}
              className="bg-white/8 hover:bg-white/14 border border-white/15 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-1.5"
            >
              <i className="fa-solid fa-user-group"></i>
              <span className="hidden sm:inline">{t('ผู้เล่น')}</span>
              <span className="bg-white/15 rounded-md px-1.5 text-xs font-medium tabular-nums">
                {mounted ? players.length : '–'}
              </span>
            </button>
            {/* กฎกติกา & วิธีได้เหรียญ */}
            <button
              onClick={() => {
                setRulesOpen(true);
                playSound('open');
              }}
              aria-label={t('กฎกติกาและวิธีได้เหรียญ')}
              title={t('กฎกติกาและวิธีได้เหรียญ — ชนะ +7 / ชนะขาด +10 / แพ้ +3')}
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white w-9 h-9 rounded-xl transition flex items-center justify-center text-sm"
            >
              <i className="fa-solid fa-circle-question"></i>
            </button>
            {/* โหมดการแสดงผลของจอ: แนวตั้ง / แนวนอน */}
            <div
              role="group"
              aria-label={t('โหมดการแสดงผลของจอ')}
              className="flex items-center rounded-xl overflow-hidden border border-white/25 bg-white/5"
            >
              <button
                onClick={() => setDisplayMode('portrait')}
                aria-pressed={disp === 'portrait'}
                title={t('โหมดแนวตั้ง — เลย์เอาต์แคบแบบมือถือ')}
                className={`w-9 h-9 transition flex items-center justify-center text-sm cursor-pointer ${
                  disp === 'portrait' ? 'bg-white/30 text-white' : 'hover:bg-white/15 text-white/80'
                }`}
              >
                <i className="fa-solid fa-mobile-screen-button"></i>
              </button>
              <button
                onClick={() => setDisplayMode('landscape')}
                aria-pressed={disp === 'landscape'}
                title={t('โหมดแนวนอน — เลย์เอาต์กว้าง 3 คอลัมน์')}
                className={`w-9 h-9 transition flex items-center justify-center text-sm cursor-pointer ${
                  disp === 'landscape' ? 'bg-white/30 text-white' : 'hover:bg-white/15 text-white/80'
                }`}
              >
                <i className="fa-solid fa-display"></i>
              </button>
            </div>
            {/* ปุ่มเปิด/ปิดเสียง */}
            <button
              onClick={toggleSound}
              aria-label={soundMuted ? t('เปิดเสียงเอฟเฟกต์') : t('ปิดเสียงเอฟเฟกต์')}
              title={soundMuted ? t('เปิดเสียงเอฟเฟกต์') : t('ปิดเสียงเอฟเฟกต์')}
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white w-9 h-9 rounded-xl transition flex items-center justify-center text-sm"
            >
              <i className={`fa-solid ${soundMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
            </button>
            {/* ปุ่มสลับธีม light/dark */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? t('สลับเป็นโหมดสว่าง') : t('สลับเป็นโหมดมืด')}
              title={isDark ? t('โหมดสว่าง') : t('โหมดมืด')}
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white w-9 h-9 rounded-xl transition flex items-center justify-center text-sm"
            >
              <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button
              onClick={requestClearData}
              aria-label={t('ล้างข้อมูลสถิติทั้งหมด (ยืนยันก่อนลบ)')}
              title={t('ล้างข้อมูลสถิติทั้งหมด (ยืนยันก่อนลบ)')}
              className="bg-white/10 hover:bg-rose-500 border border-white/25 text-white px-3 py-2 rounded-xl font-semibold transition text-sm flex items-center gap-1.5"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span className="hidden sm:inline">{t('ล้างข้อมูล')}</span>
            </button>
            <button
              onClick={() => {
                setModalOpen(true);
                playSound('open');
              }}
              className={`${hudSkin.btn} px-3 py-2 font-semibold transition-colors text-sm flex items-center gap-1.5`}
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span className="hidden sm:inline">{t('สรุปภาพรวม')}</span>
            </button>
          </div>
        </div>
      </nav>

      <main
        className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 gap-6 ${
          disp === 'landscape' ? 'max-w-7xl lg:grid-cols-3' : 'max-w-lg'
        }`}
      >
        {/* ===== ฝั่งซ้าย: ฟอร์มกรอกข้อมูล ===== */}
        <section
          className={`${
            disp === 'landscape' ? 'lg:col-span-2' : ''
          } ${hudSkin.panel} p-5 sm:p-6`}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className={`w-9 h-9 ${hudSkin.panelIcon} flex items-center justify-center shrink-0`}>
              <i className="fa-solid fa-pen-to-square text-sm"></i>
            </span>
            <div>
              <h2 className={`${hudSkin.heading} text-lg font-semibold leading-tight`}>
                {t('บันทึกผลการแข่งขัน')}
              </h2>
              <p className="text-xs text-gray-400">
                {t(
                  'เลือกชื่อผู้เล่นที่ลงทะเบียนไว้ (สกินตามโปรไฟล์) • กดช่องตัวละครเปิดตู้ Reel เปลี่ยนสกินอุปกรณ์ได้เลย'
                )}
              </p>
            </div>
          </div>

          {/* ===== HUD สกอร์บอร์ดสด (เลือกสกินได้ 5 แบบ) + จับเหรียญเสิร์ฟก่อน ===== */}
          <ScoreHud
            skin={hudSkin}
            teamAName={hudTeamAName}
            teamBName={hudTeamBName}
            scoreA={scoreA}
            scoreB={scoreB}
            maxScore={maxScore}
            serveTeam={serveTeam}
            flipState={flipState}
            flipFace={flipFace}
            onFlip={flipCoin}
            onFoodRoll={rollFood}
            onPickSkin={pickHudSkin}
          />

          {/* ข้อมูลแมตช์ */}
          <div className={`grid grid-cols-1 gap-4 mb-5 ${disp === 'landscape' ? 'sm:grid-cols-3' : ''}`}>
            <div>
              <label htmlFor="court" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                <i className="fa-solid fa-location-dot text-gray-400 mr-1"></i>
                {t('ชื่อสนาม')}
              </label>
              <input
                type="text"
                id="court"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className={inputBase}
                placeholder={t('เช่น คอร์ท 1')}
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                <i className="fa-solid fa-user-group text-gray-400 mr-1"></i>
                {t('ประเภทการตี')}
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => changeType(e.target.value)}
                className={`${inputBase} cursor-pointer`}
              >
                <option value="เดี่ยว">{t('เดี่ยว (Singles)')}</option>
                <option value="คู่">{t('คู่ (Doubles)')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="matchDate" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                <i className="fa-regular fa-calendar-days text-gray-400 mr-1"></i>
                {t('วัน/เดือน/ปี')}
              </label>
              <input
                type="date"
                id="matchDate"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className={`${inputBase} cursor-pointer`}
              />
            </div>
          </div>

          {/* คะแนนสองทีม */}
          <div className={`relative grid grid-cols-1 gap-4 mb-6 ${disp === 'landscape' ? "md:grid-cols-2 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-1/2 before:hidden before:z-10 before:pointer-events-none md:before:block md:before:border-l md:before:border-dashed md:before:border-[#cfd9cf] dark:md:before:border-[#414d42]" : ''}`}>
            <div className={`${hudSkin.card} p-4`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`w-6 h-6 rounded-md text-xs font-medium flex items-center justify-center ${hudSkin.panelIcon}`}>
                  A
                </span>
                <h3 className={`font-semibold ${hudSkin.nameA}`}>{t('ทีม A')}</h3>
                {serveTeam === 'A' && (
                  <span className="text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-md px-2 py-0.5 flex items-center gap-1">
                    <ShuttlecockIcon className="w-3 h-3" />
                    {t('เสิร์ฟก่อน')}
                  </span>
                )}
                {isDoublesType && (
                  <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${hudSkin.chip}`}>
                    {t('เล่นคู่')}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <PlayerSlotField
                  id="playerA1"
                  label={t('ผู้เล่น 1')}
                  slot={slotA1}
                  profile={profA1}
                  players={players}
                  takenNames={activeSlots.filter((k) => k !== 'A1').map((k) => slotStateMap[k].name)}
                  accent="blue"
                  onSelectName={(v) => setSlotA1({ name: v })}
                  onOpenPicker={() => openSlotPicker('A1')}
                  onOpenReel={() => openSlotReel('A1')}
                  onOpenRegister={() => openRegisterFor('A1')}
                  hudSkin={hudSkin}
                />
                {isDoublesType && (
                  <PlayerSlotField
                    id="playerA2"
                    label={t('ผู้เล่น 2')}
                    slot={slotA2}
                    profile={profA2}
                    players={players}
                    takenNames={activeSlots.filter((k) => k !== 'A2').map((k) => slotStateMap[k].name)}
                    accent="blue"
                    onSelectName={(v) => setSlotA2({ name: v })}
                    onOpenPicker={() => openSlotPicker('A2')}
                    onOpenReel={() => openSlotReel('A2')}
                    onOpenRegister={() => openRegisterFor('A2')}
                    hudSkin={hudSkin}
                  />
                )}
              </div>
              <label htmlFor="scoreA" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 mt-3">
                {t('แต้มที่ได้ (ห้ามเกิน {max})', { max: maxScore })}
              </label>
              <input
                type="number"
                id="scoreA"
                min={0}
                max={scoreCap}
                value={scoreA}
                onChange={(e) => setScoreA(clampScoreStr(e.target.value, scoreCap))}
                className={`w-full rounded-lg px-3 py-2 text-center text-2xl font-semibold tabular-nums outline-none transition-colors focus:ring-2 focus:ring-current ${hudSkin.chip}`}
                placeholder="0"
              />
            </div>

            <div className={`${hudSkin.card} p-4`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`w-6 h-6 rounded-md text-xs font-medium flex items-center justify-center ${hudSkin.panelIcon}`}>
                  B
                </span>
                <h3 className={`font-semibold ${hudSkin.nameB}`}>{t('ทีม B')}</h3>
                {serveTeam === 'B' && (
                  <span className="text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-md px-2 py-0.5 flex items-center gap-1">
                    <ShuttlecockIcon className="w-3 h-3" />
                    {t('เสิร์ฟก่อน')}
                  </span>
                )}
                {isDoublesType && (
                  <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${hudSkin.chip}`}>
                    {t('เล่นคู่')}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <PlayerSlotField
                  id="playerB1"
                  label={t('ผู้เล่น 1')}
                  slot={slotB1}
                  profile={profB1}
                  players={players}
                  takenNames={activeSlots.filter((k) => k !== 'B1').map((k) => slotStateMap[k].name)}
                  accent="rose"
                  onSelectName={(v) => setSlotB1({ name: v })}
                  onOpenPicker={() => openSlotPicker('B1')}
                  onOpenReel={() => openSlotReel('B1')}
                  onOpenRegister={() => openRegisterFor('B1')}
                  hudSkin={hudSkin}
                />
                {isDoublesType && (
                  <PlayerSlotField
                    id="playerB2"
                    label={t('ผู้เล่น 2')}
                    slot={slotB2}
                    profile={profB2}
                    players={players}
                    takenNames={activeSlots.filter((k) => k !== 'B2').map((k) => slotStateMap[k].name)}
                    accent="rose"
                    onSelectName={(v) => setSlotB2({ name: v })}
                    onOpenPicker={() => openSlotPicker('B2')}
                    onOpenReel={() => openSlotReel('B2')}
                    onOpenRegister={() => openRegisterFor('B2')}
                    hudSkin={hudSkin}
                  />
                )}
              </div>
              <label htmlFor="scoreB" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 mt-3">
                {t('แต้มที่ได้ (ห้ามเกิน {max})', { max: maxScore })}
              </label>
              <input
                type="number"
                id="scoreB"
                min={0}
                max={scoreCap}
                value={scoreB}
                onChange={(e) => setScoreB(clampScoreStr(e.target.value, scoreCap))}
                className={`w-full rounded-lg px-3 py-2 text-center text-2xl font-semibold tabular-nums outline-none transition-colors focus:ring-2 focus:ring-current ${hudSkin.chip}`}
                placeholder="0"
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="maxScore" className="font-medium text-gray-500 dark:text-gray-400">
                <i className="fa-solid fa-flag text-gray-400 mr-1.5"></i>
                {t('เกมละกี่แต้ม:')}
              </label>
              <select
                id="maxScore"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none cursor-pointer transition-colors focus:ring-2 ${hudSkin.chip}`}
              >
                <option value="21">{t('21 แต้ม')}</option>
                <option value="15">{t('15 แต้ม')}</option>
              </select>
            </div>
            <button
              onClick={saveMatch}
              className={`${hudSkin.btn} w-full sm:w-auto px-7 py-2.5 transition flex items-center justify-center gap-2 active:scale-[0.98]`}
            >
              <i className="fa-solid fa-floppy-disk"></i> {t('บันทึกผล')}
            </button>
          </div>

          {alertMsg && (
            <div
              role="alert"
              className={`mt-4 p-3 rounded-xl text-sm text-center font-semibold flex items-center justify-center gap-2 ${
                alertMsg.isError
                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900'
                  : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
              }`}
            >
              <i className={`fa-solid ${alertMsg.isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
              {alertMsg.msg}
            </div>
          )}

          {/* ===== ลูกเล่นหลังตีแบต: คิดตังค่าสนาม / จระเข้กดนิ้ว / HI-LO / ดีโน่รัน ===== */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-7 h-7 ${hudSkin.panelIcon} flex items-center justify-center shrink-0`}>
                <i className="fa-solid fa-dice text-xs"></i>
              </span>
              <div>
              <h3 className={`${hudSkin.heading} text-sm font-semibold leading-tight`}>{t('ลูกเล่นหลังตีแบต')}</h3>
                <p className="text-xs text-gray-400">{t('คิดตังค่าสนาม • จระเข้กดนิ้ว • HI-LO • ดีโน่รัน')}</p>
              </div>
            </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFeeOpen(true);
                  playSound('open');
                }}
                title={t('คิดตังค่าสนาม — ใส่ราคารวมค่าคอร์ทและจำนวนคนที่จะหาร')}
                className={`${hudSkin.chip} rounded-lg px-2 py-3 flex flex-col items-center gap-1 text-xs font-medium leading-tight text-center transition-colors active:scale-[0.98] cursor-pointer`}
              >
                <i className="fa-solid fa-calculator text-base" aria-hidden="true"></i>
                {t('คิดตังค่าสนาม')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCrocOpen(true);
                  playSound('open');
                }}
                title={t('มินิเกมจระเข้กดนิ้ว — ผลัดกันกดฟัน ซี่ไหนเจอฟันเสียจะโดนกัด')}
                className={`${hudSkin.chip} rounded-lg px-2 py-3 flex flex-col items-center gap-1 text-xs font-medium leading-tight text-center transition-colors active:scale-[0.98] cursor-pointer`}
              >
                <i className="fa-solid fa-dragon text-base" aria-hidden="true"></i>
                {t('จระเข้กดนิ้ว')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHiloOpen(true);
                  playSound('open');
                }}
                title={t('มินิเกม HI-LO — ทายว่าไพ่ต่อไปสูงกว่าหรือต่ำกว่า')}
                className={`${hudSkin.chip} rounded-lg px-2 py-3 flex flex-col items-center gap-1 text-xs font-medium leading-tight text-center transition-colors active:scale-[0.98] cursor-pointer`}
              >
                <i className="fa-solid fa-clone text-base" aria-hidden="true"></i>
                HI-LO
              </button>
              <button
                type="button"
                onClick={() => {
                  setDinoOpen(true);
                  playSound('open');
                }}
                title={t('มินิเกมดีโน่รัน — กด SPACE หรือแตะจอเพื่อกระโดดหลบแคคตัส เก็บคะแนนสูงสุด')}
                className={`${hudSkin.chip} rounded-lg px-2 py-3 flex flex-col items-center gap-1 text-xs font-medium leading-tight text-center transition-colors active:scale-[0.98] cursor-pointer`}
              >
                <i className="fa-solid fa-person-running text-base" aria-hidden="true"></i>
                {t('ดีโน่รัน')}
              </button>
            </div>
          </div>
        </section>

        {/* ===== ฝั่งขวา: ตารางอันดับ ===== */}
        <aside className={`${hudSkin.panel} p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-center gap-3 mb-5">
            <span className={`w-9 h-9 ${hudSkin.panelIcon} flex items-center justify-center shrink-0`}>
              <i className="fa-solid fa-trophy text-sm"></i>
            </span>
            <div>
              <h2 className={`${hudSkin.heading} text-lg font-semibold leading-tight`}>{t('ตารางอันดับ')}</h2>
              <p className="text-xs text-gray-400">{t('จัดอันดับตาม Win Rate แบบเรียลไทม์')}</p>
            </div>
          </div>

          {rankedTeams.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl dark:border-gray-700">
              <span className={`mb-3 ${hudSkin.nameA}`} role="img" aria-label={t('แบดมินตัน')}>
                <ShuttlecockIcon className="h-8 w-8" />
              </span>
              <p className="text-gray-400 text-sm font-semibold">{t('ยังไม่มีข้อมูล')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('เริ่มบันทึกผลการแข่งขัน')}</p>
            </div>
          ) : (
            <ol className="space-y-2.5">
              {rankedTeams.map((team, index) => (
                <li
                  key={team.name}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${hudSkin.card}`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${rankBadgeClass(index)}`}
                  >
                    {index < 3 ? <i className="fa-solid fa-medal"></i> : index + 1}
                  </span>
                  <TeamPlayersAvatar players={teamPlayersMap[team.name]} name={team.name} size={26} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{team.name}</p>
                      <span className={`text-sm font-semibold shrink-0 tabular-nums ${hudSkin.nameA}`}>
                        {team.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-0.5">
                      <span>{t('แข่ง {n} แมตช์', { n: team.played })}</span>
                      <span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{team.win}W</span>
                        {' - '}
                        <span className="text-rose-500 dark:text-rose-400 font-medium">{team.lose}L</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${hudSkin.serve}`}
                        style={{ width: `${team.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </main>

      {/* ===== Modal สรุปภาพรวม ===== */}
      <div
        id="summaryModal"
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 justify-center items-center p-4 ${
          modalOpen ? 'flex' : 'hidden'
        }`}
      >
        <div className={`${hudSkin.modalCard} w-full ${disp === 'landscape' ? 'max-w-5xl' : 'max-w-3xl'} max-h-[90vh] flex flex-col overflow-hidden`}>
          {/* หัวโมดอล */}
          <div className={`flex justify-between items-center px-5 py-4 border-b border-gray-200 ${hudSkin.page}`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${hudSkin.panelIcon}`}>
                <i className="fa-solid fa-chart-pie"></i>
              </span>
              <div className="min-w-0">
                <h2 className={`text-xl font-semibold leading-tight truncate ${hudSkin.heading}`}>
                  {t('สรุปภาพรวมทั้งหมด')}
                </h2>
                <p className="text-xs text-gray-400">{t('สถิติทุกทีมและประวัติการแข่งขัน')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={downloadAsImage}
                className={`${hudSkin.btn} px-4 py-2 font-semibold text-sm transition`}
              >
                <i className="fa-solid fa-camera mr-1.5"></i>
                {t('เซฟเป็นรูป')}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                aria-label={t('ปิดหน้าต่าง')}
                className={`w-9 h-9 rounded-lg transition-colors flex items-center justify-center ${hudSkin.chip}`}
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          {/* เนื้อหาในโมดอล */}
          <div
            id="exportableArea"
            ref={exportableRef}
            className={`overflow-y-auto p-5 space-y-8 flex-grow ${hudSkin.page}`}
          >
            {/* แท่นรับเหรียญรางวัล อันดับ 1-3 */}
            <Podium teams={summaryTeams} playersMap={teamPlayersMap} />

            {/* สถิติแต่ละทีม */}
            <section>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-users text-gray-500 dark:text-gray-400"></i>
                {t('สถิติแต่ละทีม')}
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t('• วงกลม Win Rate')}</span>
              </h3>
              <div id="teamStatsCards" className={`grid grid-cols-1 gap-4 ${disp === 'landscape' ? 'md:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {summaryTeams.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl dark:border-gray-700">
                    <i className="fa-solid fa-chart-simple text-2xl mb-2 block"></i>
                    {t('ยังไม่มีข้อมูลสถิติ')}
                  </div>
                ) : (
                  summaryTeams.map((team) => (
                      <div
                        key={team.name}
                        className={`relative rounded-xl p-4 transition-colors overflow-hidden ${hudSkin.card}`}
                      >
                        {/* อินโฟกราฟิก: วงกลม Win Rate */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${hudSkin.panelIcon}`}>
                            <TeamPlayersAvatar players={teamPlayersMap[team.name]} name={team.name} size={32} />
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-tight truncate">
                              {team.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">{t('แข่งทั้งหมด {n} แมตช์', { n: team.played })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="shrink-0">
                            <WinRateRing
                              pct={team.winRate}
                              size={92}
                              track={isDark ? '#374151' : '#e5e7eb'}
                              text={isDark ? '#e5e7eb' : '#334155'}
                            />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-emerald-50 ring-1 ring-emerald-100 text-emerald-700 rounded-xl py-2 dark:bg-emerald-950/60 dark:ring-emerald-900 dark:text-emerald-300">
                              <div className="text-xs">{t('ชนะ')}</div>
                              <div className="font-semibold text-lg leading-tight tabular-nums">{team.win}</div>
                            </div>
                            <div className="bg-rose-50 ring-1 ring-rose-100 text-rose-600 rounded-xl py-2 dark:bg-rose-950/50 dark:ring-rose-900 dark:text-rose-300">
                              <div className="text-xs">{t('แพ้')}</div>
                              <div className="font-semibold text-lg leading-tight tabular-nums">{team.lose}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                  ))
                )}
              </div>
            </section>

            {/* ประวัติการแข่งขัน */}
            <section>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-gray-500 dark:text-gray-400"></i>
                {t('ประวัติการแข่งขัน (Match History)')}
              </h3>
              <div className={`overflow-x-auto rounded-xl ${hudSkin.card}`}>
                <table className="w-full text-sm text-left">
                  <thead className={`text-xs font-medium ${hudSkin.chip}`}>
                    <tr>
                      <th className="p-3">{t('แมตช์')}</th>
                      <th className="p-3">{t('วันที่')}</th>
                      <th className="p-3">{t('สนาม')}</th>
                      <th className="p-3">{t('ประเภท')}</th>
                      <th className="p-3 text-right">{t('ทีม A')}</th>
                      <th className="p-3 text-center">{t('คะแนน')}</th>
                      <th className="p-3 text-left">{t('ทีม B')}</th>
                      <th className="p-3 text-center">{t('แต้มจบ')}</th>
                    </tr>
                  </thead>
                  <tbody id="historyBody" className="divide-y divide-gray-100 dark:divide-gray-800">
                    {matches.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-400">
                          <i className="fa-regular fa-folder-open text-2xl mb-2 block"></i>
                          {t('ยังไม่มีประวัติการแข่งขัน')}
                        </td>
                      </tr>
                    ) : (
                      [...matches].reverse().map((m) => {
                        const aClass =
                          m.scoreA > m.scoreB
                            ? 'font-bold text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 dark:text-gray-400';
                        const bClass =
                          m.scoreB > m.scoreA
                            ? 'font-bold text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 dark:text-gray-400';

                        return (
                          <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/60">
                            <td className="p-3 text-center font-medium tabular-nums text-gray-400">#{m.id}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${hudSkin.chip}`}>
                                <i className="fa-regular fa-calendar-days text-xs"></i>
                                {formatMatchDate(m.date, lang)}
                              </span>
                            </td>
                            <td className="p-3 dark:text-gray-200">{m.court}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium dark:bg-gray-800 dark:text-gray-300">
                                {t(m.type)}
                              </span>
                            </td>
                            <td className={`p-3 text-right ${aClass}`}>
                              <span className="inline-flex items-center justify-end gap-1.5">
                                <TeamPlayersAvatar players={m.playersA} name={m.teamA} size={18} />
                                {m.teamA}
                              </span>
                            </td>
                            <td className="p-3 text-center font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                              {m.scoreA} - {m.scoreB}
                            </td>
                            <td className={`p-3 text-left ${bClass}`}>
                              <span className="inline-flex items-center justify-start gap-1.5">
                                <TeamPlayersAvatar players={m.playersB} name={m.teamB} size={18} />
                                {m.teamB}
                              </span>
                            </td>
                            <td className="p-3 text-center text-xs text-gray-400">{t('{n} แต้ม', { n: m.maxScore })}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* ท้ายโมดอล */}
          <div className={`px-5 py-4 border-t border-gray-200 flex justify-end ${hudSkin.page}`}>
            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition"
            >
              {t('ปิดหน้าต่าง')}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Modal เลือกสกินตัวละคร 8-bit (30 สกิน) ===== */}
      <CharacterPicker
        key={`picker-${pickerSlot ?? 'closed'}`}
        open={pickerSlot !== null}
        slot={pickerSlot}
        playerName={pickerSlot ? slotStateMap[pickerSlot].name : ''}
        currentId={pickerSlot ? skinIdBySlot[pickerSlot] : ''}
        excludeIds={pickerExcludeIds}
        hudSkin={hudSkin}
        onPick={pickCharacter}
        onClose={() => setPickerSlot(null)}
      />

      {/* ===== Modal ตู้ Reel เปลี่ยนสกินไม้แบด/รองเท้าแบด ===== */}
      <SkinReel
        key={`reel-${reelSlot ?? 'closed'}`}
        open={reelSlot !== null}
        slotLabel={
          reelSlot
            ? t('ทีม {team} • ผู้เล่น {no}', { team: reelSlot[0], no: reelSlot[1] })
            : ''
        }
        playerName={reelSlot ? slotStateMap[reelSlot].name : ''}
        skin={reelSlot ? getSkin(skinIdBySlot[reelSlot]) : undefined}
        currentRacketId={reelSlot ? gearIdBySlot[reelSlot].racketId : 'r1'}
        currentShoeId={reelSlot ? gearIdBySlot[reelSlot].shoeId : 's1'}
        coins={reelSlot ? profileOf(slotStateMap[reelSlot])?.coins ?? 0 : 0}
        unlockedIds={reelSlot ? profileOf(slotStateMap[reelSlot])?.owned ?? [] : []}
        hudSkin={hudSkin}
        onPick={pickGear}
        onLockedPick={lockedGearPick}
        onOpenShop={() => {
          if (!reelSlot) return;
          const name = slotStateMap[reelSlot].name;
          if (name) setShopFor(name);
        }}
        onClose={() => setReelSlot(null)}
        onTick={() => playSound('tick')}
      />

      {/* ===== Modal ลงทะเบียนผู้เล่น (ชื่ออย่างเดียว) ===== */}
      <RegisterModal
        key={registerOpen ? 'register-open' : 'register-closed'}
        open={registerOpen}
        players={players}
        skin={hudSkin}
        onRegister={handleRegister}
        onPlayerAction={rosterAction}
        onClose={() => {
          setRegisterOpen(false);
          setRegisterBackTo(null);
        }}
      />

      {/* ===== Modal ร้านค้าสกิน (ปลดล็อคด้วยเหรียญรายบุคคล) ===== */}
      <ShopModal
        key={`shop-${shopFor ?? 'closed'}`}
        open={shopFor !== null}
        playerName={shopFor ?? ''}
        coins={shopFor ? players.find((p) => p.name === shopFor)?.coins ?? 0 : 0}
        unlockedIds={shopFor ? players.find((p) => p.name === shopFor)?.owned ?? [] : []}
        skin={hudSkin}
        onBuy={buyGear}
        onClose={() => setShopFor(null)}
      />

      {/* ===== Modal กฎกติกา & วิธีได้เหรียญ ===== */}
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} skin={hudSkin} />

      {/* ===== Popup จับเหรียญเสิร์ฟก่อน — เหรียญใหญ่เด้งกลางจอ ===== */}
      <FlipCoinModal
        open={flipOpen}
        state={flipState === 'idle' ? 'flipping' : flipState}
        face={flipFace}
        teamAName={hudTeamAName}
        teamBName={hudTeamBName}
        skin={hudSkin}
        onFlipAgain={flipCoin}
        onClose={() => setFlipOpen(false)}
      />

      {/* ===== Popup สุ่มเมนูอาหารหลังตีแบต — สล็อตกาชาปอง 6 เมนู ===== */}
      <FoodRouletteModal
        open={foodOpen}
        state={foodState}
        display={foodDisplay}
        result={foodResult}
        skin={hudSkin}
        onRollAgain={rollFood}
        onClose={() => setFoodOpen(false)}
      />

      {/* ===== Popup คิดตังค่าสนาม ===== */}
      <CourtFeeModal open={feeOpen} skin={hudSkin} onClose={() => setFeeOpen(false)} />

      {/* ===== มินิเกมจระเข้กดนิ้ว ===== */}
      <CrocGameModal
        open={crocOpen}
        skin={hudSkin}
        sound={playSound}
        onClose={() => setCrocOpen(false)}
      />

      {/* ===== มินิเกม HI-LO ===== */}
      <HiLoGameModal
        open={hiloOpen}
        skin={hudSkin}
        sound={playSound}
        onClose={() => setHiloOpen(false)}
      />

      {/* ===== มินิเกมดีโน่รัน (Chrome Dino) ===== */}
      <DinoGameModal
        open={dinoOpen}
        skin={hudSkin}
        sound={playSound}
        onClose={() => setDinoOpen(false)}
      />
    </div>
  );
}
