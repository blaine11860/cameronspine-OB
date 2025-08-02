import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, TrendingUp, User, Clock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SharedSummaryData {
  user: {
    name: string;
    email?: string;
  };
  profile: {
    dueDate: string;
    currentWeek?: number;
    highRiskFlags?: Record<string, any>;
    estimatedGestationalAge?: number;
  };
  recent_symptoms: Array<{
    timestamp: string;
    symptoms: Record<string, number>;
    mood_score?: number;
    moodScore?: number;
    notes?: string;
  }>;
  share_info: {
    created_at: string;
    expires_at: string;
  };
}

interface AnalyticsData {
  symptomFrequency: Record<string, number>;
  symptomAverages: Record<string, number>;
  moodTrend: Array<{ date: string; score: number }>;
  totalLogs: number;
  averageMood: number | null;
}

export default function SharedSummaryPage() {
  const params = useParams();
  const token = params.token;

  // Fetch shared summary data
  const { data: summary, isLoading, error } = useQuery<SharedSummaryData>({
    queryKey: [`/api/share/${token}`],
    enabled: !!token,
    retry: false,
  });

  // Fetch analytics data
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: [`/api/share/${token}/analytics`],
    enabled: !!token && !!summary,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared pregnancy summary...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              This share link is invalid, expired, or has been revoked.
            </p>
            <p className="text-sm text-gray-500">
              Please contact the patient for a new share link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPregnancyProgress = () => {
    if (summary.profile.estimatedGestationalAge) {
      return Math.min((summary.profile.estimatedGestationalAge / 40) * 100, 100);
    }
    if (summary.profile.currentWeek) {
      return Math.min((summary.profile.currentWeek / 40) * 100, 100);
    }
    return 0;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(summary.share_info.expires_at);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays}d`;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pregnancy Summary</h1>
              <p className="text-gray-600 mt-1">
                Clinical data shared by {summary.user.name}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Expires in {getTimeRemaining()}</span>
              </div>
              <p>Shared on {new Date(summary.share_info.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{summary.user.name}</p>
                  </div>
                  {summary.user.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{summary.user.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">
                      {new Date(summary.profile.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  {summary.profile.estimatedGestationalAge && (
                    <div>
                      <p className="text-sm text-gray-600">Gestational Age</p>
                      <p className="font-medium">{summary.profile.estimatedGestationalAge} weeks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pregnancy Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Pregnancy Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(getPregnancyProgress())}%</span>
                    </div>
                    <Progress value={getPregnancyProgress()} className="h-2" />
                  </div>
                  
                  {summary.profile.highRiskFlags && Object.keys(summary.profile.highRiskFlags).length > 0 && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>High-Risk Factors:</strong> Please review clinical flags in patient record.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Analytics */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    30-Day Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Symptom Logs</p>
                      <p className="text-2xl font-bold">{analytics.totalLogs}</p>
                    </div>
                    
                    {analytics.averageMood && (
                      <div>
                        <p className="text-sm text-gray-600">Average Mood Score</p>
                        <p className="text-2xl font-bold">{analytics.averageMood.toFixed(1)}/10</p>
                      </div>
                    )}

                    {Object.keys(analytics.symptomFrequency).length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Most Frequent Symptoms</p>
                        <div className="space-y-1">
                          {Object.entries(analytics.symptomFrequency)
                            .sort(([,a], [,b]) => (b as number) - (a as number))
                            .slice(0, 3)
                            .map(([symptom, frequency]) => (
                              <div key={symptom} className="flex justify-between text-sm">
                                <span className="capitalize">{symptom.replace('_', ' ')}</span>
                                <span>{frequency}x</span>
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

          {/* Symptom History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Symptom History (30 Days)
                </CardTitle>
                <CardDescription>
                  Clinical symptom tracking with JSONB structure and mood integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.recent_symptoms.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No symptom logs in the last 30 days</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summary.recent_symptoms.map((log, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleDateString()} at{' '}
                            {new Date(log.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          {(log.mood_score || log.moodScore) && (
                            <Badge variant="outline">
                              Mood: {log.mood_score || log.moodScore}/10
                            </Badge>
                          )}
                        </div>

                        {/* Symptoms */}
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(log.symptoms || {}).map(([symptom, severity]) => (
                              <Badge 
                                key={symptom}
                                className={getSeverityColor(severity)}
                              >
                                {symptom.replace('_', ' ')}: {severity}/5 ({getSeverityLabel(severity)})
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {log.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                            <p className="font-medium mb-1">Notes:</p>
                            <p>{log.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>This is a secure, temporary share of pregnancy data.</p>
            <p>Generated by MaternalCare Clinical Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}