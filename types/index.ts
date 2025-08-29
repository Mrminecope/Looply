export interface User {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  posts: number;
  communities: string[];
}

export interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  video?: string;
  type: 'text' | 'image' | 'video' | 'reel';
  community?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  coverImage: string;
  isJoined: boolean;
  category: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'community';
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
}