import { Users, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    postCount: number;
    coverImage: string;
    isJoined: boolean;
    category: string;
  };
  onJoin: (communityId: string) => void;
}

export function CommunityCard({ community, onJoin }: CommunityCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="relative h-24">
        <ImageWithFallback
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <Badge className="absolute top-2 left-2">{community.category}</Badge>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">{community.name}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {community.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{community.memberCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="size-4" />
              <span>{community.postCount}</span>
            </div>
          </div>
          
          <Button
            size="sm"
            variant={community.isJoined ? "secondary" : "default"}
            onClick={() => onJoin(community.id)}
          >
            {community.isJoined ? "Joined" : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
}