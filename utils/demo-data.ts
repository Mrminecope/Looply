import type { User, Post, Community, Notification } from '../types/app';

// Generate mock user data
export function generateMockUserData(count: number = 10): User[] {
  const users: User[] = [];
  const avatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'https://images.unsplash.com/photo-1494790108755-2616b332c4e8?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  ];

  const names = [
    'Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis',
    'Carlos Rodriguez', 'Lily Zhang', 'David Kim', 'Sophie Miller',
    'James Thompson', 'Maya Patel', 'Ryan O\'Connor', 'Zoe Martinez',
    'Lucas Anderson', 'Isabella Garcia', 'Noah Brown', 'Ava Johnson'
  ];

  const usernames = [
    'alexj', 'sarahw', 'mikec', 'emmad', 'carlosr', 'lilyz', 'davidk', 'sophiem',
    'jamest', 'mayap', 'ryano', 'zoem', 'lucasa', 'isabellag', 'noahb', 'avaj'
  ];

  const bios = [
    '✨ Living life one moment at a time',
    '📸 Capturing the beautiful chaos',
    '🎨 Creative soul | Art enthusiast',
    '🌱 Plant mom | Sustainability advocate',
    '🏃‍♂️ Runner | Fitness enthusiast',
    '📚 Book lover | Coffee addict',
    '🎵 Music is my therapy',
    '🍳 Foodie | Home chef',
    '✈️ Travel addict | Adventure seeker',
    '💻 Tech enthusiast | Problem solver',
    '🎭 Theater kid at heart',
    '🏔️ Mountain lover | Hiker',
    '🎯 Goal setter | Dream chaser',
    '🌊 Ocean lover | Surfer',
    '🎪 Fun-loving | Life enjoyer',
    '🌟 Spreading positivity daily'
  ];

  for (let i = 0; i < Math.min(count, names.length); i++) {
    users.push({
      id: `user-${i + 1}`,
      name: names[i],
      username: usernames[i],
      email: `${usernames[i]}@example.com`,
      avatar: avatars[i % avatars.length],
      bio: bios[i % bios.length],
      followersCount: Math.floor(Math.random() * 5000) + 100,
      followingCount: Math.floor(Math.random() * 1000) + 50,
      postsCount: Math.floor(Math.random() * 200) + 10,
      isVerified: Math.random() > 0.7,
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA'][Math.floor(Math.random() * 5)],
      website: Math.random() > 0.6 ? `https://${usernames[i]}.com` : undefined,
      joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      notifications: [],
      joinedCommunities: [],
      preferences: {
        theme: 'light',
        notifications: {
          likes: true,
          comments: true,
          follows: true,
          mentions: true
        },
        privacy: {
          profileVisibility: 'public',
          postVisibility: 'public',
          messagePermissions: 'everyone'
        }
      }
    });
  }

  return users;
}

