import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Baby, Calendar, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center">
              <Heart className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">MaternalCare</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your pregnancy journey with personalized timeline visualization, 
            symptom logging, and mood monitoring features
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-rose-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-rose-soft rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-rose-deep" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pregnancy Timeline</h3>
              <p className="text-gray-600">Track important milestones and appointments throughout your pregnancy journey</p>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Symptom Logging</h3>
              <p className="text-gray-600">Log and monitor pregnancy symptoms with detailed tracking and severity levels</p>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mood Monitoring</h3>
              <p className="text-gray-600">Track your daily mood and emotional well-being throughout your pregnancy</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-md mx-auto border-rose-100">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Ready to start your journey?</h2>
              <p className="text-gray-600 mb-6">
                Join thousands of expecting mothers who trust MaternalCare for their pregnancy tracking
              </p>
              <Button 
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-rose-soft to-rose-deep text-white hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
