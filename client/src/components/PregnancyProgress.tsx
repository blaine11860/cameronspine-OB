import { Card, CardContent } from "@/components/ui/card";
import type { PregnancyProfile } from "@shared/schema";

interface PregnancyProgressProps {
  pregnancyProfile: PregnancyProfile;
}

export default function PregnancyProgress({ pregnancyProfile }: PregnancyProgressProps) {
  const calculateProgress = () => {
    const currentWeek = pregnancyProfile.currentWeek;
    const totalWeeks = 40;
    return Math.round((currentWeek / totalWeeks) * 100);
  };

  const calculateDaysRemaining = () => {
    const dueDate = new Date(pregnancyProfile.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getBabySize = (week: number) => {
    const sizes = [
      { week: 4, size: "poppy seed" },
      { week: 6, size: "lentil" },
      { week: 8, size: "raspberry" },
      { week: 10, size: "strawberry" },
      { week: 12, size: "lime" },
      { week: 14, size: "lemon" },
      { week: 16, size: "avocado" },
      { week: 18, size: "bell pepper" },
      { week: 20, size: "banana" },
      { week: 22, size: "spaghetti squash" },
      { week: 24, size: "corn on the cob" },
      { week: 26, size: "scallion" },
      { week: 28, size: "eggplant" },
      { week: 30, size: "cabbage" },
      { week: 32, size: "jicama" },
      { week: 34, size: "cantaloupe" },
      { week: 36, size: "romaine lettuce" },
      { week: 38, size: "winter melon" },
      { week: 40, size: "watermelon" },
    ];
    
    const sizeInfo = sizes.reverse().find(s => week >= s.week);
    return sizeInfo ? sizeInfo.size : "poppy seed";
  };

  const getTrimester = (week: number) => {
    if (week <= 12) return "First Trimester";
    if (week <= 27) return "Second Trimester";
    return "Third Trimester";
  };

  const progress = calculateProgress();
  const daysRemaining = calculateDaysRemaining();
  const babySize = getBabySize(pregnancyProfile.currentWeek);
  const trimester = getTrimester(pregnancyProfile.currentWeek);

  // Calculate stroke-dashoffset for the progress circle
  const circumference = 2 * Math.PI * 54; // radius is 54
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="border-rose-100">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Week {pregnancyProfile.currentWeek}
            </h3>
            <p className="text-gray-600 mb-2">
              Your baby is the size of a{" "}
              <span className="font-medium text-rose-deep">{babySize}</span>
            </p>
            <p className="text-sm text-gray-500">
              {daysRemaining} days until your due date
            </p>
          </div>
          
          <div className="relative">
            {/* Progress Circle */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  stroke="#F3F4F6" 
                  strokeWidth="8" 
                  fill="none"
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  stroke="url(#gradient)" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "var(--rose-soft)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--rose-deep)" }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{progress}%</span>
              </div>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <p className="text-sm text-gray-500 mb-1">Due Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(pregnancyProfile.dueDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">{trimester}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}