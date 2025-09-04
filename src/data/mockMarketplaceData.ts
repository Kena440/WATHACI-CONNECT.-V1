/**
 * Mock marketplace data to use as fallback when Supabase functions are unavailable
 */

export interface MockService {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerType: 'freelancer' | 'partnership' | 'resource';
  category: string;
  skills: string[];
  location: string;
  deliveryTime: string;
  rating: number;
  reviews: number;
  currency: string;
  price: number;
  image: string;
}

export const mockServices: MockService[] = [
  {
    id: '1',
    title: 'Corporate Governance Advisory',
    description: 'Professional board administration and corporate governance solutions for SMEs',
    provider: 'Governance Partners Zambia',
    providerType: 'partnership',
    category: 'business',
    skills: ['Corporate Governance', 'Board Administration', 'Compliance'],
    location: 'Lusaka, Zambia',
    deliveryTime: '2-3 weeks',
    rating: 4.8,
    reviews: 24,
    currency: 'ZMW',
    price: 2500,
    image: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Risk Assessment & Management',
    description: 'Comprehensive risk assessment and regulatory compliance support',
    provider: 'Risk Solutions Ltd',
    providerType: 'partnership',
    category: 'consulting',
    skills: ['Risk Management', 'Compliance', 'Assessment'],
    location: 'Lusaka, Zambia',
    deliveryTime: '1-2 weeks',
    rating: 4.7,
    reviews: 18,
    currency: 'ZMW',
    price: 1800,
    image: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'Legal Advisory Services',
    description: 'Expert legal guidance tailored for Zambian business environment',
    provider: 'Mubanga Chiwawa',
    providerType: 'freelancer',
    category: 'legal',
    skills: ['Business Law', 'Contract Law', 'Legal Advisory'],
    location: 'Lusaka, Zambia',
    deliveryTime: '3-5 days',
    rating: 4.9,
    reviews: 42,
    currency: 'ZMW',
    price: 800,
    image: '/placeholder.svg'
  },
  {
    id: '4',
    title: 'Financial Planning & Analysis',
    description: 'Professional financial planning and analysis services for SMEs',
    provider: 'Charles Mwanza',
    providerType: 'freelancer',
    category: 'finance',
    skills: ['Financial Planning', 'Analysis', 'Budgeting'],
    location: 'Kitwe, Zambia',
    deliveryTime: '1 week',
    rating: 4.6,
    reviews: 31,
    currency: 'ZMW',
    price: 1200,
    image: '/placeholder.svg'
  },
  {
    id: '5',
    title: 'Business Development Training',
    description: 'Skills development and professional training programs for business growth',
    provider: 'Business Skills Academy',
    providerType: 'resource',
    category: 'education',
    skills: ['Training', 'Business Development', 'Capacity Building'],
    location: 'Ndola, Zambia',
    deliveryTime: '2-4 weeks',
    rating: 4.5,
    reviews: 56,
    currency: 'ZMW',
    price: 1500,
    image: '/placeholder.svg'
  },
  {
    id: '6',
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive digital marketing and brand strategy for Zambian businesses',
    provider: 'Digital Growth Hub',
    providerType: 'partnership',
    category: 'marketing',
    skills: ['Digital Marketing', 'Strategy', 'Brand Development'],
    location: 'Lusaka, Zambia',
    deliveryTime: '2-3 weeks',
    rating: 4.4,
    reviews: 28,
    currency: 'ZMW',
    price: 2200,
    image: '/placeholder.svg'
  },
  {
    id: '7',
    title: 'Project Management Consulting',
    description: 'Professional project oversight and management services',
    provider: 'Patricia Banda',
    providerType: 'freelancer',
    category: 'consulting',
    skills: ['Project Management', 'Planning', 'Oversight'],
    location: 'Livingstone, Zambia',
    deliveryTime: '1-8 weeks',
    rating: 4.7,
    reviews: 19,
    currency: 'ZMW',
    price: 1600,
    image: '/placeholder.svg'
  },
  {
    id: '8',
    title: 'Technology Solutions for SMEs',
    description: 'Custom technology solutions and IT consulting for small businesses',
    provider: 'TechCorp Zambia',
    providerType: 'partnership',
    category: 'technology',
    skills: ['IT Consulting', 'Software Solutions', 'Technology'],
    location: 'Lusaka, Zambia',
    deliveryTime: '3-6 weeks',
    rating: 4.6,
    reviews: 33,
    currency: 'ZMW',
    price: 3500,
    image: '/placeholder.svg'
  }
];

export const mockStats = {
  totalServices: mockServices.length,
  freelancers: mockServices.filter(s => s.providerType === 'freelancer').length,
  partners: mockServices.filter(s => s.providerType === 'partnership').length,
  resources: mockServices.filter(s => s.providerType === 'resource').length
};

export const mockImpactStats = [
  { id: 1, metric: "3.2M", label: "Total Funding Raised", description: "Capital mobilized for SME growth", is_active: true },
  { id: 2, metric: "1,247", label: "Projects Completed", description: "Successful business initiatives", is_active: true },
  { id: 3, metric: "2,834", label: "Jobs Created", description: "Employment opportunities generated", is_active: true },
  { id: 4, metric: "892", label: "SMEs Supported", description: "Small businesses empowered", is_active: true },
  { id: 5, metric: "156", label: "Active Investors", description: "Funding partners engaged", is_active: true },
  { id: 6, metric: "423", label: "Donors & Supporters", description: "Community champions", is_active: true },
  { id: 7, metric: "127", label: "Success Stories", description: "Businesses thriving", is_active: true },
  { id: 8, metric: "8", label: "Countries Served", description: "Regional impact reach", is_active: true }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Sarah Mulenga",
    role: "CEO, Mulenga Enterprises",
    company: "Mulenga Enterprises",
    content: "WATHACI Connect transformed our business operations. The governance advisory helped us structure our board properly and improve our compliance.",
    rating: 5,
    image: "/placeholder.svg",
    status: "active",
    featured: true
  },
  {
    id: 2,
    name: "James Phiri",
    role: "Founder, Tech Innovations",
    company: "Tech Innovations",
    content: "The marketplace connected us with excellent legal advisors who helped us navigate complex business regulations efficiently.",
    rating: 5,
    image: "/placeholder.svg",
    status: "active",
    featured: true
  },
  {
    id: 3,
    name: "Grace Banda",
    role: "Director, Banda & Associates",
    company: "Banda & Associates",
    content: "Exceptional financial planning services that helped us scale our business and improve our cash flow management significantly.",
    rating: 5,
    image: "/placeholder.svg",
    status: "active",
    featured: true
  }
];