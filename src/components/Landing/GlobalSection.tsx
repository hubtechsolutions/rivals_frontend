"use client"

import { motion } from "motion/react"
import { WorldMap } from "@/components/ui/world-map"

/* ── competitor signal routes between global business hubs ── */
const ROUTES = [
  // Americas corridor
  { start: { lat: 37.7749, lng: -122.4194, label: "San Francisco" },
    end:   { lat: 40.7128, lng:  -74.0060, label: "New York"      } },
  // Trans-Atlantic
  { start: { lat: 40.7128, lng:  -74.0060, label: "New York"    },
    end:   { lat: 51.5074, lng:   -0.1278, label: "London"       } },
  // Europe → India
  { start: { lat: 51.5074, lng:   -0.1278, label: "London"      },
    end:   { lat: 28.6139, lng:   77.2090, label: "New Delhi"    } },
  // India → Singapore
  { start: { lat: 28.6139, lng:   77.2090, label: "New Delhi"   },
    end:   { lat:  1.3521, lng:  103.8198, label: "Singapore"    } },
  // Singapore → Tokyo
  { start: { lat:  1.3521, lng:  103.8198, label: "Singapore"   },
    end:   { lat: 35.6762, lng:  139.6503, label: "Tokyo"        } },
  // US → Brazil
  { start: { lat: 37.7749, lng: -122.4194, label: "San Francisco" },
    end:   { lat: -23.5505, lng: -46.6333, label: "São Paulo"    } },
]

export default function GlobalSection() {
  return (
    <section className="relative w-full bg-[#07060c] py-20 px-6 lg:px-12 overflow-hidden">

      {/* top separator line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(167,139,250,0.15) 50%, transparent 100%)",
        }}
      />

      {/* soft center bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 60%, rgba(88,28,180,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col items-center">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/20 bg-violet-500/10 mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-violet-300 tracking-widest uppercase">
            Global Intelligence
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-serif font-normal text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-violet-50 text-center mb-5"
        >
          Your rivals operate{" "}
          <span
            className="italic bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 40%, #a78bfa 100%)",
            }}
          >
            everywhere.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="font-body text-[16px] text-slate-300/50 max-w-[480px] text-center leading-relaxed mb-14"
        >
          Rivalis monitors competitor signals across every market — from San
          Francisco to Singapore — so no move goes unnoticed.
        </motion.p>

        {/* ── Map ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="w-full overflow-hidden"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 75% at 50% 50%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 75% at 50% 50%, black 30%, transparent 100%)",
          }}
        >
          <WorldMap dots={ROUTES} lineColor="#a78bfa" />
        </motion.div>

      </div>
    </section>
  )
}
