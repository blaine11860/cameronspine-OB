import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MessageCircle, Plus, Search, TrendingUp, Users, Clock, Pin, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

const newThreadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
});

type ForumThread = {
  id: string;
  title: string;
  body: string;
  category?: string;
  author_id: string;
  is_pinned?: boolean;
  is_flagged?: boolean;
  created_at: string;
  updated_at?: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
  posts?: { count: number }[];
};

export default function Forum() {
  // Mock user for demo purposes
  const user = { firstName: "Sarah", lastName: "Johnson" };
  const isAuthenticated = true;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);

  // Get forum categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/forum/categories"],
  });

  // Get forum threads
  const { data: threads = [], isLoading } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/threads", { search: searchTerm, category: selectedCategory !== "all" ? selectedCategory : undefined }],
  });

  // Get trending threads
  const { data: trendingThreads = [] } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/trending"],
  });

  // Form for new thread
  const form = useForm<z.infer<typeof newThreadSchema>>({
    resolver: zodResolver(newThreadSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  // Create new thread mutation
  const createThreadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newThreadSchema>) => {
      return apiRequest("/api/forum/threads", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/trending"] });
      setIsNewThreadOpen(false);
      form.reset();
      toast({
        title: "Thread Created",
        description: "Your thread has been posted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof newThreadSchema>) => {
    createThreadMutation.mutate(data);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      announcements: "bg-blue-100 text-blue-800",
      first_trimester: "bg-green-100 text-green-800",
      second_trimester: "bg-yellow-100 text-yellow-800",
      third_trimester: "bg-orange-100 text-orange-800",
      symptoms: "bg-red-100 text-red-800",
      nutrition: "bg-purple-100 text-purple-800",
      birth_prep: "bg-pink-100 text-pink-800",
      postpartum: "bg-indigo-100 text-indigo-800",
      support: "bg-teal-100 text-teal-800",
      general: "bg-gray-100 text-gray-800",
    };
    return colors[categoryId] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 pb-20 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
            <p className="text-gray-600">Connect with other expecting mothers and share experiences</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
              className="border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
            >
              Schedule Appointment
            </Button>

            {isAuthenticated && (
            <Dialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-rose-deep hover:bg-rose-deep/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Thread
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Thread</DialogTitle>
                  <DialogDescription>
                    Start a new discussion in the community forum
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter thread title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your thoughts, questions, or experiences..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsNewThreadOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createThreadMutation.isPending}
                        className="bg-rose-deep hover:bg-rose-deep/90"
                      >
                        {createThreadMutation.isPending ? "Creating..." : "Create Thread"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5" />
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Discussions
                </Button>
                {categories.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Trending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingThreads.slice(0, 5).map((thread) => (
                  <div key={thread.id} className="text-sm">
                    <div className="font-medium line-clamp-2 hover:text-rose-deep cursor-pointer">
                      {thread.title}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-deep mx-auto mb-4"></div>
                <p className="text-gray-600">Loading discussions...</p>
              </div>
            ) : threads.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No discussions found</p>
                  <p className="text-sm text-gray-500">Be the first to start a conversation!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <Card key={thread.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {thread.is_pinned && (
                              <Pin className="h-4 w-4 text-blue-500" />
                            )}
                            <h3 className="font-semibold text-lg hover:text-rose-deep cursor-pointer">
                              {thread.title}
                            </h3>
                            {thread.category && (
                              <Badge className={getCategoryColor(thread.category)}>
                                {getCategoryName(thread.category)}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {thread.body}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <img
                                  src={thread.author?.profile_image_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                                  alt="Author"
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span>
                                  {thread.author?.first_name} {thread.author?.last_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{thread.posts?.[0]?.count || 0} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}