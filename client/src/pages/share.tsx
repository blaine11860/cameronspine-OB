import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Share2, Copy, Trash2, Calendar, ExternalLink, Shield, Clock } from "lucide-react";

interface ShareToken {
  token: string;
  expires_at: string;
  created_at: string;
}

export default function SharePage() {
  const [duration, setDuration] = useState("7");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active share tokens
  const { data: tokens = [], isLoading } = useQuery<ShareToken[]>({
    queryKey: ["/api/share/tokens"],
  });

  // Create share token mutation
  const createTokenMutation = useMutation({
    mutationFn: async (durationDays: number) => {
      return apiRequest("/api/share/create", "POST", { duration: durationDays });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Share Link Created",
        description: "Your secure share link has been generated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/share/tokens"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create share link",
        variant: "destructive",
      });
    },
  });

  // Revoke token mutation
  const revokeTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest(`/api/share/tokens/${token}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Share Link Revoked",
        description: "The share link has been deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/share/tokens"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke share link",
        variant: "destructive",
      });
    },
  });

  const handleCreateToken = () => {
    createTokenMutation.mutate(parseInt(duration));
  };

  const handleCopyLink = (token: string) => {
    const shareUrl = `${window.location.origin}/api/share/${token}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard",
      });
    });
  };

  const handleViewLink = (token: string) => {
    const shareUrl = `${window.location.origin}/api/share/${token}`;
    window.open(shareUrl, '_blank');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1 week";
    return `${diffWeeks} weeks`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Data Sharing</h1>
        <p className="text-gray-600">
          Generate secure links to share your pregnancy data with healthcare providers. 
          Links are temporary and expire automatically for your privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Share Link */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Create Share Link
              </CardTitle>
              <CardDescription>
                Generate a secure link for healthcare providers to access your pregnancy summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="14">2 Weeks</SelectItem>
                    <SelectItem value="30">1 Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">What's Included:</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Pregnancy profile and due date</li>
                      <li>• Recent symptom logs (30 days)</li>
                      <li>• Mood tracking data</li>
                      <li>• Clinical analytics summary</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateToken}
                disabled={createTokenMutation.isPending}
                className="w-full"
              >
                {createTokenMutation.isPending ? "Creating..." : "Create Share Link"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Share Links */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Active Share Links
              </CardTitle>
              <CardDescription>
                Manage your active share links and monitor access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">Loading...</div>
              ) : tokens.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Active Share Links</p>
                  <p className="text-sm">Create a share link to allow healthcare providers to access your data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tokens.map((token) => (
                    <div 
                      key={token.token} 
                      className={`border rounded-lg p-4 ${isExpired(token.expires_at) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {token.token.substring(0, 8)}...
                            </code>
                            {isExpired(token.expires_at) ? (
                              <Badge variant="secondary">Expired</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {new Date(token.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {isExpired(token.expires_at) 
                                  ? "Expired" 
                                  : `Expires in ${getTimeRemaining(token.expires_at)}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isExpired(token.expires_at) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLink(token.token)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(token.token)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeTokenMutation.mutate(token.token)}
                            disabled={revokeTokenMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How It Works</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share links contain a secure random token</li>
                <li>• No personal information is exposed in the URL</li>
                <li>• Links expire automatically based on your chosen duration</li>
                <li>• You can revoke access at any time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Included</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Basic pregnancy profile information</li>
                <li>• Symptom logs from the last 30 days</li>
                <li>• Mood tracking trends and analytics</li>
                <li>• Clinical summary for healthcare review</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}