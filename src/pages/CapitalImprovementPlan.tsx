import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ReadinessDisclaimer from '@/components/capital/ReadinessDisclaimer';
import ActionDetailDialog from '@/components/capital/ActionDetailDialog';
import { useImprovementPlan } from '@/hooks/useImprovementPlan';
import {
  ACTION_STATUSES,
  ACTION_STATUS_LABELS,
  ActionStatus,
  PLAN_PRIORITIES,
  PLAN_PRIORITY_LABELS,
  PLAN_PRIORITY_ORDER,
  PlanAction,
  PlanPriority,
  REASSESSMENT_COMPLETION_THRESHOLD,
  categoryLabel,
  computeProgress,
  effectivePriority,
  isOverdue,
  reassessmentEligibility,
} from '@/lib/capitalReadiness/improvementPlan';
import { CATEGORIES } from '@/data/capitalReadiness/questionnaire';
import { Printer } from 'lucide-react';

const Stat = ({ label, value, tone }: { label: string; value: number | string; tone?: string }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${tone ?? 'text-foreground'}`}>{value}</p>
    </CardContent>
  </Card>
);

const CapitalImprovementPlan = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = useImprovementPlan(params.get('assessment') ?? undefined);

  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selected, setSelected] = useState<PlanAction | null>(null);

  const progress = useMemo(() => computeProgress(plan.actions), [plan.actions]);
  const eligibility = useMemo(() => reassessmentEligibility(plan.actions), [plan.actions]);

  const filtered = useMemo(
    () =>
      plan.actions
        .filter((a) => category === 'all' || a.category_key === category)
        .filter((a) => priority === 'all' || effectivePriority(a) === priority)
        .filter((a) => status === 'all' || a.status === status)
        .filter((a) => !overdueOnly || isOverdue(a))
        .sort(
          (a, b) =>
            PLAN_PRIORITY_ORDER[effectivePriority(a)] - PLAN_PRIORITY_ORDER[effectivePriority(b)] ||
            a.sort_order - b.sort_order,
        ),
    [plan.actions, category, priority, status, overdueOnly],
  );

  const criticalOpen = plan.actions.filter(
    (a) => effectivePriority(a) === 'critical' && a.status !== 'completed',
  );

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const selectedEvidence = plan.evidence.filter((e) => e.action_id === selected?.id);
  const selectedReviews = plan.reviews.filter((r) => r.action_id === selected?.id);

  const renderCard = (a: PlanAction) => {
    const p = effectivePriority(a);
    return (
      <button
        key={a.id}
        type="button"
        onClick={() => setSelected(a)}
        className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground break-words">{a.action}</span>
          <span className="flex flex-wrap gap-1.5">
            <Badge variant={p === 'critical' ? 'destructive' : 'secondary'}>
              {PLAN_PRIORITY_LABELS[p]}
            </Badge>
            <Badge variant="outline">{ACTION_STATUS_LABELS[a.status as ActionStatus]}</Badge>
            {isOverdue(a) && <Badge variant="destructive">Overdue</Badge>}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground break-words">{a.gap}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {categoryLabel(a.category_key)}
          {a.responsible_person ? ` · ${a.responsible_person}` : ''}
          {a.target_date ? ` · due ${new Date(a.target_date).toLocaleDateString()}` : ''}
        </p>
      </button>
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl overflow-x-hidden px-4 py-8 print:max-w-none">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Capital Readiness Improvement Plan
          </h1>
          {plan.assessment ? (
            <p className="text-sm text-muted-foreground">
              Source assessment {plan.assessment.questionnaire_version} ·{' '}
              {plan.assessment.submitted_at
                ? new Date(plan.assessment.submitted_at).toLocaleDateString()
                : '—'}{' '}
              · score {Number(plan.assessment.overall_score ?? 0).toFixed(1)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No submitted assessment yet.</p>
          )}
        </header>

        {plan.loading ? (
          <p className="text-sm text-muted-foreground">Loading your plan…</p>
        ) : !plan.assessment ? (
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">
                Complete a Capital Readiness assessment to generate your improvement plan.
              </p>
              <Button onClick={() => navigate('/capital/readiness')}>Go to assessment</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {plan.assessments.length > 1 && (
              <Select value={plan.assessment.id} onValueChange={plan.setAssessmentId}>
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Assessment cycle" />
                </SelectTrigger>
                <SelectContent>
                  {plan.assessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'} ·{' '}
                      {Number(a.overall_score ?? 0).toFixed(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="Total actions" value={progress.total} />
              <Stat label="Completed" value={progress.completed} />
              <Stat label="Outstanding" value={progress.outstanding} />
              <Stat
                label="Overdue"
                value={progress.overdue}
                tone={progress.overdue > 0 ? 'text-destructive' : undefined}
              />
              <Stat
                label="Critical"
                value={progress.critical}
                tone={progress.critical > 0 ? 'text-destructive' : undefined}
              />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Overall progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{progress.progressPercentage}%</span>
                  <span className="text-sm text-muted-foreground">verified complete</span>
                </div>
                <Progress value={progress.progressPercentage} />
                {progress.byCategory.map((c) => (
                  <div key={c.category_key} className="space-y-1">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="text-foreground">{c.label}</span>
                      <span className="text-muted-foreground">
                        {c.completed}/{c.total} · {c.percentage}%
                      </span>
                    </div>
                    <Progress value={c.percentage} />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Improvement-plan progress does not change your historical assessment score.
                </p>
              </CardContent>
            </Card>

            {criticalOpen.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-destructive">
                    Critical actions ({criticalOpen.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">{criticalOpen.map(renderCard)}</CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">All actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      {PLAN_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{PLAN_PRIORITY_LABELS[p as PlanPriority]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {ACTION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{ACTION_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={overdueOnly ? 'default' : 'outline'}
                    onClick={() => setOverdueOnly((v) => !v)}
                  >
                    Overdue only
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => window.print()}>
                    <Printer className="mr-1.5 h-4 w-4" /> Print / save PDF
                  </Button>
                </div>
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No actions match these filters.</p>
                ) : (
                  <div className="space-y-2">{filtered.map(renderCard)}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Readiness progress report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Source assessment: {plan.assessment.questionnaire_version}, submitted{' '}
                  {plan.assessment.submitted_at
                    ? new Date(plan.assessment.submitted_at).toLocaleDateString()
                    : '—'}, score {Number(plan.assessment.overall_score ?? 0).toFixed(1)}/100.
                </p>
                <p>
                  {progress.completed} of {progress.total} actions verified complete ·{' '}
                  {progress.overdue} overdue · {progress.critical} critical outstanding ·{' '}
                  {progress.awaitingReview} awaiting WATHACI verification.
                </p>
                <p className="text-xs text-muted-foreground">
                  This progress report reflects improvement-plan activity only. It does not change
                  the historical Capital Readiness score or band recorded for this assessment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Request a reassessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Threshold: every Critical action verified complete, plus at least{' '}
                  {Math.round(REASSESSMENT_COMPLETION_THRESHOLD * 100)}% of all actions verified
                  complete ({eligibility.completed}/{eligibility.requiredCompleted}).
                </p>
                <p className="text-muted-foreground">{eligibility.reason}</p>
                <Button
                  disabled={!eligibility.eligible || plan.busy}
                  onClick={async () => {
                    const id = await plan.requestReassessment();
                    if (!id) {
                      toast({ title: 'Could not start reassessment', variant: 'destructive' });
                      return;
                    }
                    toast({
                      title: 'New assessment cycle started',
                      description: 'Your previous assessment and results are unchanged.',
                    });
                    navigate('/capital/readiness');
                  }}
                >
                  Request reassessment
                </Button>
              </CardContent>
            </Card>

            <ReadinessDisclaimer compact />
          </div>
        )}
      </div>

      <ActionDetailDialog
        action={selected}
        evidence={selectedEvidence}
        reviews={selectedReviews}
        open={!!selected}
        busy={plan.busy}
        onOpenChange={(o) => !o && setSelected(null)}
        onSave={(patch) => plan.updateAction(selected!.id, patch)}
        onChangeStatus={async (next) => {
          const err = await plan.changeStatus(selected!, next);
          if (!err) setSelected(null);
          return err;
        }}
        onUpload={(f) => plan.uploadEvidence(selected!, f)}
        onDeleteEvidence={(row) => plan.deleteEvidence(row)}
      />
    </AppLayout>
  );
};

export default CapitalImprovementPlan;
