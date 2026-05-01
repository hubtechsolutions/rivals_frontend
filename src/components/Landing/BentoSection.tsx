"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import {
  TrendingUp, Bell, Zap, MessageCircle, ArrowUpRight,
  Globe, BarChart2, Users, Target,
} from "lucide-react"
import { Radar, RadarIconContainer } from "@/components/ui/radar-effect"

/* ─── BentoGrid — single column on mobile, 6-col 2-row on lg+ ──────────── */
function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 grid-cols-1 lg:grid-cols-6 lg:[grid-template-rows:360px_280px]">
      {children}
    </div>
  )
}

function BentoCard({
  children,
  colSpan = 2,
  className = "",
}: {
  children: React.ReactNode
  colSpan?: number
  className?: string
}) {
  const lgColSpanClass = colSpan === 3 ? "lg:col-span-3" : "lg:col-span-2"
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-violet-400/10 bg-white/[0.03] backdrop-blur-sm col-span-1 ${lgColSpanClass} h-[340px] lg:h-auto ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Box 4 (bottom-middle, 33%): Multi-Rival Tracking ──────────────────── */
// Each rival has a FULLY INDEPENDENT path — no shared segments, no merging.
// Middle → straight horizontal.
// Top → 45° diagonal (dx=dy=38) to its own bend point ABOVE center-Y, then straight to center.
// Bottom → mirror, bend point BELOW center-Y.
// Result: 3 completely separate visual paths.
// Outward elbow paths — bend protrudes AWAY from center line:
//   middle  → straight horizontal to center
//   top     → horizontal along rival-Y outward, then 45° diagonal DOWN to center
//   bottom  → horizontal along rival-Y outward, then 45° diagonal UP to center
// dy from rival to center = 53px  →  45° diagonal leg: dx = dy = 53
const RVW = 300, RVH = 150, RCX = 150, RCY = 75

const LEFT_RIVALS = [
  { name: "Acme",   color: "#a78bfa", x: 38, y: 22,  delay: 0   },
  { name: "CompX",  color: "#60a5fa", x: 32, y: 75,  delay: 0.8 },
  { name: "NexaHQ", color: "#34d399", x: 38, y: 128, delay: 1.6 },
]
const RIGHT_RIVALS = [
  { name: "Rivalio", color: "#fbbf24", x: 262, y: 22,  delay: 0.4 },
  { name: "StartUp", color: "#f472b6", x: 268, y: 75,  delay: 1.2 },
  { name: "Baseify", color: "#fb923c", x: 262, y: 128, delay: 2.0 },
]
const ALL_RIVALS = [...LEFT_RIVALS, ...RIGHT_RIVALS]

function mkElbow(rx: number, ry: number): string {
  if (ry === RCY) return `M ${rx} ${ry} L ${RCX} ${RCY}`
  // dy determines the 45° leg length (dx = dy for true 45°)
  const dy = Math.abs(RCY - ry)
  // bend point: stays at rival's Y, then moves horizontally toward center by dy
  const bendX = RCX > rx ? RCX - dy : RCX + dy
  // path: straight horizontal at rival-Y → 45° diagonal to center
  return `M ${rx} ${ry} L ${bendX} ${ry} L ${RCX} ${RCY}`
}

function RivalsTrackingTile() {
  return (
    <BentoCard colSpan={2} className="flex flex-col overflow-hidden">
      <div className="relative flex-1 flex items-center justify-center px-2 pt-3 min-h-0">
        <svg viewBox={`0 0 ${RVW} ${RVH}`} className="w-full h-full">
          <defs>
            <filter id="rdotGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="1.3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Soft center bloom */}
          <circle cx={RCX} cy={RCY} r="26" fill="rgba(124,58,237,0.10)" />

          {ALL_RIVALS.map((rival) => {
            const path = mkElbow(rival.x, rival.y)
            return (
              <g key={rival.name}>
                {/* Faint static elbow */}
                <path d={path} fill="none" stroke={rival.color}
                  strokeWidth="0.9" opacity="0.18" strokeLinejoin="miter" />

                {/* Small traveling dot along the elbow */}
                <motion.path
                  d={path}
                  fill="none"
                  stroke={rival.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                  pathLength="100"
                  strokeDasharray="2 100"
                  filter="url(#rdotGlow)"
                  initial={{ strokeDashoffset: 102 }}
                  animate={{ strokeDashoffset: -10 }}
                  transition={{
                    duration: 2.0,
                    delay: rival.delay,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1.2,
                  }}
                />

                {/* Rival pill — solid bg so paths don't bleed through */}
                <rect x={rival.x - 20} y={rival.y - 8} width="40" height="16" rx="3.5"
                  fill="#0d0b17" stroke={rival.color + "60"} strokeWidth="0.8" />
                <text x={rival.x} y={rival.y} fill={rival.color} fontSize="6.5"
                  fontWeight="600" textAnchor="middle" dominantBaseline="central"
                  fontFamily="Inter, ui-sans-serif, sans-serif">
                  {rival.name}
                </text>
              </g>
            )
          })}

          {/* Center hub */}
          <motion.circle cx={RCX} cy={RCY} r="19" fill="none" stroke="#7c3aed" strokeWidth="1.2"
            animate={{ r: [19, 32], opacity: [0.6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }} />
          <circle cx={RCX} cy={RCY} r="19" fill="#7c3aed" />
          <circle cx={RCX} cy={RCY} r="26" fill="none"
            stroke="rgba(124,58,237,0.22)" strokeWidth="0.8" />
          <text x={RCX} y={RCY + 5} fill="#fff" fontSize="14" fontWeight="700"
            textAnchor="middle" fontFamily="Inter, ui-sans-serif, sans-serif">
            R
          </text>
        </svg>
      </div>

      <div className="px-5 pb-4 pt-1 flex-shrink-0">
        <h3 className="font-body text-[13px] font-semibold text-violet-50 mb-0.5">
          Track Multiple Rivals
        </h3>
        <p className="font-body text-[11px] text-slate-400/60 leading-relaxed">
          Pull live signals from every competitor into one unified hub.
        </p>
      </div>
    </BentoCard>
  )
}

/* ─── Box 2 (top-right, 50%): Animated SVG wave chart ───────────────────── */
// Pre-computed seamlessly tiling wave (2 tiles = 1200 SVG units wide).
// y(x % TILE_W) ensures tile boundaries have the same Y → seamless loop.
const TILE_W = 600
const CHART_H = 110

const waveY = (x: number): number => {
  const n = ((x % TILE_W) + TILE_W) % TILE_W  // normalised [0, TILE_W)
  return (
    54
    - 26 * Math.sin((2 * Math.PI * n) / TILE_W)
    - 13 * Math.sin((2 * Math.PI * n * 3) / TILE_W + 0.7)
    - 7  * Math.sin((2 * Math.PI * n * 5) / TILE_W + 1.5)
    - 3  * Math.sin((2 * Math.PI * n * 8) / TILE_W + 0.3)
  )
}

const WAVE_PTS: [number, number][] = []
for (let x = 0; x <= TILE_W * 2; x += 4) WAVE_PTS.push([x, waveY(x)])

const STROKE_D = WAVE_PTS.map(([x, y], i) =>
  `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
).join(" ")
const FILL_D = `${STROKE_D} L${TILE_W * 2},${CHART_H} L0,${CHART_H} Z`

function AnalyticsTile() {
  return (
    <BentoCard colSpan={3} className="flex flex-col">
      <div className="p-5 pb-3 flex-shrink-0">
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-violet-300/60 mb-0.5">
          Website Traffic
        </p>
        <div className="flex items-end gap-3">
          <p className="font-serif italic text-[2.6rem] leading-none text-violet-50">418.2K</p>
          <span className="flex items-center gap-1 text-emerald-400 text-[12px] font-semibold mb-1">
            <TrendingUp size={13} /> +23.4%
          </span>
        </div>
        <p className="font-body text-[11px] text-slate-400/55 mt-0.5">
          vs last month across tracked competitors
        </p>
      </div>

      {/* Infinite scrolling SVG wave */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {/* Top fade so it blends into the card */}
        <div
          className="absolute inset-x-0 top-0 h-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(7,6,12,0.6) 0%, transparent 100%)" }}
        />
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${TILE_W} ${CHART_H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Slide 2 tiles left then snap back — seamless because tile edges match */}
          <motion.g
            animate={{ x: [0, -TILE_W] }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity, repeatType: "loop" }}
          >
            {/* Filled area */}
            <path d={FILL_D} fill="url(#waveGrad)" />
            {/* Glow halo behind the line */}
            <path
              d={STROKE_D}
              fill="none"
              stroke="#7c3aed"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.25}
            />
            {/* Primary line */}
            <path
              d={STROKE_D}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />
          </motion.g>
        </svg>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-t border-white/[0.05] flex-shrink-0">
        {[
          { label: "Direct",   val: "142K", pct: "+18%" },
          { label: "Organic",  val: "198K", pct: "+31%" },
          { label: "Referral", val: "78K",  pct: "+9%"  },
        ].map(({ label, val, pct }) => (
          <div key={label} className="py-3 px-4">
            <p className="font-body text-[10px] text-slate-400/55 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="font-body text-[13px] font-semibold text-violet-100">{val}</p>
            <p className="font-body text-[10px] text-emerald-400">{pct}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

/* ─── Box 3 (bottom-left, 33%): Scrolling signal list ───────────────────── */
const SIGNAL_ITEMS = [
  { brand: "Acme Corp",    event: "Pricing page updated",      tag: "Pricing",  color: "#a78bfa", tagColor: "#7c3aed" },
  { brand: "Rivalio",      event: "New feature: AI assistant", tag: "Product",  color: "#60a5fa", tagColor: "#2563eb" },
  { brand: "CompeteX",     event: "Homepage headline changed", tag: "Content",  color: "#f472b6", tagColor: "#db2777" },
  { brand: "StartupBase",  event: "Twitter followers +840",    tag: "Social",   color: "#34d399", tagColor: "#059669" },
  { brand: "NexaHQ",       event: "Blog post published",       tag: "Content",  color: "#fbbf24", tagColor: "#d97706" },
  { brand: "Acme Corp",    event: "G2 rating dropped 4.7→4.5", tag: "Review",  color: "#a78bfa", tagColor: "#7c3aed" },
  { brand: "Rivalio",      event: "Careers page 3 new roles",  tag: "Hiring",   color: "#60a5fa", tagColor: "#2563eb" },
  { brand: "NexaHQ",       event: "Ad spend increased 40%",    tag: "Ads",      color: "#fbbf24", tagColor: "#d97706" },
]

// Double the list for seamless infinite loop
const SCROLL_ITEMS = [...SIGNAL_ITEMS, ...SIGNAL_ITEMS]

function SignalScrollTile() {
  const itemH = 52   // px per item including gap
  const totalH = SIGNAL_ITEMS.length * itemH

  return (
    <BentoCard colSpan={2} className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-slate-400/60">
          Live Signals
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Scrolling list */}
      <div className="relative flex-1 overflow-hidden min-h-0">
        {/* Top blur */}
        <div
          className="absolute inset-x-0 top-0 h-10 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(7,6,12,1) 0%, transparent 100%)" }}
        />
        {/* Bottom blur */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(7,6,12,1) 0%, transparent 100%)" }}
        />

        <motion.div
          className="flex flex-col gap-2 px-3 py-2"
          animate={{ y: [0, -totalH] }}
          transition={{ duration: 14, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          {SCROLL_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex-shrink-0"
            >
              <span
                className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                style={{ background: item.color + "20", color: item.color }}
              >
                {item.brand[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[11px] font-semibold text-violet-100 truncate leading-tight">
                  {item.brand}
                </p>
                <p className="font-body text-[10px] text-slate-400/70 truncate leading-tight mt-0.5">
                  {item.event}
                </p>
              </div>
              <span
                className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold border"
                style={{
                  background: item.tagColor + "18",
                  borderColor: item.tagColor + "40",
                  color: item.color,
                }}
              >
                {item.tag}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </BentoCard>
  )
}

/* ─── Box 4 (bottom-middle, 33%): AI Chat ───────────────────────────────── */
const CHAT_MESSAGES = [
  { text: "Acme Corp just dropped their Pro plan by 15% — third cut this quarter.", sender: "ai",   delay: 0   },
  { text: "Any pattern before their previous cuts?",                                 sender: "user", delay: 2.2 },
  { text: "Yes — each cut preceded a major feature launch by 2–3 weeks.",           sender: "ai",   delay: 4.5 },
  { text: "So a launch is likely imminent. What should we do?",                      sender: "user", delay: 7.0 },
  { text: "I'd recommend locking in annual customers now. Want me to draft a retention play?", sender: "ai", delay: 9.5 },
]

function TypingText({ text }: { text: string }) {
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.018 }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden:  { opacity: 0, y: 6,  filter: "blur(6px)" },
            visible: { opacity: 1, y: 0,  filter: "blur(0px)" },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

function AIChatTile() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-60px" })
  const [visible, setVisible] = useState<typeof CHAT_MESSAGES>([])

  useEffect(() => {
    if (!isInView) return
    const timers = CHAT_MESSAGES.map(msg =>
      setTimeout(() => {
        setVisible(prev =>
          prev.find(m => m.text === msg.text) ? prev : [...prev, msg],
        )
      }, msg.delay * 1000),
    )
    return () => timers.forEach(clearTimeout)
  }, [isInView])

  return (
    <BentoCard colSpan={3} className="flex flex-col overflow-hidden">
      <div ref={containerRef} className="flex flex-col h-full p-5">
        {/* Header */}
        <div className="flex items-center gap-2 flex-shrink-0 mb-3">
          <span className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
            <MessageCircle size={12} className="text-violet-400" />
          </span>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-violet-300/70">
            Rivalis AI
          </p>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-violet-300/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
            Online
          </span>
        </div>

        {/* Chat messages */}
        <div className="relative flex-1 overflow-hidden flex flex-col justify-end gap-2 min-h-0">
          <div
            className="absolute inset-x-0 top-0 h-10 pointer-events-none z-10"
            style={{ background: "linear-gradient(to bottom, rgba(7,6,12,0.9) 0%, transparent 100%)" }}
          />
          {visible.map(msg => (
            <motion.div
              layout
              key={msg.text}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[88%] px-3 py-2 rounded-xl text-[11.5px] leading-[1.5] font-body border
                  ${msg.sender === "user"
                    ? "rounded-tr-sm text-white border-violet-500/40"
                    : "rounded-tl-sm text-slate-300/85 bg-white/[0.04] border-white/[0.07]"
                  }`}
                style={msg.sender === "user" ? {
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 12px rgba(124,58,237,0.25)",
                } : {}}
              >
                <TypingText text={msg.text} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          <span className="font-body text-[11px] text-slate-500 flex-1">Ask Rivalis AI…</span>
          <span className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center">
            <ArrowUpRight size={10} className="text-violet-400" />
          </span>
        </div>
      </div>
    </BentoCard>
  )
}

