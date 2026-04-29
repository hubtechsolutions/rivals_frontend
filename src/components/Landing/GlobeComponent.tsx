"use client"

import createGlobe from "cobe"
import { useEffect, useRef, useCallback } from "react"

const MARKERS = [
  { location: [37.78, -122.44] as [number, number], size: 0.04,  id: "sf"  },
  { location: [40.71, -74.01]  as [number, number], size: 0.045, id: "nyc" },
  { location: [51.51, -0.13]   as [number, number], size: 0.04,  id: "lon" },
  { location: [35.68, 139.65]  as [number, number], size: 0.04,  id: "tok" },
  { location: [1.35,  103.82]  as [number, number], size: 0.035, id: "sin" },
  { location: [28.61, 77.21]   as [number, number], size: 0.03,  id: "del" },
  { location: [31.23, 121.47]  as [number, number], size: 0.032, id: "sha" },
  { location: [-33.87, 151.21] as [number, number], size: 0.025, id: "syd" },
  { location: [25.2,  55.27]   as [number, number], size: 0.025, id: "dxb" },
  { location: [22.32, 114.17]  as [number, number], size: 0.025, id: "hk"  },
  { location: [-23.55, -46.63] as [number, number], size: 0.022, id: "sao" },
]

const LABELED_MARKERS = [
  { id: "sf",  label: "San Francisco" },
  { id: "nyc", label: "New York"      },
  { id: "lon", label: "London"        },
  { id: "tok", label: "Tokyo"         },
  { id: "sin", label: "Singapore"     },
  { id: "dxb", label: "Dubai"         },
]

export default function GlobeComponent({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef    = useRef(0)
  const widthRef  = useRef(0)
  const rafRef    = useRef<number>(0)
  const pointerInteracting = useRef<number | null>(null)
  const pointerDelta       = useRef(0)

  const onPointerDown = useCallback((x: number) => {
    pointerInteracting.current = x - pointerDelta.current
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
  }, [])

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
  }, [])

  const onPointerMove = useCallback((x: number) => {
    if (pointerInteracting.current !== null) {
      pointerDelta.current = x - pointerInteracting.current
    }
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) widthRef.current = canvasRef.current.offsetWidth
    }
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width:  widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.22,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 5.2,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ mapBaseBrightness: 0.02, markerElevation: 0.015 } as any),
      baseColor:   [0.13, 0.07, 0.22],
      markerColor: [0.78, 0.55, 1.0],
      glowColor:   [0.48, 0.22, 0.92],
      opacity: 0.92,
      markers: MARKERS,
    } as Parameters<typeof createGlobe>[1])

    function animate() {
      if (pointerInteracting.current === null) phiRef.current += 0.003
      globe.update({
        phi:    phiRef.current + pointerDelta.current / 200,
        width:  widthRef.current * 2,
        height: widthRef.current * 2,
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1"
    }, 120)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: "100%", aspectRatio: "1 / 1" }}
    >
      {/* Ambient atmosphere */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.08) 40%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      {/* Orbit ring */}
      <div className="orbit-ring" aria-hidden="true">
        <svg className="orbit-svg" viewBox="0 0 300 300">
          <defs>
            <path
              id="globeOrbitPath"
              d="M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0"
            />
          </defs>
          <text className="orbit-text">
            <textPath href="#globeOrbitPath">
              {"Track Rivals · Live Intelligence · Competitive Edge · Market Signals · ".repeat(3)}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => onPointerDown(e.clientX)}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
        onMouseMove={(e) => onPointerMove(e.clientX)}
        onTouchMove={(e) => e.touches[0] && onPointerMove(e.touches[0].clientX)}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
          contain: "layout paint size",
        }}
      />

      {/* City labels — CSS Anchor Positioning (Chrome 125+) */}
      {LABELED_MARKERS.map((m) => (
        <div
          key={m.id}
          className="globe-city-label"
          style={
            {
              positionAnchor: `--cobe-${m.id}`,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            } as React.CSSProperties
          }
        >
          {m.label}
        </div>
      ))}

      <style>{`
        .orbit-ring {
          position: absolute;
          inset: -2%;
          pointer-events: none;
          z-index: 1;
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, black 48%, black 100%);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, black 48%, black 100%);
        }
        .orbit-svg {
          width: 100%;
          height: 100%;
          -webkit-transform: rotateX(62deg);
          transform: rotateX(62deg);
          animation: orbit-spin 30s linear infinite, orbit-fade-in 1.7s ease 0.5s both;
        }
        .orbit-text {
          font-family: var(--font-geist-mono), monospace;
          font-size: 6px;
          fill: rgba(167, 139, 250, 0.7);
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }
        @keyframes orbit-spin {
          from { transform: rotateX(62deg) rotate(0deg); }
          to   { transform: rotateX(62deg) rotate(360deg); }
        }
        @keyframes orbit-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .globe-city-label {
          position: absolute;
          position-area: top center;
          margin-bottom: 5px;
          font-family: var(--font-jakarta), sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: rgba(196, 181, 253, 0.92);
          white-space: nowrap;
          pointer-events: none;
          transition: opacity 0.3s ease, filter 0.3s ease;
          text-shadow: 0 0 10px rgba(124, 58, 237, 0.9), 0 1px 4px rgba(0,0,0,1);
        }
      `}</style>
    </div>
  )
}
