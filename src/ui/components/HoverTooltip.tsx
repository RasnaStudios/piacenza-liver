import { Paper } from "@mantine/core"
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { isMobile } from "react-device-detect"
import { getGodsDisplayNames } from "../../scene/LiverData"
import type { HoveredSection } from "../../types"
import { NumberBadge } from "./NumberBadge"

export type HoverTooltipHandle = {
  setPointer: (x: number, y: number, isOverCanvas: boolean) => void
}

interface HoverTooltipProps {
  hoveredSection: HoveredSection | null
  isPanelOpen?: boolean
  isModifierKeyPressed?: boolean
  isMouseOverPanel?: boolean
}

export const HoverTooltip = forwardRef<HoverTooltipHandle, HoverTooltipProps>(
  function HoverTooltip(
    { hoveredSection, isModifierKeyPressed = false, isMouseOverPanel = false },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null)
    const lastPointerRef = useRef({ x: 0, y: 0 })
    const overCanvasRef = useRef(true)
    const [isOverCanvas, setIsOverCanvas] = useState(true)

    const applyPosition = (x: number, y: number) => {
      const el = rootRef.current
      if (!el) return
      el.style.left = `${x + 15}px`
      el.style.top = `${y - 10}px`
    }

    useImperativeHandle(ref, () => ({
      setPointer(x, y, nextIsOverCanvas) {
        lastPointerRef.current = { x, y }
        applyPosition(x, y)
        if (overCanvasRef.current !== nextIsOverCanvas) {
          overCanvasRef.current = nextIsOverCanvas
          setIsOverCanvas(nextIsOverCanvas)
        }
      },
    }))

    useLayoutEffect(() => {
      if (!hoveredSection) return
      const { x, y } = lastPointerRef.current
      applyPosition(x, y)
    }, [hoveredSection])

    if (
      !hoveredSection ||
      isMobile ||
      isModifierKeyPressed ||
      !isOverCanvas ||
      isMouseOverPanel
    ) {
      return null
    }

    const deityNames = getGodsDisplayNames(hoveredSection.gods || [])

    return (
      <Paper
        ref={rootRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          background: "var(--gradient-tooltip)",
          borderRadius: 12,
          padding: "6px 10px",
          backdropFilter: "blur(15px) saturate(180%)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(139, 101, 65, 0.2), 0 2px 8px rgba(212, 175, 55, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          maxWidth: 320,
          minWidth: "auto",
          opacity: 1,
          transform: "translateY(0) scale(1)",
          transition:
            "opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
          pointerEvents: "none",
        }}
        className="text-primary panel-border"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <NumberBadge value={hoveredSection.id} size={28} />
            <div
              className="text-primary"
              style={{
                fontSize: "1em",
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: "0.3px",
              }}
            >
              {deityNames}
            </div>
          </div>
          <span
            className="font-etruscan text-gradient-gold"
            style={{
              fontSize: "1.2em",
              fontStyle: "italic",
              letterSpacing: "0.5px",
            }}
          >
            {hoveredSection.etruscanText}
          </span>
        </div>
      </Paper>
    )
  },
)
