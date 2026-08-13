import { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  ACTION_STATUS_LABELS,
  ActionStatus,
  PLAN_PRIORITY_LABELS,
  PlanAction,
  categoryLabel,
  effectivePriority,
  isOverdue,
} from '@/lib/capitalReadiness/improvementPlan';
import { EvidenceRow, signedEvidenceUrl } from '@/hooks/useImprovementPlan';
import { Download } from 'lucide-react';

/** WATHACI admin review queue for submitted improvement-plan actions. */
const CapitalImprovementPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [actions, setActions] = useState<PlanAction[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('capital_readiness_actions')
      .select('*')
      .in('status', ['submitted', 'under_review', 'rejected'])
      .order('submitted_at', { ascending: true });
    const rows = (data ?? []) as unknown as PlanAction[];
    setActions(rows);
    if (rows.length > 0) {
      const { data: ev } = await supabase
        .from('capital_readiness_action_evidence')
        .select('*')
        .in('action_id', rows.map((r) => r.id));
      setEvidence((ev ?? []) as EvidenceRow[]);
    } else {
      setEvidence([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (action: PlanAction, next: ActionStatus) => {
    const comment = comments[action.id]?.trim() || null;
    if (next === 'rejected' && !comment) {
      toast({ title: 'A reason is required to reject', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('capital_readiness_actions')
      .update({ status: next, review_comment: comment })
      .eq('id', action.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    await supabase.from('capital_readiness_action_reviews').insert({
      action_id: action.id,
      actor_id: user?.id ?? null,
      actor_role: 'admin',
      from_status: action.status,
      to_status: next,
      comment,
    });
    const ids = evidence.filter((e) => e.action_id === action.id).map((e) => e.id);
    if (ids.length > 0) {
      await supabase
        .from('capital_readiness_action_evidence')
        .update({
          verification_status: next === 'completed' ? 'accepted' : next === 'rejected' ? 'rejected' : 'pending',
          reviewer_comment: comment,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .in('id', ids);
    }
    toast({ title: `Action set to ${ACTION_STATUS_LABELS[next]}` });
    await load();
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Improvement plan reviews</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Verify submitted evidence. Marking an action Completed does not change any historical
          Capital Readiness score.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing awaiting review.</p>
        ) : (
          <div className="space-y-4">
            {actions.map((a) => {
              const ev = evidence.filter((e) => e.action_id === a.id);
              return (
                <Card key={a.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base break-words">{a.action}</CardTitle>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="outline">{categoryLabel(a.category_key)}</Badge>
                      <Badge
                        variant={effectivePriority(a) === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {PLAN_PRIORITY_LABELS[effectivePriority(a)]}
                      </Badge>
                      <Badge variant="outline">
                        {ACTION_STATUS_LABELS[a.status as ActionStatus]}
                      </Badge>
                      {isOverdue(a) && <Badge variant="destructive">Overdue</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground break-words">{a.gap}</p>
                    <p className="text-xs text-muted-foreground">
                      Responsible: {a.responsible_person ?? '—'} · Target:{' '}
                      {a.target_date ? new Date(a.target_date).toLocaleDateString() : '—'}
                    </p>
                    {a.notes && <p className="text-sm break-words">SME notes: {a.notes}</p>}
                    {ev.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No evidence attached.</p>
                    ) : (
                      ev.map((e) => (
                        <div
                          key={e.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2"
                        >
                          <span className="text-sm break-all">{e.file_name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              const url = await signedEvidenceUrl(e.storage_path);
                              if (url) window.open(url, '_blank', 'noopener');
                            }}
                          >
                            <Download className="mr-1.5 h-4 w-4" /> Open
                          </Button>
                        </div>
                      ))
                    )}
                    <Textarea
                      rows={2}
                      placeholder="Review comment (required to reject)"
                      value={comments[a.id] ?? ''}
                      onChange={(e) => setComments((p) => ({ ...p, [a.id]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => review(a, 'under_review')}>
                        Mark Under Review
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => review(a, 'rejected')}>
                        Reject / Needs Revision
                      </Button>
                      <Button size="sm" onClick={() => review(a, 'completed')}>
                        Verify &amp; Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CapitalImprovementPlans;