// Generate mock posts
export function generateMockPosts(count: number = 20): Post[] {
  const posts: Post[] = [];
  const users = generateMockUserData(8);
  
  const postContents = [
    "Just had the most amazing coffee at this little café downtown! ☕️ The atmosphere is perfect for working and the barista art is incredible. Definitely my new favorite spot! #CoffeeLife #LocalBusiness",
    "Sunset hikes never get old 🌅 There's something magical about watching the world slow down as the day ends. Grateful for moments like these that remind me to pause and appreciate the beauty around us.",
    "Finally finished reading 'The Seven Husbands of Evelyn Hugo' and WOW! 📚 I'm emotionally destroyed but in the best way possible. Already looking for my next book obsession. Any recommendations?",
    "Homemade pasta night was a success! 🍝 Nothing beats the satisfaction of making everything from scratch. The kitchen looks like a tornado hit it, but it was totally worth it. #HomeCooking #PastaLover",
    "Morning yoga session complete ✨ Starting the day with mindfulness and movement always sets the right tone. Today's intention: embrace whatever comes my way with grace and gratitude. #MorningRitual",
    "This little guy made my day! 🐕 Random dog encounters are the best kind of surprise. He was so friendly and just wanted all the pets. Dogs really are the purest souls on this planet.",
    "New art piece in progress! 🎨 Still figuring out the color palette but I'm loving the energy this one has. Art has a way of expressing what words can't capture. #ArtInProgress #CreativeProcess",
    "Concert last night was INCREDIBLE! 🎵 The energy in that room was electric. There's nothing quite like live music - it connects us all in the most beautiful way. Still buzzing from the experience!",
    "Weekend farmers market haul! 🥕🍅 Supporting local growers and getting the freshest ingredients. Tonight's dinner is going to be amazing with all these beautiful vegetables. #FarmToTable #SupportLocal",
    "Sometimes you need to take a step back and admire your progress 💪 Six months ago, this felt impossible. Now it's just another day. Consistency really is everything. #PersonalGrowth #KeepGoing"
  ];

  const images = [
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800'
  ];

  const videos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  ];

  const hashtags = [
    ['coffee', 'lifestyle', 'morning'],
    ['sunset', 'hiking', 'nature', 'gratitude'],
    ['books', 'reading', 'recommendations'],
    ['cooking', 'pasta', 'homemade', 'italian'],
    ['yoga', 'mindfulness', 'wellness'],
    ['dogs', 'pets', 'love', 'animals'],
    ['art', 'creative', 'painting', 'artist'],
    ['music', 'concert', 'live', 'energy'],
    ['food', 'farmersmarket', 'local', 'fresh'],
    ['fitness', 'progress', 'motivation', 'growth']
  ];

  const locations = [
    'Central Park, NY',
    'Santa Monica Pier, CA',
    'Millennium Park, Chicago',
    'Zilker Park, Austin',
    'Pike Place Market, Seattle',
    'Golden Gate Bridge, SF',
    'Times Square, NYC',
    'Hollywood Walk of Fame, LA'
  ];

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const hasMedia = Math.random() > 0.3;
    const isVideo = hasMedia && Math.random() > 0.7;
    
    posts.push({
      id: `post-${i + 1}`,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        verified: user.isVerified
      },
      content: postContents[i % postContents.length],
      image: hasMedia && !isVideo ? images[i % images.length] : null,
      video: hasMedia && isVideo ? videos[i % videos.length] : null,
      type: isVideo ? 'video' : hasMedia ? 'image' : 'text',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 1000) + 10,
      comments: Math.floor(Math.random() * 100) + 2,
      shares: Math.floor(Math.random() * 50) + 1,
      views: Math.floor(Math.random() * 5000) + 100,
      location: Math.random() > 0.6 ? locations[Math.floor(Math.random() * locations.length)] : null,
      hashtags: hashtags[i % hashtags.length],
      mentions: [],
      isLiked: Math.random() > 0.7,
      isSaved: Math.random() > 0.8,
      community: null,
      visibility: 'public',
      reactions: {
        like: Math.floor(Math.random() * 500) + 5,
        love: Math.floor(Math.random() * 200) + 2,
        laugh: Math.floor(Math.random() * 100) + 1,
        wow: Math.floor(Math.random() * 50) + 1,
        sad: Math.floor(Math.random() * 20),
        angry: Math.floor(Math.random() * 10)
      }
    });
  }

  return posts;
}