/* ─── Box 5 (bottom-right, 33%): Signal Radar ───────────────────────────── */
// Radar center sits 8px above card bottom (h=280px, radar -bottom-14 h-32).
// Icons placed at polar coords (r, θ) from radar center; θ from vertical, CW positive.
// discoverAt = (250 + θ) / 360  —  matches when the CW sweep (starting at 20°) points at each icon.
// bottom = radarCenterFromBottom(8) + r·cos(θ) - halfIconHeight(27)
// left   = calc(50% + r·sin(θ) - halfIconWidth(18))
// rotate = θ/3  —  subtle tilt so icons follow the ring curvature
// Sweep: 180°→360° (right→up→left). line_rotation = 270° - θ.
// discoverAt = (line_rotation - 180) / 180
const RADAR_ICONS = [
  {
    icon: <Zap size={13} className="text-cyan-400" />, text: "Signals",
    discoverAt: 0.17, // θ=+60° → line_rotation=210°
    pos: { bottom: "21px", left: "calc(50% + 51px)", transform: "rotate(20deg)" },
  },
  {
    icon: <Target size={13} className="text-pink-400" />, text: "Ads",
    discoverAt: 0.28, // θ=+40° → line_rotation=230°
    pos: { bottom: "65px", left: "calc(50% + 53px)", transform: "rotate(13deg)" },
  },
  {
    icon: <Users size={13} className="text-amber-400" />, text: "Hiring",
    discoverAt: 0.42, // θ=+15° → line_rotation=255°
    pos: { bottom: "121px", left: "calc(50% + 20px)", transform: "rotate(5deg)" },
  },
  {
    icon: <BarChart2 size={13} className="text-emerald-400" />, text: "Social",
    discoverAt: 0.58, // θ=-15° → line_rotation=285°
    pos: { bottom: "121px", left: "calc(50% - 56px)", transform: "rotate(-5deg)" },
  },
  {
    icon: <Globe size={13} className="text-blue-400" />, text: "Web",
    discoverAt: 0.72, // θ=-40° → line_rotation=310°
    pos: { bottom: "65px", left: "calc(50% - 89px)", transform: "rotate(-13deg)" },
  },
  {
    icon: <TrendingUp size={13} className="text-violet-400" />, text: "Pricing",
    discoverAt: 0.83, // θ=-60° → line_rotation=330°
    pos: { bottom: "21px", left: "calc(50% - 87px)", transform: "rotate(-20deg)" },
  },
]

