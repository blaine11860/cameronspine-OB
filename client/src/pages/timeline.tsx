import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Check, Clock, Calendar, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { TimelineEducation } from "@/components/TimelineEducation";
import type { PregnancyProfile } from "@shared/schema";

export default function Timeline() {
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

  // Remove unused milestones query for now

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
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  const defaultMilestones = [
    { week: 8, title: "First Prenatal Visit", description: "Initial checkup and blood tests", status: "completed" },
    { week: 12, title: "First Trimester Screening", description: "NT scan and blood work", status: "completed" },
    { week: 16, title: "Quad Screen Test", description: "Optional genetic screening", status: "completed" },
    { week: 20, title: "Anatomy Scan", description: "Detailed ultrasound examination", status: "completed" },
    { week: 24, title: "Glucose Screening", description: "Test for gestational diabetes", status: "current" },
    { week: 28, title: "Third Trimester Begins", description: "Regular checkups increase", status: "upcoming" },
    { week: 32, title: "Growth Scan", description: "Check baby's growth and position", status: "upcoming" },
    { week: 36, title: "Group B Strep Test", description: "Screening for GBS infection", status: "upcoming" },
    { week: 40, title: "Due Date", description: "Expected delivery date", status: "upcoming" },
  ];

  const currentWeek = pregnancyProfile?.currentWeek || 24;

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
              <h1 className="text-xl font-semibold text-gray-800">Pregnancy Timeline</h1>
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
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Pregnancy Journey</h2>
          <p className="text-gray-600">Track your milestones and important appointments</p>
        </div>

        {/* Current Week Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-soft to-rose-deep text-white rounded-full">
            <Calendar className="h-4 w-4 mr-2" />
            Currently Week {currentWeek}
          </div>
        </div>

        {/* Timeline */}
        <Card className="border-rose-100">
          <CardContent className="p-6">
            <div className="space-y-6">
              {defaultMilestones.map((milestone, index) => {
                const status = milestone.week < currentWeek ? 'completed' : 
                              milestone.week === currentWeek ? 'current' : 'upcoming';
                
                return (
                  <div key={index} className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0 mt-1">
                      {status === 'completed' && (
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {status === 'current' && (
                        <div className="w-8 h-8 bg-rose-soft text-rose-deep rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-rose-deep rounded-full" />
                        </div>
                      )}
                      {status === 'upcoming' && (
                        <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                        <span className="text-sm text-gray-500">Week {milestone.week}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      
                      {status === 'completed' && (
                        <p className="text-xs text-green-600 font-medium">Completed</p>
                      )}
                      {status === 'current' && (
                        <p className="text-xs text-rose-600 font-medium">Current Week</p>
                      )}
                      {status === 'upcoming' && (
                        <p className="text-xs text-gray-400">
                          {milestone.week - currentWeek} weeks to go
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Educational Content */}
        <Card className="border-rose-100 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Educational Content</h3>
                <p className="text-sm text-gray-600">Learn about your pregnancy week by week</p>
              </div>
              <BookOpen className="h-6 w-6 text-rose-deep" />
            </div>
            <TimelineEducation gestationalWeeks={currentWeek} />
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card className="border-rose-100 mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {defaultMilestones.filter(m => m.week < currentWeek).length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-rose-deep">1</div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {defaultMilestones.filter(m => m.week > currentWeek).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
