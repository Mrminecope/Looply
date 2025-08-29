import { useEffect } from 'react';
import { richDemoData } from '../data/richDemoData';
import type { Post, Community } from '../types/app';

interface UseDataLoaderProps {
  setPosts: (posts: Post[]) => void;
  setCommunities: (communities: Community[]) => void;
  setError: (error: string | null) => void;
}

export function useDataLoader({
  setPosts,
  setCommunities,
  setError
}: UseDataLoaderProps) {
  
  const loadData = async () => {
    try {
      setError(null);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Load rich demo data
      setPosts(richDemoData.posts);
      setCommunities(richDemoData.communities);
      
      console.log('✅ Loaded rich demo data:', {
        posts: richDemoData.posts.length,
        communities: richDemoData.communities.length,
        users: richDemoData.users.length,
        messages: richDemoData.messages.length,
        notifications: richDemoData.notifications.length
      });
      
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load content. Please try again.');
    }
  };

  return { loadData };
}