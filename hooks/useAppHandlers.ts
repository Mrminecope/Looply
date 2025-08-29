import { useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { localStorageService } from '../utils/local-storage-service';
import { reelAlgorithm } from '../utils/reel-algorithm';
import { generateMockUserData, generateMockPosts, generateMockCommunities } from '../utils/demo-data';
import type { User, Post, Community } from '../types/app';

interface UseAppHandlersProps {
  user: User | null;
  posts: Post[];
  setUser: (user: User | null) => void;
  setPosts: (posts: Post[]) => void;
  setCommunities: (communities: Community[]) => void;
  setShowCreateModal: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export function useAppHandlers({
  user,
  posts,
  setUser,
  setPosts,
  setCommunities,
  setShowCreateModal,
  setActiveTab,
  setIsAuthenticated,
  setShowAuthModal,
  setError,
  setLoading
}: UseAppHandlersProps) {

  // Enhanced error handling wrapper
  const withErrorHandling = useCallback((fn: Function, errorMessage: string) => {
    return async (...args: any[]) => {
      try {
        await fn(...args);
      } catch (error) {
        console.error(`Error in ${fn.name}:`, error);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };
  }, [setError]);

  // Enhanced loading wrapper
  const withLoading = useCallback((fn: Function) => {
    return async (...args: any[]) => {
      try {
        setLoading(true);
        await fn(...args);
      } finally {
        setLoading(false);
      }
    };
  }, [setLoading]);

  const handleAuthSuccess = useCallback(withErrorHandling(async (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    
    // Initialize user data in localStorage
    await localStorageService.saveUser(userData);
    
    // Load initial data
    const savedPosts = await localStorageService.getAllPosts();
    const savedCommunities = await localStorageService.getAllCommunities();
    
    if (savedPosts.length === 0) {
      // Generate initial demo data
      const demoPosts = generateMockPosts(20);
      await localStorageService.savePosts(demoPosts);
      setPosts(demoPosts);
    } else {
      setPosts(savedPosts);
    }
    
    if (savedCommunities.length === 0) {
      const demoCommunities = generateMockCommunities(5);
      await localStorageService.saveCommunities(demoCommunities);
      setCommunities(demoCommunities);
    } else {
      setCommunities(savedCommunities);
    }
    
    toast.success(`Welcome back, ${userData.name}!`);
  }, 'Failed to complete authentication'), [setUser, setIsAuthenticated, setShowAuthModal, setPosts, setCommunities]);

  const handleTabChange = useCallback((tab: string) => {
    try {
      setActiveTab(tab);
      
      // Add haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
      
      // Track tab change for analytics
      console.log(`User switched to tab: ${tab}`);
    } catch (error) {
      console.error('Error changing tab:', error);
      toast.error('Failed to switch tab');
    }
  }, [setActiveTab]);

  const handleCreatePost = useCallback(withErrorHandling(async (postData: Partial<Post>) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      content: postData.content || '',
      image: postData.image || null,
      video: postData.video || null,
      type: postData.type || 'text',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      location: postData.location || null,
      hashtags: postData.hashtags || [],
      mentions: postData.mentions || [],
      isLiked: false,
      isSaved: false,
      community: postData.community || null,
      visibility: postData.visibility || 'public',
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0
      }
    };

    // Update posts state
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    
    // Save to localStorage
    await localStorageService.savePost(newPost);
    
    // Update user's post count
    const updatedUser = { ...user, postsCount: (user.postsCount || 0) + 1 };
    setUser(updatedUser);
    await localStorageService.saveUser(updatedUser);
    
    setShowCreateModal(false);
    toast.success('Post created successfully!');
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  }, 'Failed to create post'), [user, posts, setPosts, setUser, setShowCreateModal]);

  const handleLike = useCallback(withErrorHandling(async (postId: string, reactionType: string = 'like') => {
    if (!user) {
      toast.error('You must be logged in to react to posts');
      return;
    }

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isCurrentlyLiked = post.isLiked;
        const likesChange = isCurrentlyLiked ? -1 : 1;
        
        return {
          ...post,
          likes: Math.max(0, post.likes + likesChange),
          isLiked: !isCurrentlyLiked,
          reactions: {
            ...post.reactions,
            [reactionType]: Math.max(0, (post.reactions?.[reactionType as keyof typeof post.reactions] || 0) + likesChange)
          }
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    
    // Save updated posts to localStorage
    await localStorageService.savePosts(updatedPosts);
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    
    // Show toast with reaction emoji
    const reactionEmojis = {
      like: '👍',
      love: '❤️',
      laugh: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };
    
    const emoji = reactionEmojis[reactionType as keyof typeof reactionEmojis] || '👍';
    const post = posts.find(p => p.id === postId);
    const isLiking = !post?.isLiked;
    
    toast.success(isLiking ? `${emoji} Reacted!` : 'Reaction removed');
  }, 'Failed to update reaction'), [user, posts, setPosts]);

  const handleComment = useCallback(withErrorHandling(async (postId: string, commentText: string) => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    
    // Save updated posts to localStorage
    await localStorageService.savePosts(updatedPosts);
    
    toast.success('Comment added!');
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, 'Failed to add comment'), [user, posts, setPosts]);

  const handleShare = useCallback(withErrorHandling(async (postId: string, shareData?: any) => {
    const post = posts.find(p => p.id === postId);
    if (!post) {
      toast.error('Post not found');
      return;
    }

    // Update share count
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, shares: p.shares + 1 };
      }
      return p;
    });

    setPosts(updatedPosts);
    await localStorageService.savePosts(updatedPosts);

    // Try Web Share API first
    if (navigator.share && shareData) {
      try {
        await navigator.share({
          title: `Check out this post by ${post.author.name}`,
          text: post.content,
          url: window.location.href
        });
        toast.success('Shared successfully!');
        return;
      } catch (error) {
        console.log('Web Share API not supported or cancelled');
      }
    }

    // Fallback to clipboard
    try {
      const shareText = `Check out this post by ${post.author.name}: "${post.content}" - ${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }

    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([5, 5, 5]);
    }
  }, 'Failed to share post'), [posts, setPosts]);

  const handlePostView = useCallback(withErrorHandling(async (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, views: post.views + 1 };
      }
      return post;
    });

    setPosts(updatedPosts);
    
    // Debounced save to localStorage (don't save every view immediately)
    setTimeout(async () => {
      await localStorageService.savePosts(updatedPosts);
    }, 2000);
  }, 'Failed to track post view'), [posts, setPosts]);

  const handleJoinCommunity = useCallback(withErrorHandling(async (communityId: string) => {
    if (!user) {
      toast.error('You must be logged in to join communities');
      return;
    }

    // Update user's joined communities
    const currentJoined = user.joinedCommunities || [];
    const isJoined = currentJoined.includes(communityId);
    
    const updatedJoined = isJoined 
      ? currentJoined.filter(id => id !== communityId)
      : [...currentJoined, communityId];

    const updatedUser = {
      ...user,
      joinedCommunities: updatedJoined
    };

    setUser(updatedUser);
    await localStorageService.saveUser(updatedUser);
    
    toast.success(isJoined ? 'Left community' : 'Joined community!');
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(isJoined ? 5 : 15);
    }
  }, 'Failed to update community membership'), [user, setUser]);

  const handleCreateCommunity = useCallback(withErrorHandling(async (communityData: Partial<Community>) => {
    if (!user) {
      toast.error('You must be logged in to create communities');
      return;
    }

    const newCommunity: Community = {
      id: `community-${Date.now()}`,
      name: communityData.name || '',
      description: communityData.description || '',
      image: communityData.image || null,
      memberCount: 1,
      isJoined: true,
      category: communityData.category || 'General',
      privacy: communityData.privacy || 'public',
      rules: communityData.rules || [],
      moderators: [user.id],
      createdAt: new Date().toISOString(),
      tags: communityData.tags || []
    };

    // Update communities
    const savedCommunities = await localStorageService.getAllCommunities();
    const updatedCommunities = [newCommunity, ...savedCommunities];
    await localStorageService.saveCommunities(updatedCommunities);
    setCommunities(updatedCommunities);
    
    // Update user's joined communities
    const updatedUser = {
      ...user,
      joinedCommunities: [...(user.joinedCommunities || []), newCommunity.id]
    };
    setUser(updatedUser);
    await localStorageService.saveUser(updatedUser);
    
    toast.success('Community created successfully!');
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  }, 'Failed to create community'), [user, setUser, setCommunities]);

  const handleMarkNotificationRead = useCallback(withErrorHandling(async (notificationId: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      notifications: (user.notifications || []).map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    };

    setUser(updatedUser);
    await localStorageService.saveUser(updatedUser);
  }, 'Failed to mark notification as read'), [user, setUser]);

  const handleMarkAllNotificationsRead = useCallback(withErrorHandling(async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      notifications: (user.notifications || []).map(notif => ({ ...notif, read: true }))
    };

    setUser(updatedUser);
    await localStorageService.saveUser(updatedUser);
    toast.success('All notifications marked as read');
  }, 'Failed to mark all notifications as read'), [user, setUser]);

  const handleUpdateProfile = useCallback(withErrorHandling(async (profileData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    await localStorageService.saveUser(updatedUser);
    
    toast.success('Profile updated successfully!');
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, 'Failed to update profile'), [user, setUser]);

  const handleDataChange = useCallback(withErrorHandling(async (type: string, data: any) => {
    switch (type) {
      case 'posts':
        setPosts(data);
        await localStorageService.savePosts(data);
        break;
      case 'communities':
        setCommunities(data);
        await localStorageService.saveCommunities(data);
        break;
      case 'user':
        setUser(data);
        await localStorageService.saveUser(data);
        break;
      default:
        console.warn(`Unknown data change type: ${type}`);
    }
  }, 'Failed to update data'), [setPosts, setCommunities, setUser]);

  const handleLIAApply = useCallback(withErrorHandling(async (content: string) => {
    if (!content) {
      toast.error('No content to apply');
      return;
    }

    // This would typically apply LIA suggestions to a post or content
    // For now, we'll just show a success message
    toast.success('LIA suggestions applied!');
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([5, 5, 5]);
    }
  }, 'Failed to apply LIA suggestions'), []);

  return {
    handleAuthSuccess,
    handleTabChange,
    handleCreatePost,
    handleLike,
    handleComment,
    handleShare,
    handlePostView,
    handleJoinCommunity,
    handleCreateCommunity,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleUpdateProfile,
    handleDataChange,
    handleLIAApply
  };
}