import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Crown, 
  Shield, 
  Search,
  Filter,
  MoreVertical,
  Settings
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { Community } from '../../types/app';

interface CommunityManagementProps {
  communities: Community[];
  onCreateCommunity: (data: any) => void;
  onJoinCommunity: (id: string) => void;
}

export function CommunityManagement({
  communities,
  onCreateCommunity,
  onJoinCommunity
}: CommunityManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("members");
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "general",
    isPrivate: false
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "technology", label: "Technology" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "creative", label: "Creative" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "education", label: "Education" },
    { value: "gaming", label: "Gaming" },
    { value: "sports", label: "Sports" },
    { value: "general", label: "General" }
  ];

  const filteredCommunities = communities
    .filter(community => 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || community.category.toLowerCase() === selectedCategory.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return (b.memberCount || b.members || 0) - (a.memberCount || a.members || 0);
        case "posts":
          return (b.postCount || b.posts || 0) - (a.postCount || a.posts || 0);
        case "recent":
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleCreateCommunity = () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    onCreateCommunity(newCommunity);
    setNewCommunity({
      name: "",
      description: "",
      category: "general",
      isPrivate: false
    });
    setShowCreateModal(false);
  };

  const joinedCommunities = communities.filter(c => c.isJoined);
  const availableCommunities = communities.filter(c => !c.isJoined);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Communities</h2>
          <p className="text-sm text-muted-foreground">
            Discover and join communities that match your interests
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="members">Members</SelectItem>
            <SelectItem value="posts">Posts</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Community Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">
            Discover ({availableCommunities.length})
          </TabsTrigger>
          <TabsTrigger value="joined">
            Joined ({joinedCommunities.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredCommunities.filter(c => !c.isJoined).map(community => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onJoin={() => onJoinCommunity(community.id)}
                />
              ))}
              {filteredCommunities.filter(c => !c.isJoined).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No communities found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="joined" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {joinedCommunities.map(community => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onJoin={() => onJoinCommunity(community.id)}
                  isJoined={true}
                />
              ))}
              {joinedCommunities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't joined any communities yet</p>
                  <p className="text-sm">Discover communities that interest you</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Create Community Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start a new community around your interests and connect with like-minded people.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Community Name</label>
              <Input
                placeholder="Enter community name"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your community..."
                rows={3}
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={newCommunity.category} 
                onValueChange={(value) => setNewCommunity({...newCommunity, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== "all").map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCommunity}>
              Create Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommunityCard({ 
  community, 
  onJoin, 
  isJoined = false 
}: { 
  community: Community; 
  onJoin: () => void; 
  isJoined?: boolean;
}) {
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      creative: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      lifestyle: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      gaming: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      sports: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return colors[category.toLowerCase() as keyof typeof colors] || colors.default;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{community.name}</CardTitle>
              {community.role && getRoleIcon(community.role)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {community.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{(community.memberCount || community.members || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{(community.postCount || community.posts || 0).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(community.category)}>
              {community.category}
            </Badge>
            <Button
              size="sm"
              variant={isJoined ? "outline" : "default"}
              onClick={onJoin}
            >
              {isJoined ? "Leave" : "Join"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}