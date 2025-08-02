import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type { PregnancyProfile } from "@shared/schema";

interface SymptomLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  pregnancyProfile: PregnancyProfile;
}

const symptomOptions = [
  "Nausea",
  "Fatigue",
  "Headache",
  "Back Pain",
  "Heartburn",
  "Swelling",
  "Constipation",
  "Breast Tenderness",
  "Mood Changes",
  "Sleep Issues",
  "Leg Cramps",
  "Round Ligament Pain",
];

const severityOptions = [
  { value: 1, emoji: "😌", label: "Mild", color: "green" },
  { value: 2, emoji: "😐", label: "Moderate", color: "yellow" },
  { value: 3, emoji: "😣", label: "Severe", color: "red" },
];

export default function SymptomLogger({ isOpen, onClose, pregnancyProfile }: SymptomLoggerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const symptomMutation = useMutation({
    mutationFn: async () => {
      if (selectedSymptoms.length === 0) {
        throw new Error("Please select at least one symptom");
      }
      
      await apiRequest("POST", "/api/symptoms", {
        pregnancyId: pregnancyProfile.id,
        symptoms: selectedSymptoms,
        severity: selectedSeverity,
        notes: notes.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      toast({
        title: "Symptoms logged",
        description: "Your symptoms have been recorded successfully.",
      });
      handleClose();
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
        description: error.message || "Failed to log symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedSymptoms([]);
    setSelectedSeverity(1);
    setNotes("");
    onClose();
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    symptomMutation.mutate();
  };

  const getSeverityColorClasses = (severity: number, isSelected: boolean) => {
    const colors = {
      1: isSelected ? "border-green-500 bg-green-50" : "hover:border-green-300",
      2: isSelected ? "border-yellow-500 bg-yellow-50" : "hover:border-yellow-300",
      3: isSelected ? "border-red-500 bg-red-50" : "hover:border-red-300",
    };
    return colors[severity as keyof typeof colors] || "";
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Log Symptoms</h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Symptom Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select symptoms you're experiencing:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {symptomOptions.map((symptom) => (
                <label 
                  key={symptom}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSymptoms.includes(symptom)
                      ? "border-rose-300 bg-rose-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input 
                    type="checkbox"
                    className="text-rose-deep focus:ring-rose-soft"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                  />
                  <span className="text-sm text-gray-700">{symptom}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Severity Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <div className="flex space-x-2">
              {severityOptions.map((severity) => (
                <button
                  key={severity.value}
                  type="button"
                  onClick={() => setSelectedSeverity(severity.value)}
                  className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-colors text-center ${
                    selectedSeverity === severity.value
                      ? getSeverityColorClasses(severity.value, true)
                      : `border-gray-200 ${getSeverityColorClasses(severity.value, false)}`
                  }`}
                >
                  <div className={`text-xl mb-1 text-${severity.color}-500`}>
                    {severity.emoji}
                  </div>
                  <div className="text-xs text-gray-600">{severity.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full focus:ring-2 focus:ring-rose-soft focus:border-rose-soft"
              placeholder="Any additional details about your symptoms..."
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={symptomMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-rose-soft to-rose-deep text-white hover:shadow-lg transition-all duration-200"
              disabled={symptomMutation.isPending || selectedSymptoms.length === 0}
            >
              {symptomMutation.isPending ? "Logging..." : "Log Symptoms"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
