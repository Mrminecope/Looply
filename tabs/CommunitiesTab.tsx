import { ScrollArea } from '../ui/scroll-area';
import { CommunityManagement } from '../communities/CommunityManagement';
import type { Community } from '../../types/app';

interface CommunitiesTabProps {
  communities?: Community[];
  onCreateCommunity: (data: any) => void;
  onJoinCommunity: (communityId: string) => void;
}

export function CommunitiesTab({
  communities = [],
  onCreateCommunity,
  onJoinCommunity
}: CommunitiesTabProps) {
  // Ensure communities is always defined
  const safeCommunities = communities || [];

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="p-4">
        <CommunityManagement
          communities={safeCommunities}
          onCreateCommunity={onCreateCommunity}
          onJoinCommunity={onJoinCommunity}
        />
      </div>
    </ScrollArea>
  );
}