// Generate mock communities
export function generateMockCommunities(count: number = 10): Community[] {
  const communities: Community[] = [];
  
  const communityData = [
    {
      name: 'Photography Enthusiasts',
      description: 'A community for photography lovers to share tips, techniques, and stunning captures. From beginners to pros, everyone is welcome!',
      category: 'Photography',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
    },
    {
      name: 'Foodies Unite',
      description: 'Share your culinary adventures, recipes, and food discoveries. From home cooking to restaurant reviews, let\'s celebrate food together!',
      category: 'Food & Cooking',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'
    },
    {
      name: 'Fitness Journey',
      description: 'Motivate each other on our fitness journeys. Share workouts, progress pics, healthy recipes, and support fellow fitness enthusiasts.',
      category: 'Health & Fitness',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    },
    {
      name: 'Travel Adventures',
      description: 'Explore the world together! Share travel stories, hidden gems, travel tips, and inspire others to discover new destinations.',
      category: 'Travel',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    },
    {
      name: 'Book Club Central',
      description: 'For book lovers and avid readers. Discuss current reads, share recommendations, and dive deep into literary discussions.',
      category: 'Books & Literature',
      image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400'
    },
    {
      name: 'Creative Minds',
      description: 'A space for artists, designers, and creative professionals to showcase work, get feedback, and collaborate on projects.',
      category: 'Art & Design',
      image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400'
    },
    {
      name: 'Tech Talk',
      description: 'Discuss the latest in technology, programming, gadgets, and innovation. Share knowledge and stay updated with tech trends.',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400'
    },
    {
      name: 'Music Lovers',
      description: 'For music enthusiasts of all genres. Share discoveries, discuss artists, review albums, and connect through the power of music.',
      category: 'Music',
      image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400'
    },
    {
      name: 'Mindful Living',
      description: 'Focus on mental wellness, mindfulness practices, self-care tips, and creating a balanced, intentional lifestyle.',
      category: 'Wellness',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400'
    },
    {
      name: 'Pet Parents',
      description: 'Share adorable pet photos, training tips, funny pet stories, and connect with fellow pet lovers from around the world.',
      category: 'Pets & Animals',
      image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400'
    }
  ];

  for (let i = 0; i < Math.min(count, communityData.length); i++) {
    const data = communityData[i];
    communities.push({
      id: `community-${i + 1}`,
      name: data.name,
      description: data.description,
      image: data.image,
      members: Math.floor(Math.random() * 10000) + 500,
      posts: Math.floor(Math.random() * 1000) + 50,
      isJoined: Math.random() > 0.5,
      category: data.category,
      isPrivate: false,
      rules: [
        'Be respectful and kind to all members',
        'Stay on topic and relevant to the community',
        'No spam or self-promotion without permission',
        'Use appropriate language and content',
        'Help maintain a positive environment'
      ],
      moderators: [`user-${Math.floor(Math.random() * 5) + 1}`],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      tags: data.category.toLowerCase().split(' & ')
    });
  }

  return communities;
}

// Generate mock notifications
export function generateMockNotifications(count: number = 15): Notification[] {
  const notifications: Notification[] = [];
  const users = generateMockUserData(5);
  
  const notificationTypes = [
    'like', 'comment', 'follow', 'mention', 'community_join', 'post_share'
  ];

  const messages = {
    like: 'liked your post',
    comment: 'commented on your post',
    follow: 'started following you',
    mention: 'mentioned you in a post',
    community_join: 'joined your community',
    post_share: 'shared your post'
  };

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)] as keyof typeof messages;
    
    notifications.push({
      id: `notification-${i + 1}`,
      type,
      message: `${user.name} ${messages[type]}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: Math.random() > 0.4,
      actionUrl: `/post/post-${Math.floor(Math.random() * 20) + 1}`,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      }
    });
  }

  return notifications;
}

// Generate complete mock data set
export function generateCompleteDataSet() {
  const users = generateMockUserData(15);
  const posts = generateMockPosts(50);
  const communities = generateMockCommunities(8);
  const notifications = generateMockNotifications(20);

  return {
    users,
    posts,
    communities,
    notifications
  };
}

// Export individual data generators for specific use cases
export function generateSingleUser(index: number = 0): User {
  const users = generateMockUserData(1);
  return users[0];
}

export function generateSinglePost(authorIndex: number = 0): Post {
  const posts = generateMockPosts(1);
  return posts[0];
}

export function generateSingleCommunity(index: number = 0): Community {
  const communities = generateMockCommunities(1);
  return communities[0];
}

// Utility functions for mock data
export function getRandomUser(): User {
  const users = generateMockUserData(10);
  return users[Math.floor(Math.random() * users.length)];
}

export function getRandomPost(): Post {
  const posts = generateMockPosts(10);
  return posts[Math.floor(Math.random() * posts.length)];
}

export function getRandomCommunity(): Community {
  const communities = generateMockCommunities(5);
  return communities[Math.floor(Math.random() * communities.length)];
}

// Data filtering utilities
export function getPostsByUser(userId: string, posts: Post[]): Post[] {
  return posts.filter(post => post.author.id === userId);
}

export function getPostsByType(type: 'text' | 'image' | 'video', posts: Post[]): Post[] {
  return posts.filter(post => post.type === type);
}

export function getPostsWithMedia(posts: Post[]): Post[] {
  return posts.filter(post => post.type === 'image' || post.type === 'video');
}

export function getRecentPosts(posts: Post[], days: number = 7): Post[] {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return posts.filter(post => new Date(post.timestamp) > cutoff);
}

export function getTrendingPosts(posts: Post[]): Post[] {
  return posts
    .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
    .slice(0, 10);
}

// Export default for backward compatibility
export default {
  generateMockUserData,
  generateMockPosts,
  generateMockCommunities,
  generateMockNotifications,
  generateCompleteDataSet
};