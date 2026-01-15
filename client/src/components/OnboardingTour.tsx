import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Baby, Calendar, Heart, MessageCircle, Users, 
  Share2, Pill, ChevronRight, ChevronLeft, X 
} from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: ReactNode;
  feature: string;
}

const TOUR_STORAGE_KEY = "moore-maternal-tour-completed";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      title: "Welcome to Moore Maternal Care",
      description: "Your comprehensive pregnancy tracking companion. Let us show you around the key features that will help you on your journey.",
      icon: <Baby className="w-12 h-12 text-rose-500" />,
      feature: "welcome"
    },
    {
      title: "Pregnancy Timeline",
      description: "Track your pregnancy week by week with personalized milestones, baby development updates, and helpful tips tailored to your stage.",
      icon: <Calendar className="w-12 h-12 text-rose-500" />,
      feature: "timeline"
    },
    {
      title: "Symptom Tracking",
      description: "Log your daily symptoms and mood to identify patterns. Our clinical analytics help you and your healthcare provider monitor your health.",
      icon: <Heart className="w-12 h-12 text-rose-500" />,
      feature: "symptoms"
    },
    {
      title: "Secure Messaging",
      description: "Connect directly with your healthcare team through secure, HIPAA-compliant messaging. Get answers to your questions quickly.",
      icon: <MessageCircle className="w-12 h-12 text-rose-500" />,
      feature: "messages"
    },
    {
      title: "Community Forum",
      description: "Join a supportive community of expectant mothers. Share experiences, ask questions, and find encouragement from others on similar journeys.",
      icon: <Users className="w-12 h-12 text-rose-500" />,
      feature: "forum"
    },
    {
      title: "Share with Providers",
      description: "Securely share your pregnancy data with healthcare providers using time-limited access tokens. You control who sees your information.",
      icon: <Share2 className="w-12 h-12 text-rose-500" />,
      feature: "share"
    },
    {
      title: "Supplements Shop",
      description: "Browse and purchase recommended prenatal supplements directly through our integrated store, with products vetted by healthcare professionals.",
      icon: <Pill className="w-12 h-12 text-rose-500" />,
      feature: "supplements"
    }
  ];

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-rose-200">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            onClick={handleSkip}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-rose-50 rounded-full">
              {step.icon}
            </div>
          </div>
          <CardTitle className="text-center text-xl">{step.title}</CardTitle>
          <CardDescription className="text-center mt-2">
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-gray-500 mt-2">
            {currentStep + 1} of {tourSteps.length}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-rose-500 hover:bg-rose-600"
          >
            {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
            {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function resetOnboardingTour() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
