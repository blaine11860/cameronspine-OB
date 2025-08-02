import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Circle } from "lucide-react";
import { Link } from "wouter";
import type { PregnancyProfile } from "@shared/schema";

interface PregnancyTimelineProps {
  pregnancyProfile: PregnancyProfile;
}

export default function PregnancyTimeline({ pregnancyProfile }: PregnancyTimelineProps) {
  const currentWeek = pregnancyProfile.currentWeek;

  const milestones = [
    {
      week: 20,
      title: "20 Week Anatomy Scan",
      description: "Comprehensive ultrasound completed",
      status: currentWeek > 20 ? "completed" : currentWeek === 20 ? "current" : "upcoming",
      completedDate: currentWeek > 20 ? "Jan 15, 2024" : null,
    },
    {
      week: 24,
      title: "Glucose Screening Test",
      description: "Scheduled for this week",
      status: currentWeek > 24 ? "completed" : currentWeek >= 24 && currentWeek <= 28 ? "current" : "upcoming",
      timeframe: currentWeek < 24 ? "Week 24-28" : null,
    },
    {
      week: 28,
      title: "Third Trimester Begins",
      description: "Week 28 milestone",
      status: currentWeek >= 28 ? "completed" : "upcoming",
      weeksAway: currentWeek < 28 ? Math.max(0, 28 - currentWeek) : null,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
        );
      case "current":
        return (
          <div className="w-8 h-8 bg-rose-soft text-rose-deep rounded-full flex items-center justify-center">
            <Circle className="h-2 w-2 fill-current" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        );
    }
  };

  const getStatusText = (milestone: any) => {
    if (milestone.status === "completed" && milestone.completedDate) {
      return <p className="text-xs text-green-600 font-medium">Completed on {milestone.completedDate}</p>;
    }
    if (milestone.status === "current") {
      return <p className="text-xs text-rose-600 font-medium">{milestone.timeframe || "Current"}</p>;
    }
    if (milestone.status === "upcoming" && milestone.weeksAway) {
      return <p className="text-xs text-gray-400">In {milestone.weeksAway} weeks</p>;
    }
    if (milestone.status === "upcoming" && milestone.timeframe) {
      return <p className="text-xs text-rose-600 font-medium">Upcoming - {milestone.timeframe}</p>;
    }
    return null;
  };

  return (
    <Card className="border-rose-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Your Pregnancy Timeline</h3>
          <Link href="/timeline">
            <Button variant="ghost" className="text-sm text-rose-deep hover:text-rose-600 font-medium">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={index}
              className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0">
                {getStatusIcon(milestone.status)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                {getStatusText(milestone)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}