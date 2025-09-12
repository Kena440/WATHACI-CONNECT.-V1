export interface FundingOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  amount: number; // in USD for simplicity
  deadline: string; // ISO date string
  sectors: string[];
  countries: string[];
  type: string;
  requirements: string[];
}

export interface Professional {
  id: string;
  name: string;
  expertise: string[];
  experience: string;
  successRate: number; // 0-1
  rating: number; // 0-5
  hourlyRate: string;
  availability: string;
}

export const fundingOpportunities: FundingOpportunity[] = [
  {
    id: 'pepfar-2024',
    title: 'PEPFAR Small Grants Program',
    organization: 'U.S. Embassy Lusaka',
    description: 'Community-based HIV/AIDS projects for Zambian organizations.',
    amount: 50000,
    deadline: '2024-04-30',
    sectors: ['healthcare', 'community'],
    countries: ['zambia'],
    type: 'Grant',
    requirements: ['Zambian registration', 'HIV/AIDS focus']
  },
  {
    id: 'tef-2024',
    title: 'Tony Elumelu Foundation Entrepreneurship Programme',
    organization: 'Tony Elumelu Foundation',
    description: 'Seed capital and training for African startups in any sector.',
    amount: 5000,
    deadline: '2024-03-31',
    sectors: ['agriculture', 'technology', 'services', 'manufacturing'],
    countries: ['zambia', 'nigeria', 'kenya', 'ghana'],
    type: 'Seed Funding',
    requirements: ['African-owned business', '0-3 years old']
  },
  {
    id: 'usadf-2024',
    title: 'USADF Grants for African-owned SMEs',
    organization: 'U.S. African Development Foundation',
    description: 'Up to $250k for growth-oriented, impact-focused businesses.',
    amount: 250000,
    deadline: '2024-08-31',
    sectors: ['agriculture', 'renewable', 'technology'],
    countries: ['zambia', 'kenya', 'uganda', 'ghana'],
    type: 'Grant',
    requirements: ['African ownership', 'Impact metrics']
  },
  {
    id: 'ceec-2024',
    title: 'CEEC Matching Grants',
    organization: 'Citizens Economic Empowerment Commission',
    description: 'Zambian government financing for priority sectors.',
    amount: 100000,
    deadline: '2024-06-30',
    sectors: ['agriculture', 'manufacturing', 'tourism'],
    countries: ['zambia'],
    type: 'Matching Grant',
    requirements: ['Zambian SMEs', 'Co-financing required']
  },
  {
    id: 'afawa-2024',
    title: 'AFAWA Guarantee for Growth',
    organization: 'African Development Bank',
    description: 'Risk-sharing facility to boost lending to women-owned SMEs.',
    amount: 500000,
    deadline: '2024-12-31',
    sectors: ['all'],
    countries: ['zambia', 'kenya', 'tanzania'],
    type: 'Guarantee',
    requirements: ['Women-owned business', 'Through partner bank']
  }
];

export const professionals: Professional[] = [
  {
    id: 'bongohive',
    name: 'BongoHive Consult',
    expertise: ['technology', 'grant writing', 'social enterprise'],
    experience: '10 years',
    successRate: 0.8,
    rating: 4.8,
    hourlyRate: 'ZMW 500',
    availability: 'Available'
  },
  {
    id: 'impact-capital-africa',
    name: 'Impact Capital Africa',
    expertise: ['agriculture', 'investor readiness', 'fundraising'],
    experience: '8 years',
    successRate: 0.75,
    rating: 4.7,
    hourlyRate: 'ZMW 600',
    availability: 'Available'
  },
  {
    id: 'grant-thornton-zambia',
    name: 'Grant Thornton Zambia',
    expertise: ['finance', 'audit', 'grant management'],
    experience: '15 years',
    successRate: 0.7,
    rating: 4.6,
    hourlyRate: 'ZMW 800',
    availability: 'Limited'
  },
  {
    id: 'ngoma-consulting',
    name: 'Ngoma Consulting Services',
    expertise: ['community', 'healthcare', 'education'],
    experience: '12 years',
    successRate: 0.65,
    rating: 4.5,
    hourlyRate: 'ZMW 450',
    availability: 'Available'
  }
];