function AlertsTile() {
  return (
    <BentoCard colSpan={2} className="flex flex-col overflow-hidden">
      <div className="relative flex h-full flex-col px-5 pt-4 pb-4 overflow-hidden">

        <div className="relative z-50 flex w-full items-center justify-between flex-shrink-0">
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-slate-400/60">
            Signal Radar
          </p>
          <motion.div
            className="flex items-center gap-1.5 text-[10px] text-violet-300/60"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            scanning
          </motion.div>
        </div>

        {/* Icons placed absolutely along radar rings, each tilted to follow the arc */}
        {RADAR_ICONS.map((item) => (
          <div key={item.text} className="absolute z-50" style={item.pos}>
            <RadarIconContainer icon={item.icon} text={item.text} discoverAt={item.discoverAt} />
          </div>
        ))}

        {/* Radar — clipped at bottom, creates the arc-horizon effect */}
        <Radar className="absolute -bottom-14 left-1/2 -translate-x-1/2 h-32 w-32" />

      </div>
    </BentoCard>
  )
}

function SectionHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="font-serif font-normal text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-violet-50 mb-4"
      >
        Your rivals, fully{" "}
        <span
          className="italic bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 40%, #a78bfa 100%)" }}
        >
          exposed.
        </span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-body text-[16px] text-slate-300/50 max-w-[480px] leading-relaxed"
      >
        From pricing shifts to social surges — Rivalis surfaces every signal that matters, before your competitors act on it.
      </motion.p>
    </div>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function BentoSection() {
  return (
    <section className="relative w-full bg-[#07060c] py-16 px-4 sm:px-6 lg:py-24 lg:px-12 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(88,28,180,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <SectionHeader />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/*
           * 6-column grid
           * Row 1 (300px): Box 1 [col 1-3] · Box 2 [col 4-6]
           * Row 2 (220px): Box 3 [col 1-2] · Box 4 [col 3-4] · Box 5 [col 5-6]
           */}
          <BentoGrid>
            <AIChatTile />
            <AnalyticsTile />
            <SignalScrollTile />
            <RivalsTrackingTile />
            <AlertsTile />
          </BentoGrid>
        </motion.div>
      </div>
    </section>
  )
}
