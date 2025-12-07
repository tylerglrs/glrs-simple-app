import { Scissors } from "lucide-react"
import type { PageBreakBlock } from "../../../types"

interface PageBreakPropertiesProps {
  block: PageBreakBlock
  onUpdate: (updates: Partial<PageBreakBlock>) => void
}

/**
 * PageBreakProperties - Properties panel for page break blocks
 * Minimal - just shows info about what a page break does
 */
export function PageBreakProperties({ block: _block, onUpdate: _onUpdate }: PageBreakPropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center">
        <Scissors className="mx-auto mb-3 h-8 w-8 rotate-90 text-destructive/50" />
        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
          Page Break
        </h4>
        <p className="text-xs text-muted-foreground/70">
          Forces content after this block to start on a new page when the document is rendered or exported.
        </p>
      </div>

      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> Use page breaks to control document pagination and ensure sections start on fresh pages.
        </p>
      </div>
    </div>
  )
}

export default PageBreakProperties
