import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PenTool, Type, Trash2 } from "lucide-react"

interface SignatureCanvasProps {
  /** Type of signature - affects canvas size */
  type?: "signature" | "initials"
  /** Callback when signature is completed */
  onCapture: (dataUrl: string) => void
  /** Callback when cancelled */
  onCancel: () => void
}

/**
 * SignatureCanvas - Component for capturing signatures
 * Supports two modes:
 * 1. Draw mode - Canvas for drawing with mouse/touch
 * 2. Type mode - Text input rendered in cursive font
 *
 * Returns base64 PNG image via onCapture callback
 */
export function SignatureCanvas({
  type = "signature",
  onCapture,
  onCancel,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [mode, setMode] = useState<"draw" | "type">("type")

  // Canvas dimensions based on type
  const canvasWidth = type === "initials" ? 200 : 400
  const canvasHeight = type === "initials" ? 80 : 100

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up canvas for drawing
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [canvasWidth, canvasHeight])

  // Get position from mouse/touch event
  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ("touches" in e) {
        const touch = e.touches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        }
      }
    },
    []
  )

  // Start drawing
  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (mode !== "draw") return
      e.preventDefault()

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      const { x, y } = getPosition(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
    },
    [mode, getPosition]
  )

  // Draw
  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || mode !== "draw") return
      e.preventDefault()

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      const { x, y } = getPosition(e)
      ctx.lineTo(x, y)
      ctx.stroke()
      setHasDrawn(true)
    },
    [isDrawing, mode, getPosition]
  )

  // Stop drawing
  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    setHasDrawn(false)
  }, [canvasWidth, canvasHeight])

  // Generate typed signature as image
  const generateTypedSignature = useCallback(
    (text: string): string => {
      const canvas = document.createElement("canvas")
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return ""

      // White background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw text
      ctx.fillStyle = "#1a1a1a"
      const fontSize = type === "initials" ? 36 : 44
      ctx.font = `italic ${fontSize}px "Brush Script MT", "Dancing Script", cursive, Georgia`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)

      return canvas.toDataURL("image/png")
    },
    [type, canvasWidth, canvasHeight]
  )

  // Handle apply button
  const handleApply = useCallback(() => {
    if (mode === "draw") {
      const canvas = canvasRef.current
      if (!canvas || !hasDrawn) return
      onCapture(canvas.toDataURL("image/png"))
    } else {
      if (!typedText.trim()) return
      const dataUrl = generateTypedSignature(typedText)
      onCapture(dataUrl)
    }
  }, [mode, hasDrawn, typedText, generateTypedSignature, onCapture])

  // Check if can apply
  const canApply = mode === "draw" ? hasDrawn : typedText.trim().length > 0

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="type" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Type
          </TabsTrigger>
          <TabsTrigger value="draw" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Draw
          </TabsTrigger>
        </TabsList>

        {/* Type Mode */}
        <TabsContent value="type" className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Type your {type === "initials" ? "initials" : "name"}:
            </label>
            <Input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={type === "initials" ? "e.g., TR" : "e.g., John Smith"}
              className="text-lg"
              style={{ fontFamily: '"Brush Script MT", cursive' }}
            />
          </div>

          {/* Preview */}
          {typedText && (
            <div className="rounded-lg bg-slate-100 p-4 text-center">
              <div
                className="text-slate-700"
                style={{
                  fontSize: type === "initials" ? "32px" : "28px",
                  fontFamily: '"Brush Script MT", "Dancing Script", cursive',
                  fontStyle: "italic",
                }}
              >
                {typedText}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Draw Mode */}
        <TabsContent value="draw" className="space-y-3">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-slate-300"
              style={{
                aspectRatio: `${canvasWidth}/${canvasHeight}`,
                maxHeight: `${canvasHeight}px`,
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {/* Clear button */}
            {hasDrawn && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCanvas}
                className="absolute right-2 top-2 h-8 gap-1 text-xs"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}

            {/* Hint */}
            {!hasDrawn && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Sign here
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApply}
          disabled={!canApply}
          className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
        >
          Apply {type === "initials" ? "Initials" : "Signature"}
        </Button>
      </div>
    </div>
  )
}

export default SignatureCanvas
