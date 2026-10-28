import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Cookie,
  Gift,
  Heart,
  HeartHandshake,
  Mail,
  MessagesSquare,
  Moon,
  MousePointerClick,
  Music,
  PartyPopper,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import TeddyScene, { type TeddyMode } from "./components/TeddyScene";
import CuteFace from "./components/CuteFace";

/* ---------- tiny sound synth ---------- */
function useCuteSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  };
  const blip = useCallback((freq: number, dur = 0.18, type: OscillatorType = "sine", vol = 0.18, when = 0) => {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") void ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + when);
      o.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 1.4), ctx.currentTime + when + dur);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + when);
      g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + when);
      o.stop(ctx.currentTime + when + dur + 0.05);
    } catch {
      /* ignore */
    }
  }, []);

  const singSong = useCallback(() => {
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") void ctx.resume();
      // laah  lah  laaah  llah  la-la-laah  yip-pee  yeeeeeeey
      const notes: { f: number; d: number; w: number; vib?: boolean }[] = [
        { f: 523.25, d: 0.48, w: 0.00 },       // C5  laah
        { f: 587.33, d: 0.26, w: 0.52 },       // D5  lah
        { f: 659.25, d: 0.58, w: 0.84 },       // E5  laaah
        { f: 587.33, d: 0.26, w: 1.48 },       // D5  llah
        { f: 523.25, d: 0.16, w: 1.80 },       // C5  la
        { f: 587.33, d: 0.16, w: 1.98 },       // D5  la
        { f: 659.25, d: 0.42, w: 2.16 },       // E5  laah
        { f: 783.99, d: 0.22, w: 2.68 },       // G5  yip
        { f: 880.00, d: 0.24, w: 2.92 },       // A5  pee
        { f: 1046.5, d: 1.15, w: 3.22, vib: true }, // C6 yeeeeey
      ];
      notes.forEach((n) => {
        const t0 = ctx.currentTime + n.w;
        const voice = ctx.createOscillator();
        const harm = ctx.createOscillator();
        const g = ctx.createGain();
        voice.type = "triangle";
        harm.type = "sine";
        voice.frequency.setValueAtTime(n.f, t0);
        harm.frequency.setValueAtTime(n.f * 2, t0);
        if (n.vib) {
          voice.frequency.setValueAtTime(n.f, t0);
          voice.frequency.linearRampToValueAtTime(n.f * 1.04, t0 + n.d * 0.5);
          voice.frequency.linearRampToValueAtTime(n.f * 1.12, t0 + n.d);
          harm.frequency.setValueAtTime(n.f * 2, t0);
          harm.frequency.linearRampToValueAtTime(n.f * 2.08, t0 + n.d * 0.5);
          harm.frequency.linearRampToValueAtTime(n.f * 2.24, t0 + n.d);
        }
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.d);
        voice.connect(g);
        harm.connect(g);
        g.connect(ctx.destination);
        voice.start(t0);
        harm.start(t0);
        voice.stop(t0 + n.d + 0.05);
        harm.stop(t0 + n.d + 0.05);
      });
    } catch {
      /* ignore */
    }
  }, []);

  return {
    pop: useCallback(() => blip(520, 0.16, "sine", 0.22), [blip]),
    next: useCallback(() => { blip(620, 0.12, "triangle", 0.16); blip(880, 0.14, "triangle", 0.14, 0.09); }, [blip]),
    boing: useCallback(() => { blip(300, 0.25, "sine", 0.2); blip(520, 0.22, "sine", 0.15, 0.1); }, [blip]),
    yay: useCallback(() => {
      blip(523, 0.16, "triangle", 0.2);
      blip(659, 0.16, "triangle", 0.2, 0.12);
      blip(784, 0.16, "triangle", 0.2, 0.24);
      blip(1046, 0.35, "triangle", 0.22, 0.36);
    }, [blip]),
    singSong,
  };
}

function speak(text: string, opts?: { pitch?: number; rate?: number }) {
  try {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts?.rate ?? 0.98;
    u.pitch = opts?.pitch ?? 1.35;
    u.volume = 1;
    const voices = window.speechSynthesis?.getVoices() ?? [];
    const cute = voices.find((v) => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("zira") || v.lang.startsWith("en"));
    if (cute) u.voice = cute;
    window.speechSynthesis?.speak(u);
  } catch {
    /* ignore */
  }
}
function stopSpeak() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

