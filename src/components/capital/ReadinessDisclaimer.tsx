import { Info } from 'lucide-react';

/**
 * Mandatory framing for the Capital Readiness Self-Assessment.
 * Must remain visible on the introduction and results views.
 */
export const ReadinessDisclaimer = ({ compact = false }: { compact?: boolean }) => (
  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
    <div className="flex items-start gap-2">
      <Info className="h-4 w-4 mt-0.5 shrink-0 text-foreground" aria-hidden />
      <div className="space-y-2 min-w-0">
        <p className="font-medium text-foreground">
          This is a readiness self-assessment. It measures how prepared your business is to engage
          capital providers.
        </p>
        {!compact && (
          <ul className="list-disc pl-4 space-y-1">
            <li>It is not a credit score.</li>
            <li>It is not an investment rating.</li>
            <li>It is not investment advice or a recommendation.</li>
            <li>It does not predict whether your business will receive funding.</li>
            <li>It is not a funding application.</li>
            <li>Your responses are private by default and are visible only to you.</li>
          </ul>
        )}
        {compact && (
          <p>
            Not a credit score, not an investment rating, not investment advice, and not a funding
            application. It does not predict funding. Your responses are private by default.
          </p>
        )}
      </div>
    </div>
  </div>
);

export default ReadinessDisclaimer;
