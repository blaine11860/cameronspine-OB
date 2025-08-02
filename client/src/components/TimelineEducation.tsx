import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Education = {
  id: string;
  week: number;
  title: string;
  content: string;
  body_markdown?: string;
  readability_level: string;
  tags?: string[];
  created_at: string;
};

interface TimelineEducationProps {
  gestationalWeeks: number;
}

export function TimelineEducation({ gestationalWeeks }: TimelineEducationProps) {
  const [selectedWeek, setSelectedWeek] = useState(gestationalWeeks);
  const [readabilityLevel, setReadabilityLevel] = useState('medium');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch content for specific week
  const { data: weeklyContent, isLoading } = useQuery<Education>({
    queryKey: ['/api/education/week', selectedWeek, { readability: readabilityLevel }],
    enabled: !searchTerm, // Only fetch weekly content when not searching
  });

  // Fetch search results
  const { data: searchResults } = useQuery<Education[]>({
    queryKey: ['/api/education/search', { query: searchTerm, readability: readabilityLevel }],
    enabled: searchTerm.length >= 3,
  });

  // Update selected week when gestational weeks change
  useEffect(() => {
    setSelectedWeek(gestationalWeeks);
  }, [gestationalWeeks]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' ? selectedWeek - 1 : selectedWeek + 1;
    if (newWeek >= 1 && newWeek <= 42) {
      setSelectedWeek(newWeek);
    }
  };

  const getReadabilityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReadabilityLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Easy Reading';
      case 'medium': return 'Standard';
      case 'high': return 'Detailed';
      default: return level;
    }
  };

  const renderContent = (content: Education) => {
    const bodyContent = content.body_markdown || content.content;
    
    return (
      <Card key={content.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {content.title}
              </CardTitle>
              <CardDescription>
                Week {content.week} • {new Date(content.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={getReadabilityColor(content.readability_level)}>
              {getReadabilityLabel(content.readability_level)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />
          {content.tags && content.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {content.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Educational Content</CardTitle>
          <CardDescription>
            Week-by-week pregnancy information tailored to your reading preference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search educational content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={readabilityLevel} onValueChange={setReadabilityLevel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Easy Reading</SelectItem>
                <SelectItem value="medium">Standard</SelectItem>
                <SelectItem value="high">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Week Navigation (only show when not searching) */}
          {!searchTerm && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                disabled={selectedWeek <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Week
              </Button>
              
              <div className="text-center">
                <p className="text-lg font-semibold">Week {selectedWeek}</p>
                <p className="text-sm text-gray-600">
                  {selectedWeek === gestationalWeeks ? 'Current Week' : 
                   selectedWeek < gestationalWeeks ? 'Past Week' : 'Future Week'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                disabled={selectedWeek >= 42}
              >
                Next Week
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Display */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading educational content...
            </div>
          </CardContent>
        </Card>
      ) : searchTerm ? (
        // Search Results
        <div>
          {searchResults && searchResults.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.map(renderContent)}
            </div>
          ) : searchTerm.length >= 3 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No educational content found for "{searchTerm}"</p>
                <p className="text-sm">Try searching with different keywords</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : weeklyContent ? (
        // Weekly Content
        renderContent(weeklyContent)
      ) : (
        // No Content Available
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No educational content available for Week {selectedWeek}</p>
            <p className="text-sm">Content for this week is coming soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}