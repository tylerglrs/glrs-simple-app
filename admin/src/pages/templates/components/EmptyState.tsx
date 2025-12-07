import { Button } from "@/components/ui/button"
import {
  FileText,
  BookOpen,
  FileType2,
  AlignLeft,
  FileOutput,
  Upload,
  Plus,
} from "lucide-react"
import type { TemplateType } from "../types"

interface EmptyStateProps {
  filterType: TemplateType | "all"
  onCreateNew: () => void
}

// Map template types to icons and labels
const TYPE_CONFIG: Record<
  TemplateType | "all",
  { icon: React.ElementType; label: string }
> = {
  all: { icon: FileText, label: "templates" },
  document: { icon: FileText, label: "documents" },
  cover: { icon: BookOpen, label: "cover pages" },
  header: { icon: FileType2, label: "headers" },
  footer: { icon: AlignLeft, label: "footers" },
  endPage: { icon: FileOutput, label: "end pages" },
  uploaded: { icon: Upload, label: "uploaded documents" },
}

/**
 * EmptyState - Displayed when no templates match the current filter
 */
export function EmptyState({ filterType, onCreateNew }: EmptyStateProps) {
  const isFiltered = filterType !== "all"
  const config = TYPE_CONFIG[filterType] || TYPE_CONFIG.all
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center md:px-10 md:py-20">
      {/* Illustration */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 md:h-28 md:w-28">
        <Icon className="h-12 w-12 text-indigo-500 md:h-14 md:w-14" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-muted-foreground md:text-xl">
        {isFiltered ? `No ${config.label} yet` : "No templates yet"}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground/70 md:text-base">
        {isFiltered
          ? `Create your first ${config.label.replace(/s$/, "")} to get started.`
          : "Templates help you create consistent documents faster. Create cover pages, headers, footers, and full document templates."}
      </p>

      {/* CTA Button */}
      <Button
        onClick={onCreateNew}
        className="bg-gradient-to-r from-primary to-primary-700 hover:shadow-lg"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Template
      </Button>
    </div>
  )
}

export default EmptyState
