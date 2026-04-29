"use client"

import { useRef } from "react"
import { motion } from "motion/react"
import DottedMap from "dotted-map"

interface Dot {
  start: { lat: number; lng: number; label?: string }
  end:   { lat: number; lng: number; label?: string }
}

interface WorldMapProps {
  dots?:      Dot[]
  lineColor?: string
  dotColor?:  string
}

export function WorldMap({
  dots      = [],
  lineColor = "#a78bfa",
  dotColor  = "#6d28d9",
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const map = new DottedMap({ height: 100, grid: "diagonal" })
  const svgMap = map.getSVG({
    radius:          0.22,
    color:           "rgba(139,92,246,0.25)",
    shape:           "circle",
    backgroundColor: "transparent",
  })

  const projectPoint = (lat: number, lng: number) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat)  * (400 / 180),
  })

  const createCurvedPath = (
    start: { x: number; y: number },
    end:   { x: number; y: number },
  ) => {
    const midX = (start.x + end.x) / 2
    const midY = Math.min(start.y, end.y) - 55
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
  }

  // Collect every endpoint, deduped by (lat, lng) — cities reused across
  // multiple routes (e.g. NYC as both an arrival and departure) would
  // otherwise render stacked dots with overlapping pulsing rings.
  const seen = new Set<string>()
  const endpoints: { x: number; y: number; key: string }[] = []
  for (const { start, end } of dots) {
    for (const { lat, lng } of [start, end]) {
      const key = `${lat},${lng}`
      if (seen.has(key)) continue
      seen.add(key)
      endpoints.push({ ...projectPoint(lat, lng), key })
    }
  }

  return (
    <div className="w-full aspect-[2/1] relative select-none">
      {/* dotted base map */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,white_12%,white_88%,transparent)]"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />

      {/* paths + dots overlay */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0" />
            <stop offset="8%"   stopColor={lineColor} stopOpacity="1" />
            <stop offset="92%"  stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
          {/* glow filter for endpoint dots */}
          <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* animated curved paths */}
        {dots.map((dot, i) => {
          const s = projectPoint(dot.start.lat, dot.start.lng)
          const e = projectPoint(dot.end.lat,   dot.end.lng)
          return (
            <motion.path
              key={`path-${i}`}
              d={createCurvedPath(s, e)}
              fill="none"
              stroke="url(#path-gradient)"
              strokeWidth="1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.3 + 0.45 * i, ease: "easeOut" }}
            />
          )
        })}

        {/* endpoint dots — one per unique city */}
        {endpoints.map(({ x, y, key }) => (
          <g key={key} filter="url(#dot-glow)">
            {/* solid core */}
            <circle cx={x} cy={y} r="2.2" fill={lineColor} />
            {/* pulsing ring */}
            <circle cx={x} cy={y} r="2.2" fill={lineColor} opacity="0.6">
              <animate attributeName="r"       from="2.2" to="9"  dur="1.8s" begin="0s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0"  dur="1.8s" begin="0s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  )
}
