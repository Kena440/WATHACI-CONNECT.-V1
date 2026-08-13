import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ReadinessDisclaimer from '@/components/capital/ReadinessDisclaimer';
import ReadinessResults from '@/components/capital/ReadinessResults';
import {
  CATEGORIES,
  CategoryKey,
  QUESTIONS,
  QUESTIONS_BY_CATEGORY,
  QUESTIONNAIRE_VERSION,
} from '@/data/capitalReadiness/questionnaire';
import { answeredCount, isComplete, missingRequiredKeys, BAND_LABELS, ReadinessBand } from '@/lib/capitalReadiness/scoring';
import {
  AssessmentDetail,
  fetchAssessmentDetail,
  useCapitalReadiness,
} from '@/hooks/useCapitalReadiness';

type View = 'intro' | 'questions' | 'results';

const CapitalReadiness = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    draft,
    answers,
    history,
    loading,
    saving,
    submitting,
    setAnswer,
    submit,
    startNewAttempt,
  } = useCapitalReadiness();

  const [view, setView] = useState<View>('intro');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('governance');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);

  const answered = answeredCount(answers);
  const total = QUESTIONS.length;
  const complete = isComplete(answers);
  const missing = useMemo(() => new Set(missingRequiredKeys(answers)), [answers]);

  useEffect(() => {
    if (!loading && answered > 0 && view === 'intro') setView('questions');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const openDetail = async (id: string) => {
    const d = await fetchAssessmentDetail(id);
    if (d) {
      setDetail(d);
      setView('results');
      window.scrollTo({ top: 0 });
    }
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    const id = await submit();
    if (!id) {
      toast({ title: 'Could not submit', description: 'Please try again.', variant: 'destructive' });
      return;
    }
    await openDetail(id);
    toast({ title: 'Assessment submitted', description: 'Your results are saved to your history.' });
  };

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

  const categoryQuestions = QUESTIONS_BY_CATEGORY[activeCategory];
  const activeIndex = CATEGORIES.findIndex((c) => c.key === activeCategory);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl overflow-x-hidden">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">
            Capital Readiness Self-Assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            Version {QUESTIONNAIRE_VERSION} · 35 questions across 7 categories
          </p>
        </header>

        {view === 'intro' && (
          <div className="space-y-6">
            <ReadinessDisclaimer />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">What this covers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {CATEGORIES.map((c) => (
                    <li key={c.key} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-foreground">{c.label}</span>
                      <span className="text-muted-foreground">
                        {QUESTIONS_BY_CATEGORY[c.key].length} questions · {(c.weight * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">
                  You can save and come back at any time. Answers are saved as you go.
                </p>
                <Button onClick={() => setView('questions')} className="w-full sm:w-auto" disabled={loading || !draft}>
                  {answered > 0 ? 'Resume assessment' : 'Start assessment'}
                </Button>
              </CardContent>
            </Card>

            {history.length > 0 && (
              <>
                <HistoryList history={history} onOpen={openDetail} />
                <Button variant="outline" onClick={() => navigate('/capital/improvement-plan')}>
                  Open my improvement plan
                </Button>
              </>
            )}
          </div>
        )}

        {view === 'questions' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {answered} of {total} answered
                </span>
                <span className="text-xs text-muted-foreground">
                  {saving ? 'Saving…' : 'Progress saved'}
                </span>
              </div>
              <Progress value={(answered / total) * 100} />
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" aria-label="Categories">
              {CATEGORIES.map((c) => {
                const qs = QUESTIONS_BY_CATEGORY[c.key];
                const done = qs.filter((q) => answers[q.key]).length;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setActiveCategory(c.key)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      activeCategory === c.key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c.label} ({done}/{qs.length})
                  </button>
                );
              })}
            </nav>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base break-words">
                  {CATEGORIES[activeIndex].label}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{CATEGORIES[activeIndex].description}</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {categoryQuestions.map((q, i) => {
                  const invalid = showValidation && missing.has(q.key);
                  return (
                    <fieldset key={q.key} className="space-y-3">
                      <legend className="text-sm font-medium text-foreground break-words">
                        {i + 1}. {q.text}{' '}
                        {q.required && <span className="text-destructive">*</span>}
                      </legend>
                      {invalid && (
                        <p className="text-xs text-destructive">This question is required.</p>
                      )}
                      <RadioGroup
                        value={answers[q.key] ?? ''}
                        onValueChange={(v) => setAnswer(q.key, v)}
                        className="space-y-2"
                      >
                        {q.options.map((o) => (
                          <div key={o.value} className="flex items-start gap-2">
                            <RadioGroupItem
                              value={o.value}
                              id={`${q.key}-${o.value}`}
                              className="mt-1 shrink-0"
                            />
                            <Label
                              htmlFor={`${q.key}-${o.value}`}
                              className="text-sm font-normal leading-snug break-words cursor-pointer"
                            >
                              {o.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </fieldset>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveCategory(CATEGORIES[activeIndex - 1].key)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={activeIndex === CATEGORIES.length - 1}
                  onClick={() => setActiveCategory(CATEGORIES[activeIndex + 1].key)}
                >
                  Next
                </Button>
              </div>
              <Button
                onClick={() => {
                  if (!complete) {
                    setShowValidation(true);
                    toast({
                      title: 'Assessment incomplete',
                      description: `${total - answered} question(s) still need an answer before you can submit.`,
                      variant: 'destructive',
                    });
                    return;
                  }
                  setConfirmOpen(true);
                }}
                disabled={submitting}
              >
                Submit assessment
              </Button>
            </div>

            <ReadinessDisclaimer compact />
          </div>
        )}

        {view === 'results' && detail && (
          <div className="space-y-6">
            <ReadinessResults detail={detail} />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => navigate(`/capital/improvement-plan?assessment=${detail.assessment.id}`)}>
                Open improvement plan
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await startNewAttempt();
                  setDetail(null);
                  setShowValidation(false);
                  setActiveCategory('governance');
                  setView('questions');
                }}
              >
                Start a new assessment
              </Button>
              <Button variant="ghost" onClick={() => setView('intro')}>
                Back to overview
              </Button>
            </div>
            {history.length > 0 && <HistoryList history={history} onOpen={openDetail} />}
          </div>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, this attempt becomes a permanent record and cannot be edited. You can
              always start a new assessment later. Your responses stay private to you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

const HistoryList = ({
  history,
  onOpen,
}: {
  history: Array<{ id: string; overall_score: number | null; readiness_band: string | null; submitted_at: string | null }>;
  onOpen: (id: string) => void;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">Your assessment history</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {history.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => onOpen(h.id)}
          className="w-full rounded-lg border border-border p-3 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-foreground">
              {h.submitted_at ? new Date(h.submitted_at).toLocaleDateString() : '—'}
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="secondary">
                {BAND_LABELS[(h.readiness_band ?? 'early_stage') as ReadinessBand]}
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {Number(h.overall_score ?? 0).toFixed(1)}
              </span>
            </span>
          </div>
        </button>
      ))}
    </CardContent>
  </Card>
);

export default CapitalReadiness;
