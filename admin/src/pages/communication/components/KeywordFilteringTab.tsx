import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Filter,
  Plus,
  X,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react"

interface ModerationSettings {
  blockedKeywords: string[]
  autoFlagEnabled: boolean
  warningThreshold: number
}

export function KeywordFilteringTab() {
  const { adminUser } = useAuth()
  const [settings, setSettings] = useState<ModerationSettings>({
    blockedKeywords: [],
    autoFlagEnabled: false,
    warningThreshold: 3,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [removingKeyword, setRemovingKeyword] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const settingsDoc = await getDoc(
        doc(db, "settings", `moderation_${CURRENT_TENANT}`)
      )

      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        setSettings({
          blockedKeywords: data.blockedKeywords || [],
          autoFlagEnabled: data.autoFlagEnabled || false,
          warningThreshold: data.warningThreshold || 3,
        })
      }
    } catch (error) {
      console.error("Error loading moderation settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", `moderation_${CURRENT_TENANT}`), {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid || "",
        tenantId: CURRENT_TENANT,
      })

      toast.success("Settings saved successfully")
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase()
    if (!keyword) {
      toast.error("Please enter a keyword")
      return
    }
    if (settings.blockedKeywords.includes(keyword)) {
      toast.error("Keyword already exists")
      return
    }

    setSettings((prev) => ({
      ...prev,
      blockedKeywords: [...prev.blockedKeywords, keyword],
    }))
    setNewKeyword("")
    setHasChanges(true)
  }

  const handleRemoveKeyword = (keyword: string) => {
    setSettings((prev) => ({
      ...prev,
      blockedKeywords: prev.blockedKeywords.filter((k) => k !== keyword),
    }))
    setRemovingKeyword(null)
    setHasChanges(true)
  }

  const handleAutoFlagToggle = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      autoFlagEnabled: enabled,
    }))
    setHasChanges(true)
  }

  const handleThresholdChange = (value: string) => {
    const threshold = parseInt(value) || 3
    setSettings((prev) => ({
      ...prev,
      warningThreshold: Math.max(1, Math.min(10, threshold)),
    }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Auto-Flag Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Auto-Flag Settings
          </CardTitle>
          <CardDescription>
            Configure automatic content flagging based on blocked keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Flag Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="font-medium">Enable Auto-Flagging</Label>
              <p className="text-sm text-muted-foreground">
                Automatically flag content containing blocked keywords
              </p>
            </div>
            <Switch
              checked={settings.autoFlagEnabled}
              onCheckedChange={handleAutoFlagToggle}
            />
          </div>

          {/* Warning Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold">Warning Threshold (Auto-Ban)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="threshold"
                type="number"
                min="1"
                max="10"
                value={settings.warningThreshold}
                onChange={(e) => handleThresholdChange(e.target.value)}
                className="w-24"
              />
              <p className="text-sm text-muted-foreground">
                warnings before automatic suspension
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#069494]" />
            Blocked Keywords
          </CardTitle>
          <CardDescription>
            Content containing these keywords will be flagged for review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Keyword Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword to block..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
            />
            <Button
              onClick={handleAddKeyword}
              className="bg-[#069494] hover:bg-[#057a7a]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Keywords List */}
          {settings.blockedKeywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 opacity-30 mb-3" />
              <p className="text-sm">No blocked keywords yet</p>
              <p className="text-xs mt-1">Add keywords to filter inappropriate content</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {settings.blockedKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="gap-1 pl-3 pr-1 py-1"
                >
                  {keyword}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-red-100 hover:text-red-600 rounded-full"
                    onClick={() => setRemovingKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {settings.blockedKeywords.length} keyword
            {settings.blockedKeywords.length !== 1 ? "s" : ""} configured
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#069494] hover:bg-[#057a7a]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Remove Keyword Confirmation */}
      <AlertDialog
        open={!!removingKeyword}
        onOpenChange={(open) => !open && setRemovingKeyword(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Keyword</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{removingKeyword}" from the blocked
              keywords list? Content containing this word will no longer be flagged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingKeyword && handleRemoveKeyword(removingKeyword)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default KeywordFilteringTab
