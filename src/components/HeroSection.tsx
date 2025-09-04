import { Button } from '@/components/ui/button';
import { ArrowRight, Users, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="mb-8">
            <Logo className="h-32 w-auto mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Empowering Zambian
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-green-600"> Business Excellence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with professional services, find skilled freelancers, and access resources 
            designed specifically for Zambian businesses. Your gateway to growth and success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-started">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 text-lg">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-3 text-lg">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Network</h3>
            <p className="text-gray-600">
              Connect with verified professionals and service providers across Zambia
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Growth</h3>
            <p className="text-gray-600">
              Access tools and resources designed to accelerate your business growth
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
            <p className="text-gray-600">
              All services and professionals are vetted for quality and reliability
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
export default HeroSection;