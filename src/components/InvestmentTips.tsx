import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyInvestmentTips, type FundingOpportunity } from '@/lib/services/investment-tips-service';

interface Props {
  opportunities: FundingOpportunity[];
}

export const InvestmentTips: React.FC<Props> = ({ opportunities }) => {
  const [smeTip, setSmeTip] = useState<string>('');
  const [investorTip, setInvestorTip] = useState<string>('');

  useEffect(() => {
    getDailyInvestmentTips(opportunities).then((tips) => {
      setSmeTip(tips.sme);
      setInvestorTip(tips.investor);
    });
  }, [opportunities]);

  if (!smeTip && !investorTip) {
    return <div className="mb-6">Generating personalized investment tips...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>SME Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{smeTip}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Investor Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{investorTip}</p>
        </CardContent>
      </Card>
    </div>
  );
};
