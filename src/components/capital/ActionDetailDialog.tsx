import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Paperclip, Trash2 } from 'lucide-react';
import {
  ACTION_STATUS_LABELS,
  ActionStatus,
  PLAN_PRIORITY_LABELS,
  PlanAction,
  categoryLabel,
  effectivePriority,
  isOverdue,
} from '@/lib/capitalReadiness/improvementPlan';
import {
  EvidenceRow,
  ReviewRow,
  signedEvidenceUrl,
} from '@/hooks/useImprovementPlan';

interface Props {
  action: PlanAction | null;
  evidence: EvidenceRow[];
  reviews: ReviewRow[];
  open: boolean;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<PlanAction>) => Promise<unknown>;
  onChangeStatus: (next: ActionStatus) => Promise<unknown>;
  onUpload: (file: File) => Promise<unknown>;
  onDeleteEvidence: (row: EvidenceRow) => Promise<unknown>;
}

export const ActionDetailDialog = ({
  action,
  evidence,
  reviews,
  open,
  busy,
  onOpenChange,
  onSave,
  onChangeStatus,
  onUpload,
  onDeleteEvidence,
}: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [responsible, setResponsible] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setResponsible(action?.responsible_person ?? '');
    setTargetDate(action?.target_date ?? '');
    setNotes(action?.notes ?? '');
  }, [action]);

  if (!action) return null;

  const priority = effectivePriority(action);
  const status = action.status as ActionStatus;
  const locked = ['submitted', 'under_review', 'completed'].includes(status);

  const save = async () => {
    const err = await onSave({
      responsible_person: responsible.trim() || null,
      target_date: targetDate || null,
      notes: notes.trim() || null,
    });
    toast(
      err
        ? { title: 'Could not save', description: String(err), variant: 'destructive' }
        : { title: 'Action updated' },
    );
  };

  const openEvidence = async (row: EvidenceRow) => {
    const url = await signedEvidenceUrl(row.storage_path);
    if (url) window.open(url, '_blank', 'noopener');
    else toast({ title: 'Could not open file', variant: 'destructive' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base break-words">{action.action}</DialogTitle>
          <DialogDescription className="break-words">{action.gap}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{categoryLabel(action.category_key)}</Badge>
          <Badge variant={priority === 'critical' ? 'destructive' : 'secondary'}>
            {PLAN_PRIORITY_LABELS[priority]}
          </Badge>
          <Badge variant="outline">{ACTION_STATUS_LABELS[status]}</Badge>
          {isOverdue(action) && <Badge variant="destructive">Overdue</Badge>}
        </div>

        {action.review_comment && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <span className="font-medium">WATHACI review note: </span>
            {action.review_comment}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="responsible">Responsible person</Label>
            <Input
              id="responsible"
              value={responsible}
              placeholder="Name or role in your business"
              onChange={(e) => setResponsible(e.target.value)}
              disabled={locked}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target">Target date</Label>
            <Input
              id="target"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={locked}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Required evidence</Label>
          <p className="text-sm text-muted-foreground">
            {action.required_evidence ??
              'Attach a document, policy, statement or record that demonstrates this action is done.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={locked}
            placeholder="Progress notes, blockers, context for the reviewer"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Evidence</Label>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const err = await onUpload(f);
                if (err) toast({ title: 'Upload failed', variant: 'destructive' });
                else toast({ title: 'Evidence attached' });
                if (fileRef.current) fileRef.current.value = '';
              }}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={locked || busy}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="mr-1.5 h-4 w-4" /> Attach file
            </Button>
          </div>
          {evidence.length === 0 && (
            <p className="text-sm text-muted-foreground">No evidence attached yet.</p>
          )}
          {evidence.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2"
            >
              <span className="text-sm break-all">{e.file_name}</span>
              <span className="flex items-center gap-2">
                <Badge variant={e.verification_status === 'rejected' ? 'destructive' : 'secondary'}>
                  {e.verification_status}
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => openEvidence(e)}>
                  <Download className="h-4 w-4" />
                </Button>
                {!locked && e.verification_status === 'pending' && (
                  <Button size="icon" variant="ghost" onClick={() => onDeleteEvidence(e)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>

        {reviews.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label>Activity</Label>
              {reviews.map((r) => (
                <p key={r.id} className="text-xs text-muted-foreground break-words">
                  {new Date(r.created_at).toLocaleString()} ·{' '}
                  {r.actor_role === 'admin' ? 'WATHACI' : 'You'} ·{' '}
                  {r.from_status ? `${ACTION_STATUS_LABELS[r.from_status as ActionStatus]} → ` : ''}
                  {r.to_status ? ACTION_STATUS_LABELS[r.to_status as ActionStatus] : ''}
                  {r.comment ? ` — ${r.comment}` : ''}
                </p>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Completion is verified by WATHACI. You can submit evidence for review; only a WATHACI
          reviewer can mark an action Completed.
        </p>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {!locked && (
            <Button variant="outline" onClick={save} disabled={busy}>
              Save changes
            </Button>
          )}
          {['not_started', 'rejected'].includes(status) && (
            <Button variant="secondary" onClick={() => onChangeStatus('in_progress')} disabled={busy}>
              Mark In Progress
            </Button>
          )}
          {['in_progress', 'rejected'].includes(status) && (
            <Button
              onClick={async () => {
                await save();
                const err = await onChangeStatus('submitted');
                if (err) toast({ title: 'Could not submit', variant: 'destructive' });
                else toast({ title: 'Submitted for WATHACI review' });
              }}
              disabled={busy || evidence.length === 0}
            >
              {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Submit for review
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDetailDialog;
