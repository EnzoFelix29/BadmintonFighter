'use client';

// ============================================================
// ระบบ 2 ภาษา (ไทย / อังกฤษ) — Thai-key i18n
// หลักการ: ข้อความไทยต้นฉบับ = key ของพจนานุกรม
//   - lang 'th' → คืน key เดิม (ข้อความไทย ไม่เปลี่ยนอะไร)
//   - lang 'en' → คืนคำแปลจาก EN, ถ้าไม่มี key นั้น fallback เป็นไทย (แอปไม่พังแน่นอน)
// รองรับ placeholder {name} ผ่าน vars: t('ชื่อ {name}', { name: 'A' })
// เลือกภาษาแล้วจำค่าใน localStorage key: badminton_lang
// ============================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'th' | 'en';

export const LANG_KEY = 'badminton_lang';

// พจนานุกรมอังกฤษ — key = ข้อความไทยต้นฉบับ (ตรงตัวทุกตัวอักษร รวมวรรค/เว้นวรรค)
const EN: Record<string, string> = {
  // ===== Navbar / หน้าหลัก =====
  'บันทึกสถิติแบดมินตัน': 'Badminton Stats Tracker',
  'ระบบเก็บสถิติการแข่งขัน • Badminton Stats': 'Match statistics system • Badminton Stats',
  'แบดมินตัน': 'Badminton',
  'ผู้เล่น': 'Players',
  'ลงทะเบียนผู้เล่น': 'Register Players',
  'ลงทะเบียน/จัดการผู้เล่น — เหรียญและสกินเป็นของรายบุคคล':
    'Register / manage players — coins & skins are per player',
  'กฎกติกาและวิธีได้เหรียญ': 'Rules & Coin Rewards',
  'กฎกติกาและวิธีได้เหรียญ — ชนะ +7 / ชนะขาด +10 / แพ้ +3':
    'Rules & coin rewards — win +7 / crushing win +10 / lose +3',
  'โหมดการแสดงผลของจอ': 'Display mode',
  'โหมดแนวตั้ง — เลย์เอาต์แคบแบบมือถือ': 'Portrait mode — narrow mobile layout',
  'โหมดแนวนอน — เลย์เอาต์กว้าง 3 คอลัมน์': 'Landscape mode — wide 3-column layout',
  'เปิดเสียงเอฟเฟกต์': 'Unmute sound effects',
  'ปิดเสียงเอฟเฟกต์': 'Mute sound effects',
  'สลับเป็นโหมดสว่าง': 'Switch to light mode',
  'สลับเป็นโหมดมืด': 'Switch to dark mode',
  'โหมดสว่าง': 'Light mode',
  'โหมดมืด': 'Dark mode',
  'ล้างข้อมูลสถิติทั้งหมด (ยืนยันก่อนลบ)': 'Clear all stats (asks to confirm first)',
  'ล้างข้อมูล': 'Clear data',
  'สรุปภาพรวม': 'Summary',
  'ภาษา / Language': 'Language',

  // ===== ฟอร์มบันทึกผล =====
  'บันทึกผลการแข่งขัน': 'Record Match Result',
  'เลือกชื่อผู้เล่นที่ลงทะเบียนไว้ (สกินตามโปรไฟล์) • กดช่องตัวละครเปิดตู้ Reel เปลี่ยนสกินอุปกรณ์ได้เลย':
    'Pick registered players (skins follow profiles) • tap the avatar box to open the gear Reel',
  'ชื่อสนาม': 'Court name',
  'เช่น คอร์ท 1': 'e.g. Court 1',
  'ประเภทการตี': 'Match type',
  'เดี่ยว (Singles)': 'Singles',
  'คู่ (Doubles)': 'Doubles',
  'เดี่ยว': 'Singles',
  'คู่': 'Doubles',
  'วัน/เดือน/ปี': 'Date',
  'ทีม A': 'Team A',
  'ทีม B': 'Team B',
  'เสิร์ฟก่อน': 'Serving first',
  'เล่นคู่': 'Doubles',
  'ผู้เล่น 1': 'Player 1',
  'ผู้เล่น 2': 'Player 2',
  'เปลี่ยนตัวละคร': 'Change character',
  'เปิดตู้ Reel เปลี่ยนสกินไม้แบด / รองเท้าของผู้เล่นคนนี้':
    "Open the Reel to change this player's racket / shoe skins",
  'เลือกผู้เล่นก่อน': 'Pick a player first',
  '— เลือกผู้เล่น —': '— Pick a player —',
  ' (เล่นอยู่)': ' (playing)',
  '＋ ลงทะเบียนผู้เล่นใหม่…': '＋ Register new player…',
  'แต้มที่ได้ (ห้ามเกิน {max})': 'Points scored (max {max})',
  'เกมละกี่แต้ม:': 'Points per game:',
  '21 แต้ม': '21 points',
  '15 แต้ม': '15 points',
  'บันทึกผล': 'Save Result',

  // ===== ลูกเล่นหลังตีแบต =====
  'ลูกเล่นหลังตีแบต': 'Post-game Fun',
  'คิดตังค่าสนาม • จระเข้กดนิ้ว • HI-LO • ดีโน่รัน':
    'Court fee • Croc dentist • HI-LO • Dino run',
  'คิดตังค่าสนาม': 'Court Fee',
  'คิดตังค่าสนาม — ใส่ราคารวมค่าคอร์ทและจำนวนคนที่จะหาร':
    'Court fee calculator — enter the total court cost and number of people to split',
  'จระเข้กดนิ้ว': 'Croc Dentist',
  'มินิเกมจระเข้กดนิ้ว — ผลัดกันกดฟัน ซี่ไหนเจอฟันเสียจะโดนกัด':
    'Crocodile dentist mini game — take turns pressing teeth; the sore tooth bites!',
  'มินิเกม HI-LO — ทายว่าไพ่ต่อไปสูงกว่าหรือต่ำกว่า':
    'HI-LO mini game — guess if the next card is higher or lower',
  'มินิเกมดีโน่รัน — กด SPACE หรือแตะจอเพื่อกระโดดหลบแคคตัส เก็บคะแนนสูงสุด':
    'Dino run mini game — press SPACE or tap to jump over cacti and chase a high score',
  'ดีโน่รัน': 'Dino Run',

  // ===== ตารางอันดับ =====
  'ตารางอันดับ': 'Leaderboard',
  'จัดอันดับตาม Win Rate แบบเรียลไทม์': 'Ranked live by win rate',
  'ยังไม่มีข้อมูล': 'No data yet',
  'เริ่มบันทึกผลการแข่งขันเลย!': 'Start recording matches!',
  'แข่ง {n} แมตช์': '{n} matches played',

  // ===== โมดอลสรุปภาพรวม =====
  'สรุปภาพรวมทั้งหมด': 'Overall Summary',
  'สถิติทุกทีมและประวัติการแข่งขัน': 'Team stats & match history',
  'เซฟเป็นรูป': 'Save as Image',
  'ปิดหน้าต่าง': 'Close',
  'สถิติแต่ละทีม': 'Team Stats',
  '• วงกลม Win Rate': '• Win-rate rings',
  'ยังไม่มีข้อมูลสถิติ': 'No stats yet',
  'แข่งทั้งหมด {n} แมตช์': '{n} matches played',
  'ชนะต่อเนื่อง (Win Streak)': 'Win Streak',
  '• นับจากแมตช์ล่าสุด': '• counted from the latest match',
  'ชนะติดต่อกัน': 'wins in a row',
  'ชนะ': 'Wins',
  'แพ้': 'Losses',
  'ประวัติการแข่งขัน (Match History)': 'Match History',
  'แมตช์': 'Match',
  'วันที่': 'Date',
  'สนาม': 'Court',
  'ประเภท': 'Type',
  'คะแนน': 'Score',
  'แต้มจบ': 'Game point',
  'ยังไม่มีประวัติการแข่งขัน': 'No match history yet',
  '{n} แต้ม': '{n} pts',

  // ===== HUD สกอร์บอร์ด =====
  'สกอร์บอร์ด HUD — อัปเดตสดตามที่กรอก': 'HUD Scoreboard — live update as you type',
  'สกิน HUD:': 'HUD skin:',
  'เลือกสกิน HUD': 'Choose HUD skin',
  'สกิน {name} — {tag} (แตะเพื่อเลือกจากทั้งหมด {count} แบบ)':
    'Skin {name} — {tag} (tap to pick from all {count})',
  'เกมละ {max} แต้ม': '{max} pts per game',
  'ทีม {team} เสิร์ฟก่อน{face}': 'Team {team} serves first{face}',
  ' (หัว)': ' (heads)',
  ' (ก้อย)': ' (tails)',
  'ยังไม่ได้จับเหรียญเสิร์ฟ': 'Coin not flipped yet',
  'ปุ่มจับเหรียญและสุ่มเมนูอาหาร': 'Coin flip & food roulette buttons',
  'จับเหรียญเสิร์ฟก่อน': 'Coin Toss',
  'จับเหรียญเลือกทีมเสิร์ฟก่อน — popup เหรียญเด้งกลางจอ (หัว = ทีม A, ก้อย = ทีม B)':
    'Flip a coin to pick the first server — coin popup on screen (heads = Team A, tails = Team B)',
  'กำลังเหวี่ยง…': 'Flipping…',
  'เหวี่ยงใหม่': 'Flip Again',
  'สุ่มเมนูอาหาร': 'Food Roulette',
  'สุ่มเมนูอาหารหลังตีแบต — สล็อต 6 เมนูตามโอกาส 45/15/15/10/10/5 (เด้งกลางจอ)':
    'Post-game food roulette — 6 menus by odds 45/15/15/10/10/5 (pops up on screen)',
  'หัว': 'Heads',
  'ก้อย': 'Tails',

  // ===== Popup จับเหรียญ =====
  'หัว = ทีม A • ก้อย = ทีม B': 'Heads = Team A • Tails = Team B',
  'กำลังเหวี่ยงเหรียญ…': 'Flipping the coin…',
  '{side}! {name} เสิร์ฟก่อน': '{side}! {name} serves first',
  'รอเหรียญตกลงพื้นก่อนนะ…': 'Wait for the coin to land…',
  'ทีมที่ชนะเหรียญได้เสิร์ฟลูกก่อน 🏸': 'The coin winner serves first 🏸',
  'เหวี่ยงเหรียญใหม่': 'Flip the coin again',
  'ปิด': 'Close',

  // ===== Popup สุ่มเมนูอาหาร =====
  'สุ่มเมนูอาหารหลังตีแบต': 'Post-game food roulette',
  'สุ่มเมนูหลังตีแบต': 'Post-game Food Roulette',
  'ตีเสร็จต้องมีกิน — สุ่มตามโอกาสที่กำหนด': 'Play hard, eat well — rolled by fixed odds',
  'กำลังสุ่มเมนู…': 'Rolling the menu…',
  'กำลังสุ่ม…': 'Rolling…',
  'สุ่มใหม่': 'Roll Again',
  'สุ่มเมนูใหม่': 'Roll the menu again',

  // ===== โมดอลลงทะเบียน =====
  'ปิดหน้าลงทะเบียนผู้เล่น': 'Close player registration',
  'กรอกชื่อแล้วใช้ได้เลย • เหรียญและสกินเป็นของรายบุคคล':
    'Just type a name to play • coins & skins are per player',
  'ลงทะเบียนผู้เล่นใหม่': 'Register New Player',
  'ชื่อผู้เล่น': 'Player name',
  'ชื่อผู้เล่นที่จะลงทะเบียน': 'Player name to register',
  'ลงทะเบียน': 'Register',
  'ลงทะเบียน "{name}" เรียบร้อย — ครั้งต่อไปเลือกชื่อนี้ในช่องผู้เล่นได้เลย':
    'Registered "{name}" — you can now pick this name in player slots',
  'ผู้เล่นที่ลงทะเบียนแล้ว': 'Registered Players',
  '({n} คน)': '({n})',
  'ยังไม่มีผู้เล่น — ลงทะเบียนด้านบนเพื่อเริ่มเก็บเหรียญรายบุคคล':
    'No players yet — register above to start earning personal coins',
  '{n} เหรียญ': '{n} coins',
  'ร้านค้าสกินของ {name}': "{name}'s skin shop",
  'ร้านค้า': 'Shop',
  'ลบผู้เล่น {name}': 'Delete player {name}',
  'ทุกคนมีเหรียญและสกินของตัวเอง — กดร้านค้าเพื่อปลดล็อคสกินใหม่ (100 เหรียญ/สกิน)':
    'Everyone has their own coins & skins — open the shop to unlock new skins (100 coins each)',

  // ===== ร้านค้า =====
  'ร้านค้าสกินอุปกรณ์': 'Gear Skin Shop',
  'ร้านค้าสกินเท่ห์ — {name}': "{name}'s Skin Shop",
  'สกินพิเศษราคา {price} เหรียญ/สกิน • ใช้เหรียญรายบุคคลของ "{name}"':
    'Special skins at {price} coins each • spends "{name}"\'s personal coins',
  'เหรียญสะสมของ {name}': "{name}'s coins",
  'ปิดร้านค้า': 'Close shop',
  'ไม้แบดเท่ห์': 'Rackets',
  'รองเท้าเท่ห์': 'Shoes',
  'ปลดล็อคแล้ว': 'Unlocked',
  'ปลดล็อค {name}': 'Unlock {name}',
  'เหรียญไม่พอ — เก็บเหรียญเพิ่มจากการแข่งขัน':
    'Not enough coins — earn more by playing matches',
  'ปลดล็อค': 'Unlock',
  'เหรียญไม่พอ (ต้องการ {n})': 'Not enough (need {n} more)',
  'เก็บเหรียญจากการบันทึกผลแข่ง (รายบุคคล): ชนะ +7 เหรียญ • แพ้ +3 เหรียญ':
    'Earn coins from matches (personal): win +7 coins • lose +3 coins',
  'ปิดร้าน': 'Close Shop',

  // ===== เลือกตัวละคร =====
  'เลือกสกินตัวละคร': 'Choose character skin',
  'เลือกสกินตัวละคร — {name}': 'Choose character skin — {name}',
  'ทีม {team} • ผู้เล่น {no}': 'Team {team} • Player {no}',
  'สกิน 8-bit ทั้งหมด {n} แบบ • ที่เลือกจะบันทึกเป็นของผู้เล่นคนนี้':
    '{n} 8-bit skins in total • your pick is saved for this player',
  'ปิดหน้าต่างเลือกตัวละคร': 'Close character picker',
  'ทั้งหมด': 'All',
  'ชาย': 'Male',
  'หญิง': 'Female',
  'สกินนี้ถูกใช้โดยผู้เล่นคนอื่นในแมตช์นี้แล้ว':
    'This skin is already used by another player in this match',
  'สกินเดียวกันใช้ได้คนละ 1 คนต่อแมตช์ — เลือกเลย ไม่ต้องใส่รหัส':
    'Each skin fits one player per match — just pick, no PIN needed',
  'ยกเลิก': 'Cancel',

  // ===== แท่นรับเหรียญ / Win Rate =====
  'แชมป์': 'Champion',
  'อันดับ {n}': 'Rank {n}',
  '{wr}% • ชนะ {w} แพ้ {l}': '{wr}% • {w}W {l}L',
  'แท่นรับเหรียญรางวัล • อันดับ 1-3': 'Podium • Top 3',
  'อัตราชนะ {pct}%': 'Win rate {pct}%',

  // ===== กฎกติกา (แยก segment เพราะ JSX มี <b> แทรก) =====
  'กฎกติกา & วิธีได้เหรียญ': 'Rules & How to Earn Coins',
  'สรุปกติกาเหรียญ การกรอกแต้ม และการเสิร์ฟก่อน':
    'Coin rules, score entry limits and the first-serve coin toss',
  'วิธีได้เหรียญ (รายบุคคล)': 'How to Earn Coins (per player)',
  'ชนะขาด': 'Crushing win',
  'ได้': '→',
  '+7 เหรียญ': '+7 coins',
  '+10 เหรียญ': '+10 coins',
  '+3 เหรียญ': '+3 coins',
  '/คน': ' per player',
  '— ทีมแพ้ได้ต่ำกว่า': '— when the losing team scores under',
  '5 แต้ม': '5 pts',
  'หรือ ชนะห่าง': 'or the gap is',
  'ขึ้นไป': 'or more',
  'เหรียญใช้ปลดล็อคสกินไม้แบด/รองเท้าในร้านค้า (100 เหรียญ/สกิน)':
    'Coins unlock racket/shoe skins in the shop (100 coins per skin)',
  'กฎการกรอกแต้ม': 'Score Entry Rules',
  'แต้มที่กรอก': 'Scores',
  'ห้ามเกิน': 'must not exceed',
  'จำนวนแต้มที่เลือก (เกมละ': 'the chosen game point (',
  'หรือ': 'or',
  'แต้ม) — พิมพ์เกินระบบจะตัดเลขให้อัตโนมัติ และแบดมินตันไม่มีผลเสมอ':
    'pts) — typing more is clamped automatically, and badminton has no draws',
  'ก่อนเริ่มเกมกดปุ่ม': 'Before playing, tap',
  '“จับเหรียญเสิร์ฟก่อน”': '“Coin Toss”',
  'บน HUD — เหรียญจะเด้งขึ้นกลางจอเป็น popup พร้อมหมุน จนเหรียญตกลงพื้นรู้ผล:':
    'on the HUD — a coin pops up mid-screen spinning until it lands:',
  'หัว = ทีม A': 'heads = Team A',
  'ก้อย = ทีม B': 'tails = Team B',
  'ทีมที่ชนะจะได้เสิร์ฟลูกก่อน (กดเหวี่ยงใหม่ได้เสมอ)':
    'the winner serves first (re-flip anytime)',
  'สุ่มเมนูอาหารหลังตีแบต (ลูกเล่น)': 'Post-game Food Roulette (fun)',
  'บันทึกผลแข่งเสร็จ กดปุ่ม': 'After saving a match, tap',
  '“สุ่มเมนูอาหาร”': '“Food Roulette”',
  'บน HUD เพื่อสุ่มเมนูได้เลย — มี 6 เมนู ออกตามโอกาส: ข้าวต้ม ข้างทาง':
    'on the HUD to roll a menu — 6 menus by odds: Roadside congee',
  '• ชาบู ชาใจ': '• Chai Jai shabu',
  '• สเต็ก ลุงวอ': '• Uncle Wo steak',
  '• ซูชิ ปิ๊แมว': '• Pig-cat sushi',
  '• ส้มตำ ระยำใจ': '• Rayam-jai som tam',
  '• IRON GRILL ริวจิตสัมผัส': '• IRON GRILL Ryu',
  'รับทราบ': 'Got it',

  // ===== ข้อความแจ้งเตือน/confirm =====
  'ล้างข้อมูลเรียบร้อยแล้ว': 'Data cleared',
  'ต้องการล้างข้อมูลสถิติทั้งหมดใช่หรือไม่?\n(แมตช์และตารางอันดับจะหายทั้งหมด ย้อนกลับไม่ได้ — โปรไฟล์ผู้เล่น/เหรียญ/สกินยังอยู่)':
    'Clear all stats?\n(Matches and the leaderboard will be wiped — this cannot be undone. Player profiles/coins/skins remain)',
  'ลบผู้เล่น {name} พร้อมเหรียญและสกินทั้งหมด? ย้อนกลับไม่ได้':
    'Delete player {name} with all their coins and skins? This cannot be undone',
  'ยังไม่มีผู้เล่น — กด "＋ ลงทะเบียนผู้เล่นใหม่" ที่ช่องชื่อก่อน':
    'No players yet — tap "＋ Register new player" in a name slot first',
  'กรุณาเลือกผู้เล่นให้ครบทุกช่อง': 'Please pick a player for every slot',
  'ผู้เล่นต้องไม่ซ้ำกันในแมตช์เดียวกัน': 'Players must not repeat within the same match',
  'ไม่พบโปรไฟล์ผู้เล่น กรุณาลงทะเบียนใหม่': 'Player profile not found — please register again',
  'สกินตัวละครแต่ละคนต้องไม่ซ้ำกันในแมตช์เดียวกัน':
    'Each player needs a different character skin in the same match',
  'กรุณากรอกคะแนนให้ถูกต้อง': 'Please enter valid scores',
  'แบดมินตันไม่มีผลเสมอ กรุณาตรวจสอบคะแนน': 'Badminton has no draws — please check the scores',
  'แต้มห้ามเกิน {cap} — คุณเลือกเกมละ {max} แต้ม (กรอก {a}-{b} ไม่ได้)':
    'Points cannot exceed {cap} — you chose {max} points per game ({a}-{b} is not allowed)',
  'บันทึกผลสำเร็จ! ชนะ: {winners} +{wc} เหรียญ • แพ้: {losers} +{lc} เหรียญ':
    'Saved! Winners: {winners} +{wc} coins • Losers: {losers} +{lc} coins',
  'บันทึกผลสำเร็จ! ชนะขาด {hi}-{lo} 🔥 ชนะ: {winners} +{wc} เหรียญ • แพ้: {losers} +{lc} เหรียญ':
    'Saved! Crushing win {hi}-{lo} 🔥 Winners: {winners} +{wc} coins • Losers: {losers} +{lc} coins',
  'กรุณาเลือกผู้เล่นในช่องนี้ก่อน': 'Pick a player for this slot first',
  'ซื้อสกินไม่สำเร็จ': 'Skin purchase failed',
  'ปลดล็อค "{name}" สำเร็จ!': 'Unlocked "{name}"!',
  'ลบผู้เล่น "{name}" เรียบร้อยแล้ว': 'Deleted player "{name}"',
  'ลงทะเบียนไม่สำเร็จ': 'Registration failed',

  // ===== error จาก lib/players.ts (แปลตอนแสดงผล) =====
  'กรุณากรอกชื่อผู้เล่น': 'Please enter a player name',
  'ชื่อต้องไม่เกิน 24 ตัวอักษร': 'Name must be 24 characters or fewer',
  'ไม่พบผู้เล่น': 'Player not found',
  'สกินนี้ปลดล็อคอยู่แล้ว': 'This skin is already unlocked',

  // ===== ชื่อสกิน HUD (11 แบบ) =====
  'คลาสสิก': 'Classic',
  'ฟ้า-ขาว สไตล์แอป': 'Blue-white app style',
  'นีออน': 'Neon',
  'ฟ้า-ชมพู เรืองแสง': 'Glowing blue-pink',
  'เรโทร 8-บิต': 'Retro 8-bit',
  'พิกเซลเกมยุค 90': '90s pixel game',
  'ทองหรู': 'Gold',
  'ทองเงา สไตล์แชมป์': 'Champion gold',
  'มินิมอล': 'Minimal',
  'ขาวดำ สะอาดตา': 'Clean black & white',
  'ป่าเขียว': 'Forest',
  'เขียวธรรมชาติ สดชื่น': 'Fresh natural green',
  'ซากุระ': 'Sakura',
  'ชมพูนุ่ม สไตล์ญี่ปุ่น': 'Soft Japanese pink',
  'มหาสมุทร': 'Ocean',
  'ฟ้าคราม ลึกเย็นตา': 'Deep cooling indigo',
  'ลาวา': 'Lava',
  'แดงเพลิง บนพื้นดำ': 'Fiery red on black',
  'กาแล็กซี': 'Galaxy',
  'ม่วงอวกาศ ดาวระยิบ': 'Starry space purple',
  'ลูกกวาด': 'Candy',
  'พาสเทลสายรุ้ง สดใส': 'Bright rainbow pastel',

  // ===== เมนูอาหาร (dish/shop/tagline) =====
  'ข้าวต้ม': 'Rice Congee',
  'ข้างทาง': 'Roadside Stall',
  'ปลอดภัย อิ่มจริง ไปได้ทุกงาน': 'Safe & filling — works for every occasion',
  'ชาบู': 'Shabu',
  'ชาใจ': 'Chai Jai',
  'นั่งจิบน้ำซุปกันจนหิวตีรอบใหม่': 'Sip broth until you are hungry for round two',
  'สเต็ก': 'Steak',
  'ลุงวอ': 'Uncle Wo',
  'หรูหราขึ้นเยอะ แต่ยังจิ้มแจ่วได้': 'Much fancier — but jaew dip still works',
  'ซูชิ': 'Sushi',
  'ปิ๊แมว': 'Pig the Cat',
  'เหมียวรับรอง ปลาสดทุกเม็ด': 'Meow-certified, fresh fish in every bite',
  'ส้มตำ': 'Som Tam',
  'ระยำใจ': 'Rayam Jai',
  'เผ็ดจนลืมว่าวันนี้แพ้หรือชนะ': 'Spicy enough to forget today’s result',
  'IRON GRILL': 'IRON GRILL',
  'ริวจิตสัมผัส': 'Ryu Sixth Sense',
  'แกร่งเหมือนเตารีด หอมทะลุจอ': 'Tough as an iron — aroma straight through the screen',

  // ===== มินิเกมดีโน่รัน (Chrome Dino) =====
  'มินิเกมดีโน่รัน Chrome Dino': 'Dino Run — Chrome Dino',
  'ดีโน่รัน — หลบแคคตัส': 'Dino Run — dodge the cacti',
  'กด SPACE / ↑ หรือแตะจอ = กระโดด • ชนแคคตัส = จบเกม':
    'Press SPACE / ↑ or tap = jump • hitting a cactus ends the game',
  'คะแนน: {score}': 'Score: {score}',
  '🏆 สถิติสูงสุด: {best}': '🏆 Best: {best}',
  'พื้นที่เล่นเกมดีโน่รัน — แตะเพื่อกระโดด': 'Dino run play area — tap to jump',
  'กด SPACE หรือแตะเพื่อเริ่ม': 'Press SPACE or tap to start',
  'กระโดดหลบแคคตัสให้ได้มากที่สุด!': 'Jump over as many cacti as you can!',
  'จบเกม! ได้ {score} แต้ม': 'Game over! You scored {score}',
  'สถิติใหม่! 🏆': 'New record! 🏆',
  'กด SPACE หรือแตะเพื่อเล่นใหม่': 'Press SPACE or tap to play again',
  'เริ่มเกมดีโน่รัน': 'Start Dino Run',
  'เริ่มเกมใหม่': 'Restart Game',
  'เริ่มเกม': 'Start Game',
  'เริ่มใหม่': 'Restart',

  // ===== มินิเกมจระเข้กดนิ้ว =====
  'มินิเกมจระเข้กดนิ้ว': 'Crocodile dentist mini game',
  'ผลัดกันกดฟัน — ซี่ไหนเจอฟันเสียจะโดนกัด!':
    'Take turns pressing teeth — the sore tooth bites!',
  'ผู้เล่น:': 'Players:',
  'ตั้งผู้เล่น {n} คน (เริ่มเกมใหม่)': 'Set {n} players (restarts the game)',
  '🐊 จระเข้กัด! ผู้เล่น ': '🐊 Chomp! Player ',
  'ตาของ: ': 'Turn: ',
  ' โดนกัดนิ้ว!': ' got bitten!',
  ' (มี {n} คน)': ' ({n} players)',
  'ฟันซี่ที่ {n}': 'Tooth {n}',
  ' (กดแล้ว)': ' (pressed)',
  'ฟันซี่ที่ {n} (กดแล้ว — ปลอดภัย)': 'Tooth {n} (already pressed — safe)',
  'ฟันซี่ที่ {n} — กดเลย!': 'Tooth {n} — press it!',
  'กดไป {pressed}/{total} ซี่ • กด "รอบใหม่" เล่นต่อได้เลย':
    '{pressed}/{total} teeth pressed • tap "New Round" to keep playing',
  'กดไปแล้ว {pressed}/{total} ซี่ — เหลืออีก {remaining} ซี่ 🦷':
    '{pressed}/{total} teeth pressed — {remaining} left 🦷',
  'สุ่มฟันเสียซี่ใหม่ เริ่มรอบใหม่': 'Shuffle a new sore tooth and start a new round',
  'รอบใหม่': 'New Round',

  // ===== มินิเกม HI-LO =====
  'มินิเกม HI-LO': 'HI-LO mini game',
  'HI-LO ทายไพ่สูง-ต่ำ': 'HI-LO — higher or lower',
  'A ต่ำสุด • K สูงสุด • แต้มเท่ากับ = แพ้': 'A is lowest • K is highest • equal rank = loss',
  'ต่อปัจจุบัน: {n}': 'Current streak: {n}',
  '🏆 สถิติสูงสุด: {n}': '🏆 Best: {n}',
  'กด "เริ่มเกม" เพื่อสุ่มไพ่ใบแรก': 'Tap "Start Game" to draw the first card',
  'แพ้! ทายถูก {n} ต่อ': 'Lost! You guessed right {n} in a row',
  'ลองใหม่ คราวนี้ต้องไปไกลกว่านี้': 'Try again — go even further this time',
  'ไพ่ต่อไปจะ': 'Will the next card be',
  'สูงกว่า': 'higher',
  'ต่ำกว่า': 'lower',
  'ไพ่ก่อนหน้า': 'Previous card',
  'ทายว่าไพ่ต่อไปต่ำกว่า (LO)': 'Guess the next card is lower (LO)',
  'ต่ำ (LO)': 'Low (LO)',
  'ทายว่าไพ่ต่อไปสูงกว่า (HI)': 'Guess the next card is higher (HI)',
  'สูง (HI)': 'High (HI)',
  'เริ่มเกมใหม่ สุ่มไพ่ใหม่ทั้งหมด': 'Restart with a fresh shuffle',
  'เริ่มเกม — สุ่มไพ่ใบแรก': 'Start Game — draw the first card',

  // ===== คิดตังค่าสนาม =====
  'ใส่ราคารวมค่าคอร์ท + จำนวนคนที่จะหาร':
    'Enter the total court cost + number of people to split',
  'ราคารวมค่าคอร์ท (บาท)': 'Total court cost (baht)',
  'เช่น 800': 'e.g. 800',
  'จำนวนคนที่จะหาร (คน)': 'People to split between (persons)',
  'เช่น 4': 'e.g. 4',
  'ด่วน:': 'Quick:',
  'ตั้งจำนวนคน {n} คน': 'Set {n} people',
  'หารกันคนละ': 'Split per person',
  'บาท': 'baht',
  'ปัดเศษขึ้น': 'Round up',
  'คนละ {up} บาท': '{up} baht each',
  '(รวมเกิน {tip} บาท)': '(adds {tip} baht extra)',
  'ลงตัวพอดี ไม่ต้องปัดเศษ 👌': 'Divides evenly — no rounding needed 👌',
  'กรอกราคารวมและจำนวนคนเพื่อคำนวณ':
    'Enter the total cost and number of people to calculate',
  'ล้างตัวเลขที่กรอก': 'Clear the entered numbers',
  'ล้าง': 'Clear',
  'เสร็จแล้ว': 'Done',

  // ===== ตู้ Reel เปลี่ยนสกินอุปกรณ์ =====
  'กำลังหมุน': 'Spinning…',
  'สุ่ม': 'Roll',
  '{label} ก่อนหน้า': 'Previous {label}',
  '{label} ถัดไป': 'Next {label}',
  '{name} — ปลดล็อคที่ร้านค้า {price} เหรียญ': '{name} — unlock in the shop for {price} coins',
  'ตู้ Reel เปลี่ยนสกินอุปกรณ์': 'Gear skin Reel',
  'ตู้ Reel — {name}': 'Reel — {name}',
  '{slotLabel} • สกินที่เลือกจะบันทึกเป็นของผู้เล่นคนนี้':
    '{slotLabel} • your pick is saved for this player',
  'เปิดร้านค้าสกินของผู้เล่นนี้': "Open this player's skin shop",
  'ร้านค้าสกินเท่ห์ — ปลดล็อคด้วยเหรียญของผู้เล่นคนนี้':
    "Skin shop — unlock with this player's coins",
  'ปิดตู้เปลี่ยนสกินอุปกรณ์': 'Close the gear skin Reel',
  'ไม้แบด': 'Racket',
  'รองเท้าแบด': 'Shoes',
  'สกินที่มีสัญลักษณ์กุญแจคือสกินเท่ห์พิเศษจากร้านค้า — แตะเพื่อไปปลดล็อคที่ร้านค้า ({price} เหรียญ/สกิน)':
    'Locked icons are special shop skins — tap to unlock in the shop ({price} coins per skin)',
  'สกินอุปกรณ์เป็นแค่ลุค — สถิติการเล่นไม่เปลี่ยนตาม':
    'Gear skins are cosmetic only — gameplay stats never change',

  // ===== page.tsx (เพิ่มเติม) =====
  'เลือกผู้เล่น': 'Pick a player',
  'เปลี่ยนสกินไม้แบดและรองเท้าของ{label}': 'Change racket & shoe skins of {label}',

  // ===== ชื่ออุปกรณ์ (gear.ts — ไม้แบด/รองเท้า) =====
  'ไม้ทองคำ': 'Golden Racket',
  'ไม้เพลิงมัจจุราช': 'Phoenix Fire Racket',
  'ไม้เนออนซิตี้': 'Neon City Racket',
  'ไม้แกแล็กซี': 'Galaxy Racket',
  'ไม้คาร์บอนโปร': 'Carbon Pro Racket',
  'ไม้มรกตราชินี': 'Emerald Queen Racket',
  'ไม้สายฟ้าขั้นสุด': 'Ultimate Thunder Racket',
  'ไม้เลือดมังกร': 'Dragon Blood Racket',
  'ไม้ไซเบอร์แอ็ค': 'Cyber Axe Racket',
  'ไม้สตาร์พิงค์': 'Star Pink Racket',
  'รองเท้าทองคำ': 'Golden Shoes',
  'รองเท้าเพลิง': 'Flame Shoes',
  'รองเท้าเนออน': 'Neon Shoes',
  'รองเท้าแกแล็กซี': 'Galaxy Shoes',
  'รองเท้าคาร์บอน': 'Carbon Shoes',
  'รองเท้ามรกต': 'Emerald Shoes',
  'รองเท้าสายฟ้า': 'Thunder Shoes',
  'รองเท้ามังกรแดง': 'Red Dragon Shoes',
  'รองเท้าไซเบอร์': 'Cyber Shoes',
  'รองเท้าสตาร์พิงค์': 'Star Pink Shoes',

  // ===== ชื่อตัวละคร (characters.ts) =====
  'เจมส์': 'James',
  'บอส': 'Boss',
  'ต้น': 'Ton',
  'ก้อง': 'Kong',
  'ปอนด์': 'Pond',
  'น็อต': 'Nut',
  'โอ๊ต': 'Oat',
  'ฟลุ๊ค': 'Fluke',
  'เดียร์': 'Dear',
  'ภูมิ': 'Bhumi',
  'พีค': 'Peak',
  'ตะวัน': 'Tawan',
  'หมูแดง': 'BBQ Pork',
  'ไข่ดาว': 'Fried Egg',
  'ชาเย็น': 'Thai Iced Tea',
  'มินท์': 'Mint',
  'พลอย': 'Ploy',
  'มุก': 'Mook',
  'เนย': 'Butter',
  'ฟ้า': 'Fah',
  'พราว': 'Praw',
  'เมย์': 'May',
  'จูน': 'June',
  'แพร': 'Prae',
  'นิล': 'Nin',
  'มะลิ': 'Mali',
  'วาฟเฟิล': 'Waffle',
  'สตรอว์': 'Strawberry',
  'โมจิ': 'Mochi',
  'ครีม': 'Cream',
};

