import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ReadinessDisclaimer from '@/components/capital/ReadinessDisclaimer';
import { CATEGORIES, CategoryKey } from '@/data/capitalReadiness/questionnaire';
import { BAND_DESCRIPTIONS, BAND_LABELS, ReadinessBand } from '@/lib/capitalReadiness/scoring';
import type { AssessmentDetail } from '@/hooks/useCapitalReadiness';

const labelFor = (key: string) =>
  CATEGORIES.find((c) => c.key === (key as CategoryKey))?.label ?? key;

export const ReadinessResults = ({ detail }: { detail: AssessmentDetail }) => {
  const score = Number(detail.assessment.overall_score ?? 0);
  const band = (detail.assessment.readiness_band ?? 'early_stage') as ReadinessBand;
  const sorted = [...detail.categories].sort(
    (a, b) => Number(b.category_percentage) - Number(a.category_percentage),
  );
  const strongest = sorted.slice(0, 3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your readiness score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">{score.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 100</span>
            <Badge variant="secondary">{BAND_LABELS[band]}</Badge>
          </div>
          <Progress value={Math.min(100, Math.max(0, score))} />
          <p className="text-sm text-muted-foreground">{BAND_DESCRIPTIONS[band]}</p>
          <p className="text-xs text-muted-foreground">
            This score reflects preparedness to engage capital providers. It does not indicate
            funding likelihood.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Category scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detail.categories
            .slice()
            .sort(
              (a, b) =>
                CATEGORIES.findIndex((c) => c.key === a.category_key) -
                CATEGORIES.findIndex((c) => c.key === b.category_key),
            )
            .map((c) => (
              <div key={c.category_key} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">{labelFor(c.category_key)}</span>
                  <span className="text-muted-foreground">
                    {Number(c.category_percentage).toFixed(1)}% · weight{' '}
                    {(Number(c.category_weight) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={Number(c.category_percentage)} />
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Strongest areas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {strongest.map((c) => (
            <Badge key={c.category_key} variant="outline">
              {labelFor(c.category_key)} · {Number(c.category_percentage).toFixed(0)}%
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Gaps and recommended actions ({detail.actions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {detail.actions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No gaps were flagged from your responses.
            </p>
          )}
          {detail.actions.map((a) => (
            <div key={a.question_key} className="rounded-lg border border-border p-3 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={a.priority === 'high' ? 'destructive' : 'secondary'}>
                  {a.priority === 'high' ? 'High priority' : 'Medium priority'}
                </Badge>
                <span className="text-xs text-muted-foreground">{labelFor(a.category_key)}</span>
              </div>
              <p className="text-sm font-medium text-foreground break-words">{a.gap}</p>
              <p className="text-sm text-muted-foreground break-words">{a.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <ReadinessDisclaimer compact />
    </div>
  );
};

export default ReadinessResults;
