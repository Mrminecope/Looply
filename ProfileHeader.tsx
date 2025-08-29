import { Settings, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface ProfileHeaderProps {
  user: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    followers: number;
    following: number;
    posts: number;
    communities: string[];
  };
  isOwnProfile?: boolean;
}

export function ProfileHeader({ user, isOwnProfile = true }: ProfileHeaderProps) {
  return (
    <div className="bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <Avatar className="size-20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
              <Button variant="outline" size="sm">
                <Edit className="size-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="size-4" />
              </Button>
            </>
          ) : (
            <Button size="sm">
              Follow
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h1 className="font-medium text-xl">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        
        <p className="text-foreground">{user.bio}</p>
        
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="font-medium">{user.posts}</span>{' '}
            <span className="text-muted-foreground">posts</span>
          </div>
          <div>
            <span className="font-medium">{user.followers.toLocaleString()}</span>{' '}
            <span className="text-muted-foreground">followers</span>
          </div>
          <div>
            <span className="font-medium">{user.following}</span>{' '}
            <span className="text-muted-foreground">following</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {user.communities.slice(0, 3).map((community, index) => (
            <Badge key={index} variant="secondary">
              {community}
            </Badge>
          ))}
          {user.communities.length > 3 && (
            <Badge variant="outline">
              +{user.communities.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}