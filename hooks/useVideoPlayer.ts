import { useState } from 'react';
import type { Post, User } from '../types/app';

interface UseVideoPlayerProps {
  videoPosts: Post[];
  user: User | null;
}

export function useVideoPlayer({ videoPosts, user }: UseVideoPlayerProps) {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoPlayerIndex, setVideoPlayerIndex] = useState(0);

  const handleVideoClick = (videoId: string, index: number) => {
    setVideoPlayerIndex(index);
    setShowVideoPlayer(true);
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
  };

  const handleVideoSave = (videoId: string) => {
    // Mock save functionality
    console.log('Saving video:', videoId);
  };

  return {
    showVideoPlayer,
    videoPlayerIndex,
    handleVideoClick,
    handleCloseVideoPlayer,
    handleVideoSave
  };
}