import { User, Post, Community, Notification } from "../types";

export const mockUser: User = {
  name: "Alex Johnson",
  username: "alexj",
  bio: "Content creator, tech enthusiast, and coffee lover ☕️",
  avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  followers: 2847,
  following: 432,
  posts: 156,
  communities: ["Tech Reviews", "Photography", "Coffee Culture", "Travel Stories", "Fitness Journey"]
};

export const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    content: "Amazing sunset from my weekend hiking trip! Nature never fails to inspire me 🌅",
    image: "https://images.unsplash.com/photo-1617634667039-8e4cb277ab46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU1MjE4NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    type: "image",
    community: "Nature Photography",
    likes: 324,
    comments: 28,
    shares: 12,
    timestamp: "2h",
    isLiked: false
  },
  {
    id: "2",
    author: {
      name: "Mike Rodriguez",
      username: "mikecooks",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    content: "Just finished making this incredible pasta dish! Recipe in the comments 👇",
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwY29va2luZ3xlbnwxfHx8fDE3NTUzMTk4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    type: "image",
    community: "Cooking & Recipes",
    likes: 189,
    comments: 45,
    shares: 23,
    timestamp: "4h",
    isLiked: true
  },
  {
    id: "3",
    author: {
      name: "Tech Reviewer",
      username: "techrev",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    content: "Quick reel reviewing the latest smartphone features! Swipe up for full review.",
    video: "placeholder",
    type: "reel",
    community: "Tech Reviews",
    likes: 567,
    comments: 89,
    shares: 34,
    timestamp: "1d",
    isLiked: false
  }
];

export const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Nature Photography",
    description: "Share your best nature shots and photography tips with fellow nature lovers.",
    memberCount: 15420,
    postCount: 2847,
    coverImage: "https://images.unsplash.com/photo-1617634667039-8e4cb277ab46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU1MjE4NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isJoined: true,
    category: "Photography"
  },
  {
    id: "2",
    name: "Cooking & Recipes",
    description: "Delicious recipes, cooking tips, and culinary adventures from around the world.",
    memberCount: 28350,
    postCount: 5632,
    coverImage: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwY29va2luZ3xlbnwxfHx8fDE3NTUzMTk4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isJoined: false,
    category: "Food"
  },
  {
    id: "3",
    name: "Tech Reviews",
    description: "Latest gadget reviews, tech news, and discussions about emerging technologies.",
    memberCount: 42180,
    postCount: 8921,
    coverImage: "https://images.unsplash.com/photo-1646766360897-34c92cb6545a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZ2FkZ2V0c3xlbnwxfHx8fDE3NTUzMTk4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isJoined: true,
    category: "Technology"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    message: "liked your post about coffee brewing techniques.",
    timestamp: "5 minutes ago",
    isRead: false
  },
  {
    id: "2",
    type: "follow",
    user: {
      name: "David Park",
      username: "davidp",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    message: "started following you.",
    timestamp: "1 hour ago",
    isRead: false,
    actionRequired: true
  },
  {
    id: "3",
    type: "comment",
    user: {
      name: "Lisa Zhang",
      username: "lisaz",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlb3BsZSUyMGRpdmVyc2V8ZW58MXx8fHwxNzU1MzE5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    message: "commented on your travel photography.",
    timestamp: "3 hours ago",
    isRead: true
  }
];