/* ---------- typewriter ---------- */
function useTypewriter(text: string, active: boolean, speed = 26) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) return;
    setOut("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return { out, done, skip: () => { setOut(text); setDone(true); } };
}

const TEDDY_LINES = [
  "Hii! I'm Honey. Nolo sent me all the way from Cuddle Town... waddle, waddle, waddle — just for you!",
  "He told me he messed up. And ever since, his heart has been going thump... thump... thump... He misses your beautiful smile so much.",
  "So he went offline all of last night to write you this. His paws are still shaking... Shall I show you what he wrote? Tap next!",
];

const NOTE_TEXT =
  "I went offline last night to work in this, and hopefully it brings back your beautiful smile 😊\n\nLook Nolo, I'm really really sorry for what I've said — like, really sorry. I never intended to offend you in any manner 😔\n\nplease 🙏";

const SONG_LYRICS = "laah lah laaah llah lalalaah  yippee yyeeeeeeeeyy";
const SONG_SPEAK = "laah lah laaah, llah, lalalaah, yippee, yeeeeeeey!";

const NO_TEXTS = ["No", "Are you sure?", "Really sure?", "Think again!", "Last chance!", "Surely not?", "Pleaaase?", "You can't catch me!"];

const PROMISES = [
  {
    icon: HeartHandshake,
    color: "bg-rose-100 text-rose-600",
    title: "Unlimited Hugs",
    front: "Promise 01",
    back: "Redeemable anytime, anywhere. Extra-tight ones when you're sad. No expiry, ever.",
  },
  {
    icon: Cookie,
    color: "bg-amber-100 text-amber-700",
    title: "Your Favorite Treats",
    front: "Promise 02",
    back: "Whatever you crave, it's on me. I'll even eat the burnt popcorn piece. That's true love.",
  },
  {
    icon: MessagesSquare,
    color: "bg-sky-100 text-sky-700",
    title: "Better Listening",
    front: "Promise 03",
    back: "No more late replies, no more distracted hmmms. You get all of my attention, all of the time.",
  },
];