// เทมเพลตไทยที่ฝังตัวแปรมาแล้ว (มาจาก lib/players.ts) — แปลด้วย pattern ที่ตำแหน่งแสดงผล
const EN_PATTERNS: Array<{ re: RegExp; to: string }> = [
  { re: /^มีผู้เล่นชื่อ "(.+)" ลงทะเบียนอยู่แล้ว$/, to: 'Player "$1" is already registered' },
  { re: /^เหรียญไม่พอ ต้องการอีก (.+) เหรียญ$/, to: 'Not enough coins — need $1 more' },
  // ชื่ออุปกรณ์ฟรี (gear.ts สร้างด้วย template literal: ไม้แบดคลาสสิก 1-20 / รองเท้าแบดคลาสสิก 1-20)
  { re: /^ไม้แบดคลาสสิก (.+)$/, to: 'Classic Racket $1' },
  { re: /^รองเท้าแบด(?:คลาสสิก)? (.+)$/, to: 'Classic Shoes $1' },
];

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: 'th',
  setLang: () => {},
  t: (key, vars) => {
    let out = key;
    if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
    return out;
  },
});

function fillVars(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th');

  // โหลดภาษาที่เคยเลือกไว้ (หลัง mount กัน hydration mismatch — หน้าแรกโชว์ไทยก่อนเสมอ)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'th') queueMicrotask(() => setLangState(saved));
    } catch {
      // ไม่มี localStorage ใช้ค่าเริ่มต้นไทย
    }
  }, []);

  // อัปเดต attribute ของ <html> ให้ตรงภาษา
  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'th';
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // บันทึกไม่ได้ก็ข้าม
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let out = key;
      if (lang === 'en') {
        const exact = EN[key];
        if (exact !== undefined) {
          out = exact;
        } else {
          // เทมเพลตไทยที่ฝังตัวแปรมาแล้ว เช่น 'มีผู้เล่นชื่อ "A" ลงทะเบียนอยู่แล้ว'
          const pat = EN_PATTERNS.find((p) => p.re.test(key));
          if (pat) out = key.replace(pat.re, pat.to);
        }
      }
      return fillVars(out, vars);
    },
    [lang]
  );

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
