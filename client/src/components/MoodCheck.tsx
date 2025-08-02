import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { PregnancyProfile, MoodLog } from "@shared/schema";

interface MoodCheckProps {
  pregnancyProfile: PregnancyProfile;
}

const moodOptions = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "unwell", emoji: "😷", label: "Unwell" },
];

export default function MoodCheck({ pregnancyProfile }: MoodCheckProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todaysMood } = useQuery<MoodLog>({
    queryKey: ["/api/mood/today"],
    meta: {
      params: { pregnancyId: pregnancyProfile.id }
    }
  });

  useEffect(() => {
    if (todaysMood) {
      setSelectedMood(todaysMood.mood);
    }
  }, [todaysMood]);

  const moodMutation = useMutation({
    mutationFn: async (mood: string) => {
      await apiRequest("POST", "/api/mood", {
        pregnancyId: pregnancyProfile.id,
        mood,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood/today"] });
      toast({
        title: "Mood logged",
        description: "Your mood has been recorded for today.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    if (!todaysMood || todaysMood.mood !== mood) {
      moodMutation.mutate(mood);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3">How are you feeling today?</h4>
      <div className="flex justify-between space-x-2">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            disabled={moodMutation.isPending}
            className={`flex-1 p-3 rounded-xl border-2 transition-colors text-center ${
              selectedMood === mood.value
                ? "border-rose-300 bg-rose-50"
                : "border-gray-200 hover:border-rose-300"
            } ${moodMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-2xl mb-1">{mood.emoji}</div>
            <div 
              className={`text-xs ${
                selectedMood === mood.value 
                  ? "text-rose-700 font-medium" 
                  : "text-gray-600"
              }`}
            >
              {mood.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