export default function App() {
  const [stage, setStage] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [teddyArrived, setTeddyArrived] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [hugSent, setHugSent] = useState(false);
  const [yesSize, setYesSize] = useState(1);
  const [singing, setSinging] = useState(false);
  const voiceOnRef = useRef(true);
  const sounds = useCuteSounds();
  voiceOnRef.current = voiceOn;

  const teddyMode: TeddyMode =
    stage === 0 ? "hidden" : stage === 1 ? (teddyArrived ? "idle" : "walk") : stage === 4 ? "sad" : stage === 5 ? "dance" : "idle";

  /* preload voices */
  useEffect(() => {
    try { window.speechSynthesis?.getVoices(); } catch { /* ignore */ }
  }, []);

  /* teddy walk timing */
  useEffect(() => {
    if (stage === 1) {
      setTeddyArrived(false);
      setLineIdx(0);
      const t = setTimeout(() => setTeddyArrived(true), 3400);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const { out: typed, done: typedDone, skip } = useTypewriter(TEDDY_LINES[lineIdx] ?? "", stage === 1 && teddyArrived, 24);
  const { out: noteTyped, done: noteDone, skip: noteSkip } = useTypewriter(NOTE_TEXT, stage === 2, 28);
  const { out: songTyped, done: songDone } = useTypewriter(SONG_LYRICS, stage === 5 && singing, 70);

  /* speak lines */
  useEffect(() => {
    if (stage === 1 && teddyArrived && voiceOn) {
      const t = setTimeout(() => speak(TEDDY_LINES[lineIdx]), 350);
      return () => clearTimeout(t);
    }
    if (stage === 2 && voiceOn) {
      const t = setTimeout(() => speak(NOTE_TEXT, { pitch: 1.05, rate: 0.94 }), 900);
      return () => clearTimeout(t);
    }
    if (stage === 5) return;
    stopSpeak();
  }, [stage, lineIdx, teddyArrived, voiceOn]);

  const noteNext = () => {
    if (!noteDone) {
      sounds.pop();
      noteSkip();
      return;
    }
    sounds.next();
    stopSpeak();
    setStage(3);
  };

  const startSurprise = () => {
    sounds.pop();
    setStage(1);
  };

  const nextLine = () => {
    sounds.next();
    stopSpeak();
    if (!typedDone) {
      skip();
      return;
    }
    if (lineIdx < TEDDY_LINES.length - 1) {
      setLineIdx((i) => i + 1);
    } else {
      setStage(2);
      sounds.boing();
    }
  };

  const fireCelebration = useCallback(() => {
    const end = Date.now() + 2200;
    const colors = ["#F75A8A", "#F6C88F", "#7DD3E0", "#C084FC", "#FFE58A"];
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors, scalar: 1.1 });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 }, colors, scalar: 1.4 }), 500);
  }, []);

  const playTeddySong = useCallback(() => {
    setSinging(false);
    window.setTimeout(() => {
      setSinging(true);
      sounds.singSong();
      if (voiceOnRef.current) {
        speak(SONG_SPEAK, { pitch: 1.78, rate: 0.68 });
      }
    }, 40);
    window.setTimeout(() => setSinging(false), 5400);
  }, [sounds]);

  const handleYes = () => {
    sounds.yay();
    stopSpeak();
    setStage(5);
    setTimeout(fireCelebration, 350);
    setTimeout(() => {
      playTeddySong();
    }, 700);
  };

  const dodgeNo = () => {
    sounds.boing();
    setNoCount((c) => c + 1);
    setYesSize((s) => Math.min(1.7, s + 0.12));
    setNoPos({
      x: (Math.random() - 0.5) * 220,
      y: (Math.random() - 0.5) * 140,
    });
  };

  const sendHug = () => {
    sounds.yay();
    setHugSent(true);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, colors: ["#F75A8A", "#FDA4BA", "#fff"] });
    if (voiceOn) speak("Hug delivered! He is smiling so big right now.");
    setTimeout(() => setHugSent(false), 4000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FFF5F7] font-body text-[#4A2C1F]">
      {/* dreamy background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-[#FFE4EC] blur-[100px] opacity-80" />
        <div className="absolute top-1/3 -right-40 h-[560px] w-[560px] rounded-full bg-[#E0F2FF] blur-[110px] opacity-70" />
        <div className="absolute -bottom-40 left-1/4 h-[520px] w-[520px] rounded-full bg-[#FFF1C9] blur-[110px] opacity-80" />
        <div className="absolute inset-0 paper-dots opacity-60" />
      </div>

      {/* floating ambient faces */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="absolute left-[6%] top-[14%] animate-floaty opacity-70" style={{ "--rot": "-10deg" } as CSSProperties}>
          <CuteFace mood="love" size={64} />
        </div>
        <div className="absolute right-[7%] top-[18%] animate-floaty opacity-70" style={{ "--rot": "8deg", animationDelay: "-2s" } as CSSProperties}>
          <CuteFace mood="shy" size={72} />
        </div>
        <div className="absolute left-[4%] bottom-[16%] animate-floaty opacity-60" style={{ "--rot": "6deg", animationDelay: "-3.5s" } as CSSProperties}>
          <CuteFace mood="giggle" size={58} />
        </div>
        <div className="absolute right-[5%] bottom-[20%] animate-floaty opacity-60" style={{ "--rot": "-8deg", animationDelay: "-1.2s" } as CSSProperties}>
          <CuteFace mood="happy" size={66} />
        </div>
      </div>

      {/* top bar */}
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#F75A8A] to-[#E85D6B] text-white shadow-lg shadow-rose-200">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-extrabold tracking-tight">sorry.exe</p>
            <p className="text-[12px] font-semibold text-rose-400">a tiny apology mission</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-1 hidden items-center gap-1.5 sm:flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${stage >= i ? "w-7 bg-[#F75A8A]" : "w-2 bg-rose-200"}`}
              />
            ))}
          </div>
          <button
            onClick={() => { setVoiceOn((v) => { const nv = !v; if (!nv) stopSpeak(); return nv; }); }}
            className="grid h-10 w-10 place-items-center rounded-full border border-rose-100 bg-white/80 text-rose-500 shadow-sm backdrop-blur transition hover:scale-105"
            aria-label="toggle voice"
          >
            {voiceOn ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* 3D layer */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${stage === 0 ? "opacity-0" : "opacity-100"}`}>
        <div className="canvas-glow absolute inset-0">
          <TeddyScene mode={teddyMode} hearts={stage === 5 ? 30 : stage === 4 ? 10 : 16} />
        </div>
      </div>

      {/* karaoke singing bubble */}
      <AnimatePresence>
        {stage === 5 && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-none absolute inset-x-0 top-[11%] z-10 flex justify-center px-4"
          >
            <div className="relative max-w-lg rounded-[28px] border-2 border-white bg-white/90 px-5 py-3.5 text-center shadow-[0_18px_50px_-16px_rgba(247,90,138,0.55)] backdrop-blur">
              <div className="absolute -top-3 left-6 text-[20px] animate-bounce-soft">♪</div>
              <div className="absolute -top-4 right-10 text-[16px] text-rose-400 animate-floaty">♫</div>
              <div className="absolute -bottom-2 right-8 text-[18px] text-amber-400 animate-bounce-soft" style={{ animationDelay: "-0.6s" }}>♪</div>
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
                <Music className="h-3.5 w-3.5" /> Honey's happy song
              </p>
              <p className="font-display mt-1 min-h-[52px] text-[22px] font-extrabold leading-snug text-[#F75A8A] sm:text-[26px]">
                {songTyped || (singing ? "" : SONG_LYRICS)}
                {singing && !songDone && <span className="ml-0.5 inline-block h-5 w-[3px] translate-y-[3px] animate-pulse bg-rose-400" />}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* content */}
      <main className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl flex-col items-center justify-center px-5 pb-10 pt-2">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-full max-w-2xl flex-col items-center text-center"
            >
              <div className="flex items-end justify-center gap-3 sm:gap-4">
                <div className="animate-floaty"><CuteFace mood="pleading" size={86} delay={0.1} /></div>
                <div className="-translate-y-3 animate-bounce-soft"><CuteFace mood="pout" size={104} delay={0.25} className="ring-4 ring-white" /></div>
                <div className="animate-floaty" style={{ animationDelay: "-2.4s" }}><CuteFace mood="shy" size={86} delay={0.4} /></div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-rose-500 shadow-sm backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5" />
                psst... come here for a sec
              </motion.div>

              <h1 className="font-display mt-4 text-[42px] font-extrabold leading-[0.95] tracking-tight text-[#4A2C1F] sm:text-[64px]">
                Heyy Nolo...
                <span className="block bg-gradient-to-r from-[#F75A8A] via-[#E85D6B] to-[#EAB16E] bg-clip-text text-transparent animate-shimmer">
                  I owe you a sorry
                </span>
              </h1>
              <p className="mt-4 max-w-md text-[16px] font-medium leading-relaxed text-[#8B5E4F] sm:text-[17px]">
                I know you're a little upset with me, and that makes my heart feel all wobbly.
                So I went offline all last night to prepare a tiny surprise, just for you. It's cute. I promise.
              </p>

              <div className="relative mt-8">
                <div className="absolute -inset-3 animate-ping rounded-[28px] bg-rose-300/40" />
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSurprise}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#F75A8A] to-[#E8604C] px-8 py-5 font-display text-[19px] font-extrabold text-white shadow-[0_18px_50px_-10px_rgba(247,90,138,0.65)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                    <Gift className="h-6 w-6 animate-wiggle" />
                  </span>
                  <span className="text-left leading-tight">
                    Click here
                    <span className="block text-[14px] font-bold opacity-90">I have a surprise for you</span>
                  </span>
                  <MousePointerClick className="h-6 w-6 animate-bounce-soft" />
                </motion.button>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-rose-400">
                <Star_Dot /> no peeking — just tap it <Star_Dot />
              </p>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="talk"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="pointer-events-auto flex min-h-[60vh] w-full flex-col items-center justify-end"
            >
              <div className="h-[38vh] w-full sm:h-[42vh]" />
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 18 }}
                className="bubble-tail relative w-full max-w-2xl rounded-[28px] border-2 border-[#FFE4EC] bg-white/95 p-5 shadow-[0_24px_70px_-18px_rgba(247,90,138,0.45)] backdrop-blur sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[#FFF1C9] ring-2 ring-amber-200">
                      <CuteFace mood="happy" size={48} />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-[17px] font-extrabold leading-none">Honey the Teddy <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-amber-700">live • walking to you</span></p>
                    <p className="mt-1 text-[13px] font-semibold text-stone-400">translating human sorry into teddy speak...</p>
                  </div>
                  <button
                    onClick={() => setVoiceOn((v) => { const nv = !v; if (!nv) stopSpeak(); return nv; })}
                    className={`grid h-9 w-9 place-items-center rounded-full border transition ${voiceOn ? "border-rose-200 bg-rose-50 text-rose-500" : "border-stone-200 bg-stone-50 text-stone-400"}`}
                    aria-label="toggle teddy voice"
                  >
                    {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-4 min-h-[86px] rounded-2xl bg-[#FFF8FA] p-4 text-[17px] font-semibold leading-relaxed text-[#5C3A2E] sm:text-[18px]">
                  {!teddyArrived ? (
                    <span className="flex items-center gap-2 text-rose-400">
                      <span className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-rose-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-rose-400" style={{ animationDelay: "0.15s" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-rose-400" style={{ animationDelay: "0.3s" }} />
                      </span>
                      Honey is waddling over with tiny legs...
                    </span>
                  ) : (
                    <>
                      {typed}
                      {!typedDone && <span className="ml-0.5 inline-block h-5 w-[3px] translate-y-[3px] animate-pulse bg-rose-400" />}
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {TEDDY_LINES.map((_, i) => (
                      <div key={i} className={`h-2 rounded-full transition-all ${i === lineIdx ? "w-8 bg-[#F75A8A]" : i < lineIdx ? "w-2 bg-rose-300" : "w-2 bg-rose-100"}`} />
                    ))}
                  </div>
                  <button
                    onClick={nextLine}
                    disabled={!teddyArrived}
                    className="group flex items-center gap-2 rounded-full bg-[#4A2C1F] px-6 py-3 font-display text-[15px] font-extrabold text-white shadow-lg transition hover:bg-[#F75A8A] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {lineIdx === TEDDY_LINES.length - 1 ? "Show me the letter" : typedDone ? "Next" : "Skip"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="note"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-auto relative flex w-full max-w-xl flex-col items-center"
            >
              <div className="h-[14vh]" />
              <motion.div
                initial={{ rotate: -3.5, scale: 0.9, opacity: 0 }}
                animate={{ rotate: -1, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 130, damping: 15, delay: 0.15 }}
                className="relative w-full rounded-[12px] border border-amber-100 bg-[#FFFDF6] p-5 shadow-[0_34px_90px_-24px_rgba(180,120,60,0.5)] sm:p-7"
              >
                {/* washi tape */}
                <div className="absolute -top-3 left-8 h-7 w-24 rotate-[-4deg] rounded-[3px] bg-[#FDA4BA]/70 shadow-sm" />
                <div className="absolute -top-3 right-8 h-7 w-24 rotate-[5deg] rounded-[3px] bg-[#F6C88F]/70 shadow-sm" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CuteFace mood="sleepy" size={46} />
                    <div className="leading-tight">
                      <p className="font-display text-[14px] font-extrabold">3:47 AM — he was still awake</p>
                      <p className="text-[12px] font-bold text-stone-400">offline, crafting this for you</p>
                    </div>
                  </div>
                  <Moon className="h-6 w-6 text-amber-400" />
                </div>

                <div className="mt-4 min-h-[210px] rounded-xl border border-dashed border-amber-200 bg-white/70 p-4 sm:mt-5 sm:min-h-[196px] sm:p-5">
                  <p className="font-hand whitespace-pre-line text-[26px] font-semibold leading-[1.28] text-[#5C4433] sm:text-[30px]">
                    {noteTyped}
                    {!noteDone && <span className="ml-0.5 inline-block h-6 w-[3px] translate-y-[4px] animate-pulse bg-amber-400" />}
                  </p>
                  {noteDone && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-hand mt-2 text-right text-[23px] font-semibold text-[#C2836A]">
                      — him, with a full heart
                    </motion.p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
                  <p className="text-[12px] font-bold leading-snug text-stone-400">
                    the words he couldn't
                    <br /> say to your face
                  </p>
                  <button
                    onClick={noteNext}
                    className="group flex shrink-0 items-center gap-2 rounded-full bg-[#4A2C1F] px-6 py-3 font-display text-[15px] font-extrabold text-white shadow-lg transition hover:bg-[#F75A8A]"
                  >
                    {noteDone ? "one more thing" : "Skip"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-auto grid w-full max-w-4xl items-center gap-6 lg:grid-cols-[1fr_1.15fr]"
            >
              <div className="hidden h-[420px] lg:block" />
              <div className="relative">
                <motion.div
                  initial={{ rotateX: 60, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="overflow-hidden rounded-[28px] border-2 border-white bg-white shadow-[0_30px_80px_-20px_rgba(247,90,138,0.4)]"
                >
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#F75A8A] to-[#E8604C] px-6 py-4 text-white">
                    <p className="flex items-center gap-2 font-display text-[16px] font-extrabold"><Mail className="h-5 w-5" /> A tiny letter, sealed with a paw</p>
                    <CuteFace mood="love" size={40} />
                  </div>
                  <div className="p-6 sm:p-7">
                    <p className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-rose-400">my dearest Nolo,</p>
                    <h2 className="font-display mt-1 text-[26px] font-extrabold leading-tight">I'm really, truly sorry.</h2>
                    <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#8B5E4F]">
                      I hate that I made you feel unimportant, even for a second. You mean the world to me —
                      your laugh is my favorite sound. Please let me make it up to you, starting with these:
                    </p>
                    <div className="mt-4 grid gap-3">
                      {PROMISES.map((p, i) => {
                        const Icon = p.icon;
                        const isOpen = flipped[i];
                        return (
                          <button
                            key={p.title}
                            onClick={() => { sounds.pop(); setFlipped((f) => f.map((v, idx) => (idx === i ? !v : v))); }}
                            className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-[#FFF8FA] p-[2px] text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-100"
                          >
                            <div className="flex items-center gap-3 rounded-[14px] bg-white/60 p-3">
                              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${p.color}`}>
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="flex-1">
                                <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-stone-400">{isOpen ? "tap to flip back" : p.front + " — tap to open"}</span>
                                <span className="font-display block text-[16px] font-extrabold leading-tight">{p.title}</span>
                                <AnimatePresence initial={false}>
                                  {isOpen && (
                                    <motion.span
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="block overflow-hidden text-[13.5px] font-semibold leading-snug text-[#8B5E4F]"
                                    >
                                      <span className="block pt-1">{p.back}</span>
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </span>
                              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${isOpen ? "rotate-45 bg-[#F75A8A] text-white" : "bg-rose-100 text-rose-500"}`}>
                                <span className="text-[18px] font-black leading-none">+</span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => { sounds.next(); stopSpeak(); setStage(4); }}
                      className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4A2C1F] py-4 font-display text-[16px] font-extrabold text-white transition hover:bg-[#F75A8A]"
                    >
                      There's one more thing...
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <p className="mt-2 text-center text-[12px] font-bold text-stone-400">{flipped.filter(Boolean).length}/3 promises opened</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className="pointer-events-auto flex w-full max-w-xl flex-col items-center text-center"
            >
              <div className="h-[26vh]" />
              <div className="relative w-full rounded-[32px] border-2 border-white bg-white/90 p-6 shadow-[0_30px_80px_-20px_rgba(247,90,138,0.5)] backdrop-blur sm:p-10">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                  <div className="animate-heartbeat"><CuteFace mood="pleading" size={88} /></div>
                </div>
                <p className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.14em] text-rose-500">
                  <Heart className="h-3.5 w-3.5 fill-current" /> the big question
                </p>
                <h2 className="font-display mt-3 text-[34px] font-extrabold leading-[1.02] sm:text-[46px]">
                  Nolo, will you
                  <span className="bg-gradient-to-r from-[#F75A8A] to-[#EAB16E] bg-clip-text text-transparent"> forgive me?</span>
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-[15px] font-semibold text-[#8B5E4F]">
                  Honey is holding his breath... and his little heart. Choose wisely — he's very dramatic.
                </p>
                <div className="relative mt-7 flex min-h-[120px] flex-col items-center justify-center gap-4">
                  <motion.button
                    animate={{ scale: yesSize }}
                    whileHover={{ scale: yesSize * 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={handleYes}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F75A8A] to-[#E8604C] px-10 py-4 font-display text-[20px] font-extrabold text-white shadow-[0_16px_40px_-10px_rgba(247,90,138,0.7)]"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                    Yes, I forgive you
                  </motion.button>
                  <motion.button
                    onMouseEnter={dodgeNo}
                    onTouchStart={dodgeNo}
                    onClick={dodgeNo}
                    animate={{ x: noPos.x, y: noPos.y }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="rounded-full border-2 border-stone-200 bg-white px-7 py-2.5 font-display text-[15px] font-extrabold text-stone-400 transition-colors hover:border-stone-300"
                  >
                    {NO_TEXTS[Math.min(noCount, NO_TEXTS.length - 1)]}
                  </motion.button>
                  {noCount > 2 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] font-bold text-rose-400">
                      The "No" button seems... scared. It keeps running away.
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {stage === 5 && (
            <motion.div
              key="yay"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto flex w-full max-w-2xl flex-col items-center text-center"
            >
              <div className="h-[36vh]" />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.15 }}
                className="w-full rounded-[32px] border-2 border-white bg-white/92 p-6 shadow-[0_30px_90px_-18px_rgba(247,90,138,0.55)] backdrop-blur sm:p-9"
              >
                <div className="mx-auto -mt-16 flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#F75A8A] to-[#EAB16E] px-5 py-2 font-display text-[14px] font-extrabold text-white shadow-lg">
                  <PartyPopper className="h-4 w-4" /> FORGIVENESS UNLOCKED
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <CuteFace mood="happy" size={72} />
                  <CuteFace mood="love" size={88} className="-translate-y-2 ring-4 ring-rose-100 rounded-full" />
                  <CuteFace mood="giggle" size={72} />
                </div>
                <h2 className="font-display mt-3 text-[38px] font-extrabold leading-[1] sm:text-[52px]">
                  YAY! Best decision
                  <span className="block bg-gradient-to-r from-[#F75A8A] via-[#E8604C] to-[#EAB16E] bg-clip-text text-transparent animate-shimmer">ever made!</span>
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15.5px] font-semibold leading-relaxed text-[#8B5E4F]">
                  You just made him the happiest human alive. Honey is singing his little heart out —
                  <span className="font-extrabold text-rose-500"> laah lah laaah!</span> Happiness: 1000% and rising.
                </p>
                <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2 text-center">
                  {[
                    { v: "∞", l: "hugs owed" },
                    { v: "1000%", l: "happiness" },
                    { v: "0", l: "grudges left" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-[#FFF8FA] p-3">
                      <p className="font-display text-[22px] font-extrabold text-[#F75A8A]">{s.v}</p>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    onClick={playTeddySong}
                    className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F75A8A] to-[#E8604C] px-7 py-3.5 font-display text-[16px] font-extrabold text-white shadow-lg shadow-rose-200 transition hover:scale-[1.03]"
                  >
                    <Music className="h-4.5 w-4.5" /> {singing ? "singing..." : "Sing it again!"}
                  </button>
                  <button
                    onClick={sendHug}
                    className="flex items-center justify-center gap-2 rounded-full border-2 border-rose-200 bg-white px-7 py-3.5 font-display text-[16px] font-extrabold text-rose-500 transition hover:bg-rose-50"
                  >
                    <Send className="h-4.5 w-4.5" /> Send him a hug back
                  </button>
                  <button
                    onClick={() => { stopSpeak(); setSinging(false); setStage(0); setNoCount(0); setNoPos({ x: 0, y: 0 }); setYesSize(1); setFlipped([false, false, false]); }}
                    className="flex items-center justify-center gap-2 rounded-full border-2 border-stone-200 bg-white px-7 py-3.5 font-display text-[16px] font-extrabold text-stone-400 transition hover:bg-stone-50"
                  >
                    <RotateCcw className="h-4.5 w-4.5" /> Replay surprise
                  </button>
                </div>
                <AnimatePresence>
                  {hugSent && (
                    <motion.p
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[14px] font-bold text-emerald-600"
                    >
                      <Heart className="h-4 w-4 fill-current" /> Hug delivered! He is smiling so big right now.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* bottom hint */}
      <footer className="pointer-events-none relative z-10 pb-5 text-center">
        <p className="text-[12px] font-bold tracking-wide text-rose-300">
          {stage === 0 ? "made with a wobbly heart + one very tired teddy" : stage === 5 ? "case closed — love wins" : "tip: drag the 3D scene to look around"}
        </p>
      </footer>
    </div>
  );
}

function Star_Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-300" />;
}
