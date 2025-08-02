import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, User, Baby, Calendar, Settings } from "lucide-react";
import { Link } from "wouter";
import type { PregnancyProfile } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const calculateDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 pb-20 lg:pb-0">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">Profile</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                className="border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
              >
                Schedule Appointment
              </Button>
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-rose-200" 
              />
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName || 'User'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <Card className="border-rose-100 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-rose-deep" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-4 border-rose-200" 
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" className="border-rose-200 text-rose-deep hover:bg-rose-50">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pregnancy Information */}
        {pregnancyProfile && (
          <Card className="border-rose-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-rose-deep" />
                <span>Pregnancy Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Current Week</h4>
                  <p className="text-2xl font-bold text-rose-deep">Week {pregnancyProfile.currentWeek}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Due Date</h4>
                  <p className="text-lg text-gray-700">
                    {new Date(pregnancyProfile.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculateDaysUntilDue(pregnancyProfile.dueDate)} days to go
                  </p>
                </div>
                {pregnancyProfile.babyName && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Baby's Name</h4>
                    <p className="text-lg text-gray-700">{pregnancyProfile.babyName}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Started Tracking</h4>
                  <p className="text-lg text-gray-700">
                    {new Date(pregnancyProfile.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="border-rose-200 text-rose-deep hover:bg-rose-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Pregnancy Info
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-rose-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Days Tracking</h3>
              <p className="text-2xl font-bold text-gray-800">
                {pregnancyProfile ? Math.floor((new Date().getTime() - new Date(pregnancyProfile.createdAt || '').getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mood Logs</h3>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Symptom Logs</h3>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="border-rose-100">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-200 text-gray-700"
              >
                Export My Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-200 text-gray-700"
              >
                Privacy Settings
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline" 
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
