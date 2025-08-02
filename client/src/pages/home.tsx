import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PregnancyProgress from "@/components/PregnancyProgress";
import PregnancyTimeline from "@/components/PregnancyTimeline";
import MoodCheck from "@/components/MoodCheck";
import SymptomLogger from "@/components/SymptomLogger";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Weight, Check, Heart } from "lucide-react";
import { useState } from "react";
import type { PregnancyProfile } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showSymptomLogger, setShowSymptomLogger] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: pregnancyProfile, error: profileError } = useQuery<PregnancyProfile>({
    queryKey: ["/api/pregnancy/profile"],
    enabled: isAuthenticated,
  });

  const { data: recentSymptoms } = useQuery({
    queryKey: ["/api/symptoms"],
    enabled: !!pregnancyProfile?.id,
    meta: {
      params: { pregnancyId: pregnancyProfile?.id }
    }
  });

  const { data: recentMoods } = useQuery({
    queryKey: ["/api/mood"],
    enabled: !!pregnancyProfile?.id,
    meta: {
      params: { pregnancyId: pregnancyProfile?.id }
    }
  });

  // Handle errors
  useEffect(() => {
    if (profileError && isUnauthorizedError(profileError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [profileError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white text-2xl animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your pregnancy journey...</p>
        </div>
      </div>
    );
  }

  if (!pregnancyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Moore Maternal Care!</h1>
            <p className="text-gray-600 mb-8">Let's set up your pregnancy profile to get started.</p>
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  You'll need to create your pregnancy profile to start tracking your journey.
                </p>
                <Button className="w-full bg-gradient-to-r from-rose-soft to-rose-deep text-white">
                  Create Pregnancy Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 pb-20 lg:pb-0">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-soft to-rose-deep rounded-full flex items-center justify-center">
                <Heart className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Moore Maternal Care</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                className="border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
              >
                Schedule Appointment
              </Button>
              
              <button className="relative p-2 text-gray-600 hover:text-rose-deep transition-colors">
                <Bell className="text-lg" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-xs font-medium text-gray-700 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-rose-200" 
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || 'User'}
                </span>
                <button 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.firstName || 'there'}!
            </h2>
            <p className="text-gray-600">Let's check in on your pregnancy journey</p>
          </div>

          <PregnancyProgress pregnancyProfile={pregnancyProfile} />
        </div>

        {/* Appointment Scheduling Section */}
        <Card className="mb-8 border-rose-200 bg-gradient-to-r from-rose-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Need to Schedule an Appointment?</h3>
                <p className="text-gray-600 text-sm">Book your next prenatal visit with Moore OB/GYN</p>
              </div>
              <Button 
                onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                className="bg-rose-deep hover:bg-rose-deep/90 text-white"
              >
                Schedule Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pregnancy Timeline */}
          <div className="lg:col-span-2">
            <PregnancyTimeline pregnancyProfile={pregnancyProfile} />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Today's Check */}
            <Card className="border-rose-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Check-in</h3>
                
                <MoodCheck pregnancyProfile={pregnancyProfile} />
                
                <div className="space-y-3 mt-6">
                  <Button 
                    onClick={() => setShowSymptomLogger(true)}
                    className="w-full bg-gradient-to-r from-rose-soft to-rose-deep text-white hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Log Symptoms
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-2 border-lavender text-gray-700 hover:bg-lavender"
                  >
                    <Weight className="mr-2 h-4 w-4" />
                    Record Weight
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-rose-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                
                <div className="space-y-3">
                  {recentSymptoms && recentSymptoms.length > 0 ? (
                    recentSymptoms.slice(0, 3).map((symptom: any, index: number) => (
                      <div key={symptom.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-mint text-green-700 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">Symptom logged</p>
                          <p className="text-xs text-gray-500">
                            {new Date(symptom.loggedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">No recent activity</p>
                      <p className="text-xs">Start logging symptoms to see your activity here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Symptom Logger Modal */}
      <SymptomLogger 
        isOpen={showSymptomLogger}
        onClose={() => setShowSymptomLogger(false)}
        pregnancyProfile={pregnancyProfile}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
