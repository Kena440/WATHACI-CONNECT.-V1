import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPlansForUserType, getUserTypeLabel } from '@/data/subscriptionPlans';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { Users, Building, TrendingUp, Heart, Landmark, User } from 'lucide-react';

interface UserTypeSubscriptionsProps {
  userType: string;
  showTitle?: boolean;
}

const getUserTypeIcon = (userType: string) => {
  const icons = {
    sole_proprietor: User,
    professional: Users,
    sme: Building,
    investor: TrendingUp,
    donor: Heart,
    government: Landmark
  };
  const Icon = icons[userType as keyof typeof icons] || User;
  return <Icon className="h-5 w-5" />;
};

const getUserTypeDescription = (userType: string): string => {
  const descriptions = {
    sole_proprietor: 'Perfect for individual entrepreneurs and freelancers starting their journey',
    professional: 'Ideal for consultants, freelancers, and service providers',
    sme: 'Designed for small and medium enterprises looking to scale',
    investor: 'Comprehensive tools for investment professionals and firms',
    donor: 'Specialized features for NGOs, foundations, and grant makers',
    government: 'Enterprise solutions for government institutions and agencies'
  };
  return descriptions[userType as keyof typeof descriptions] || 'Choose the right plan for your needs';
};

export const UserTypeSubscriptions = ({ userType, showTitle = true }: UserTypeSubscriptionsProps) => {
  const plans = getPlansForUserType(userType);
  
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No subscription plans available for this user type.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              {getUserTypeIcon(userType)}
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{getUserTypeLabel(userType)} Plans</span>
                  <Badge variant="secondary">Recommended</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {getUserTypeDescription(userType)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <SubscriptionCard 
            key={plan.id} 
            plan={plan} 
            userType={userType}
          />
        ))}
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Need a custom solution?</p>
              <p className="text-sm text-gray-600">
                Contact our team for enterprise pricing and custom features
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Secure payments by</p>
              <Badge variant="outline" className="mt-1">Lenco</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};