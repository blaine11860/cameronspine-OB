import { Heart, Clock, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const features = [
    {
      icon: Heart,
      title: "Pregnancy Tracking",
      description: "Monitor your pregnancy journey week by week with personalized milestones and baby development insights."
    },
    {
      icon: Clock,
      title: "Timeline Management",
      description: "Keep track of important appointments, tests, and milestones throughout your pregnancy."
    },
    {
      icon: BarChart3,
      title: "Health Monitoring",
      description: "Log symptoms, mood, and weight changes to maintain a comprehensive health record."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your pregnancy data is encrypted and secure, accessible only to you and your healthcare providers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center">
                <Heart className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">MaternalCare</h1>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-rose-soft to-rose-deep text-white hover:shadow-lg transition-all duration-200"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Your Pregnancy Journey,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft to-rose-deep">
              Beautifully Tracked
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the joy of pregnancy with our comprehensive tracking app. 
            Monitor your health, track milestones, and celebrate each moment of your journey to motherhood.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-gradient-to-r from-rose-soft to-rose-deep text-white hover:shadow-lg transition-all duration-200 px-8 py-3 text-lg"
          >
            Start Your Journey
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-rose-100 hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Track Every Precious Moment</h2>
            <p className="text-gray-600 text-lg">
              From your first positive test to your baby's first kick, capture and celebrate every milestone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Progress</h3>
              <p className="text-gray-600">
                See how your baby grows each week with detailed development insights and size comparisons.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Logging</h3>
              <p className="text-gray-600">
                Record symptoms, mood, and health metrics to maintain a comprehensive pregnancy record.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Reminders</h3>
              <p className="text-gray-600">
                Never miss important appointments or tests with our intelligent reminder system.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Begin?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Join thousands of expecting mothers who trust MaternalCare for their pregnancy journey.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-gradient-to-r from-rose-soft to-rose-deep text-white hover:shadow-lg transition-all duration-200 px-8 py-3 text-lg"
          >
            Get Started Today
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center">
                <Heart className="text-white text-sm" />
              </div>
              <span className="text-lg font-semibold text-gray-800">MaternalCare</span>
            </div>
            <p className="text-gray-600">
              Empowering mothers with beautiful pregnancy tracking tools.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}