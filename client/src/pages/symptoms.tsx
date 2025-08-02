import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, TrendingUp, Calendar, Heart } from "lucide-react";

interface SymptomLog {
  id: string;
  timestamp: string;
  symptoms: Record<string, number>;
  mood_score?: number;
  moodScore?: number;
  notes?: string;
}

interface AnalyticsData {
  symptomFrequency: Record<string, number>;
  symptomAverages: Record<string, number>;
  moodTrend: Array<{ date: string; score: number }>;
  totalLogs: number;
  averageMood: number | null;
}

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<Record<string, number>>({});
  const [newSymptom, setNewSymptom] = useState("");
  const [moodScore, setMoodScore] = useState([5]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Common symptom suggestions
  const commonSymptoms = [
    "headache", "nausea", "fatigue", "back_pain", "swelling", 
    "heartburn", "cramps", "dizziness", "constipation", "insomnia"
  ];

  // Fetch symptom logs
  const { data: logs = [], isLoading } = useQuery<SymptomLog[]>({
    queryKey: ["/api/symptoms"],
  });

  // Fetch analytics
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/symptoms/analytics"],
  });

  // Log symptoms mutation
  const logSymptomsMutation = useMutation({
    mutationFn: async (data: { symptoms: Record<string, number>; mood_score: number; notes: string }) => {
      return apiRequest("/api/symptoms", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Symptoms Logged",
        description: "Your symptoms have been recorded successfully",
      });
      // Reset form
      setSymptoms({});
      setMoodScore([5]);
      setNotes("");
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms/analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log symptoms",
        variant: "destructive",
      });
    },
  });

  const handleAddSymptom = (symptomName: string) => {
    if (symptomName && !symptoms[symptomName]) {
      setSymptoms(prev => ({ ...prev, [symptomName]: 1 }));
      setNewSymptom("");
    }
  };

  const handleSymptomSeverityChange = (symptom: string, severity: number) => {
    setSymptoms(prev => ({ ...prev, [symptom]: severity }));
  };

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(prev => {
      const newSymptoms = { ...prev };
      delete newSymptoms[symptom];
      return newSymptoms;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(symptoms).length === 0 && moodScore[0] === 5 && !notes.trim()) {
      toast({
        title: "No Data",
        description: "Please add at least one symptom, mood score, or note",
        variant: "destructive",
      });
      return;
    }

    logSymptomsMutation.mutate({
      symptoms,
      mood_score: moodScore[0],
      notes: notes.trim(),
    });
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return "Mild";
    if (severity <= 4) return "Moderate";
    return "Severe";
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return "bg-green-100 text-green-800";
    if (severity <= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Tracking</h1>
        <p className="text-gray-600">
          Log your daily symptoms and mood to track patterns throughout your pregnancy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logging Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Log Today's Symptoms
              </CardTitle>
              <CardDescription>
                Record your symptoms with severity levels (1-5 scale) and overall mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Symptom Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Symptoms
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Enter symptom name"
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSymptom(newSymptom);
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      onClick={() => handleAddSymptom(newSymptom)}
                      disabled={!newSymptom || !!symptoms[newSymptom]}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Common Symptoms */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {commonSymptoms
                      .filter(symptom => !symptoms[symptom])
                      .map(symptom => (
                        <Button
                          key={symptom}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSymptom(symptom)}
                        >
                          {symptom.replace('_', ' ')}
                        </Button>
                      ))}
                  </div>

                  {/* Selected Symptoms with Severity */}
                  {Object.entries(symptoms).map(([symptom, severity]) => (
                    <div key={symptom} className="border rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">
                          {symptom.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(severity)}>
                            {getSeverityLabel(severity)}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSymptom(symptom)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Mild</span>
                          <span>Severe</span>
                        </div>
                        <Slider
                          value={[severity]}
                          onValueChange={(value) => handleSymptomSeverityChange(symptom, value[0])}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600">
                          Severity: {severity}/5
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mood Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Mood Score
                  </label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>😢 Poor</span>
                      <span>😊 Great</span>
                    </div>
                    <Slider
                      value={moodScore}
                      onValueChange={setMoodScore}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">
                      Mood: {moodScore[0]}/10
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Any additional details about how you're feeling today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={logSymptomsMutation.isPending}
                >
                  {logSymptomsMutation.isPending ? "Logging..." : "Log Symptoms"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : logs.length === 0 ? (
                <div className="text-center text-gray-500">No logs yet</div>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="border-l-4 border-blue-200 pl-3">
                      <div className="text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(log.symptoms || {}).map(([symptom, severity]) => (
                          <Badge 
                            key={symptom} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {symptom}: {severity}
                          </Badge>
                        ))}
                      </div>
                      {(log.mood_score || log.moodScore) && (
                        <div className="text-xs text-gray-500 mt-1">
                          Mood: {log.mood_score || log.moodScore}/10
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Summary */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  30-Day Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Logs</div>
                    <div className="text-2xl font-bold">{analytics.totalLogs}</div>
                  </div>
                  
                  {analytics.averageMood && (
                    <div>
                      <div className="text-sm text-gray-600">Average Mood</div>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {analytics.averageMood.toFixed(1)}/10
                        <Heart className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  )}

                  {analytics.symptomFrequency && Object.keys(analytics.symptomFrequency).length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Most Common Symptoms</div>
                      <div className="space-y-1">
                        {Object.entries(analytics.symptomFrequency)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([symptom, frequency]) => (
                            <div key={symptom} className="flex justify-between text-sm">
                              <span className="capitalize">{symptom.replace('_', ' ')}</span>
                              <span>{frequency} times</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}