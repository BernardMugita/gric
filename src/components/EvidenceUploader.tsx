import { useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { uploadEvidence } from '@/api/evidence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EvidenceAttachment } from '@/types/evidence'

interface EvidenceUploaderProps {
  value: EvidenceAttachment[]
  onChange: (evidence: EvidenceAttachment[]) => void
  required?: boolean
}

/** FR-DC-5: one or more attachments per DataPoint; mandatory when the indicator is flagged evidenceRequired. */
export function EvidenceUploader({ value, onChange, required }: EvidenceUploaderProps) {
  const mutation = useMutation({
    mutationFn: uploadEvidence,
    onSuccess: ({ data }) => onChange([...value, data]),
  })

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    Array.from(fileList).forEach((file) => mutation.mutate(file))
  }

  function removeAt(id: string) {
    onChange(value.filter((evidence) => evidence.id !== id))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="evidence-upload">
        Evidence {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id="evidence-upload" type="file" multiple onChange={(event) => handleFiles(event.target.files)} />
      {mutation.isPending && <p className="text-xs text-muted-foreground">Uploading…</p>}
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((evidence) => (
            <li key={evidence.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
              <span className="truncate">{evidence.fileName}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeAt(evidence.id)}>
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {required && value.length === 0 && (
        <p className="text-xs text-muted-foreground">Evidence is required before this can be submitted.</p>
      )}
    </div>
  )
}
