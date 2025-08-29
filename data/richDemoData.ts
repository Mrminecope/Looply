import type { User, Post, Community, Notification, Message } from '../types/app';

// Enhanced user profiles with random content for unverified users
export const demoUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarahchen',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    bio: '🎨 Digital Artist & Creator | 📍 San Francisco | ✨ Spreading creativity one post at a time',
    followers: 0, // Genuine users start with 0
    following: 0, // Genuine users start with 0
    verified: true,
    joinedAt: '2023-01-15',
    badges: ['creator', 'verified', 'early_adopter'],
    stats: {
      posts: 0, // Genuine users start with 0 posts
      likes: 0,
      comments: 0,
      shares: 0
    }
  },
  // Unverified users with random content
  {
    id: '2',
    name: 'Marcus Johnson',
    username: 'marcus_j',
    email: 'marcus@example.com',
    avatar: 'https://images.unsplash.com/photo-1656313826909-1f89d1702a81?w=150',
    bio: '🎵 Music Producer | 🎧 Electronic Beats | 🌊 Riding the sound waves',
    followers: 8900,
    following: 560,
    verified: false, // Unverified gets random content
    joinedAt: '2023-02-20',
    badges: ['creator'],
    stats: {
      posts: 89,
      likes: 23400,
      comments: 1560,
      shares: 670
    }
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    username: 'elena_fitness',
    email: 'elena@example.com',
    avatar: 'https://images.unsplash.com/photo-1572814392266-1620040c58be?w=150',
    bio: '💪 Fitness Coach | 🥗 Nutrition Expert | 🏃‍♀️ Marathon Runner | Helping you reach your goals!',
    followers: 15600,
    following: 420,
    verified: false, // Unverified gets random content
    joinedAt: '2023-01-08',
    badges: ['creator', 'fitness_expert'],
    stats: {
      posts: 234,
      likes: 67800,
      comments: 3450,
      shares: 1230
    }
  },
  {
    id: '4',
    name: 'Alex Thompson',
    username: 'alex_tech',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1694878982074-d8d4bc4581b9?w=150',
    bio: '👨‍💻 Software Engineer | 🚀 Tech Enthusiast | ☕ Coffee Addict | Building the future, one line at a time',
    followers: 6700,
    following: 890,
    verified: false, // Unverified gets random content
    joinedAt: '2023-03-12',
    badges: ['early_adopter'],
    stats: {
      posts: 67,
      likes: 12300,
      comments: 890,
      shares: 340
    }
  },
  {
    id: '5',
    name: 'Maya Patel',
    username: 'maya_food',
    email: 'maya@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: '👩‍🍳 Food Blogger | 🌶️ Spice Lover | 📸 Food Photography | Sharing flavors from around the world',
    followers: 11200,
    following: 780,
    verified: false, // Unverified gets random content
    joinedAt: '2023-02-01',
    badges: ['creator', 'food_expert'],
    stats: {
      posts: 189,
      likes: 34500,
      comments: 2890,
      shares: 1120
    }
  }
];

// Add more unverified users with random profile pictures
const additionalUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user_${i + 6}`,
  name: `User ${i + 6}`,
  username: `user${i + 6}`,
  email: `user${i + 6}@example.com`,
  avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 12345}?w=150&h=150&fit=crop&crop=face`,
  bio: `Bio for user ${i + 6}`,
  followers: Math.floor(Math.random() * 5000) + 100,
  following: Math.floor(Math.random() * 1000) + 50,
  verified: false, // All additional users are unverified
  joinedAt: '2023-03-15',
  badges: [],
  stats: {
    posts: Math.floor(Math.random() * 100) + 10,
    likes: Math.floor(Math.random() * 10000) + 500,
    comments: Math.floor(Math.random() * 1000) + 100,
    shares: Math.floor(Math.random() * 500) + 50
  }
}));

export const allUsers = [...demoUsers, ...additionalUsers];

// Rich demo posts content
const postContents = [
  // Art & Creativity
  "Just finished my latest digital painting! 🎨 Spent 12 hours on this piece exploring the intersection of nature and technology. What do you think? #DigitalArt #Nature #TechArt",
  "New tutorial dropping tomorrow! 🎬 Learn how to create stunning gradient effects in Photoshop. Can't wait to share these techniques with you all! #Tutorial #Photoshop #DesignTips",
  "Studio vibes today ✨ Working on a commission piece for a local gallery. The creative process is so therapeutic! #StudioLife #Art #Commission",
  
  // Music & Entertainment
  "New beat just dropped! 🎵 This one's got that summer vibe we all need right now. Link in bio to stream! #NewMusic #ElectronicMusic #SummerVibes",
  "Behind the scenes in the studio 🎧 Working with some amazing artists on an upcoming collaboration. The energy is incredible! #StudioLife #Collaboration #Music",
  "Live performance tonight at 8PM! 🎤 Can't wait to share new tracks with everyone. Who's joining the stream? #LivePerformance #Music #Tonight",
  
  // Fitness & Health
  "Morning workout complete! 💪 30-minute HIIT session to start the day right. Remember, consistency is key to reaching your fitness goals! #MorningWorkout #HIIT #FitnessMotivation",
  "Meal prep Sunday! 🥗 Preparing healthy, balanced meals for the week ahead. Nutrition is 80% of your fitness journey! #MealPrep #HealthyEating #Nutrition",
  "New PR today! 🏋️‍♀️ Finally hit that deadlift goal I've been working towards for months. Hard work pays off! #PersonalRecord #Deadlift #StrengthTraining",
  
  // Technology
  "Just deployed my latest React app! 🚀 Built with TypeScript and featuring real-time chat functionality. Open source on GitHub! #ReactJS #TypeScript #OpenSource",
  "AI is revolutionizing how we work ⚡ Just integrated GPT-4 into our workflow and productivity has increased by 40%! #AI #Productivity #Innovation",
  "Code review session with the team 👥 Love how collaborative our development process has become. Great minds think alike! #CodeReview #TeamWork #Development",
  
  // Food & Lifestyle
  "Homemade pasta from scratch! 🍝 Nothing beats the satisfaction of making your own noodles. Recipe coming to the blog tomorrow! #HomeCooking #Pasta #FoodBlog",
  "Street food adventure in Bangkok! 🌮 The flavors here are absolutely incredible. Every meal is a new discovery! #StreetFood #Bangkok #Foodie",
  "Coffee art practice ☕ Getting better at latte art one cup at a time. This rosetta pattern took me 20 tries! #CoffeeArt #Barista #Practice",
  
  // Travel & Adventure
  "Sunrise hike complete! 🌅 Nothing beats watching the world wake up from a mountain peak. Nature is the best therapy! #Hiking #Sunrise #NatureTherapy",
  "Road trip day 3! 🚗 Exploring hidden gems across the country. This little town has the most amazing local art scene! #RoadTrip #Travel #LocalArt",
  "Beach day perfection 🏖️ Crystal clear water and perfect weather. Sometimes you need to disconnect and recharge! #BeachDay #Relaxation #Recharge",
  
  // Personal Growth
  "Finished reading 'Atomic Habits' today 📚 Mind blown by how small changes can lead to remarkable results. Highly recommend! #BookRecommendation #PersonalGrowth #Habits",
  "Meditation streak: 30 days! 🧘‍♀️ Amazing how 10 minutes a day can transform your mindset and productivity. #Meditation #Mindfulness #30DayChallenge",
  "Learning Spanish for 6 months now 🇪🇸 Immersion apps really work! Finally had my first conversation with a native speaker today! #LanguageLearning #Spanish #Progress",
  
  // Fashion & Style
  "Thrift store finds! 👗 Sustainable fashion doesn't mean compromising on style. These vintage pieces are amazing! #ThriftFinds #SustainableFashion #Vintage",
  "DIY fashion project complete! ✂️ Upcycled an old jacket into something completely new. Creativity has no limits! #DIYFashion #Upcycling #Creative",
  "OOTD for the gallery opening tonight 🎨 Mixing classic and contemporary pieces for the perfect art-inspired look! #OOTD #Fashion #ArtGallery",
  
  // Gaming & Entertainment
  "New game release day! 🎮 Been waiting 2 years for this sequel. Time to dive into another world! #Gaming #NewRelease #VideoGames",
  "Streaming marathon tonight! 🎬 Binge-watching the entire series everyone's been talking about. No spoilers please! #Streaming #BingeWatch #Entertainment",
  "Board game night with friends! 🎲 Nothing beats good company and strategic gameplay. Classic games never get old! #BoardGames #FriendsNight #Strategy",
  
  // Business & Entrepreneurship
  "Startup milestone achieved! 🚀 Just hit our first 1000 users. Grateful for everyone who believed in our vision! #Startup #Milestone #Entrepreneurship",
  "Networking event insights 🤝 Met so many inspiring entrepreneurs today. The startup community is incredibly supportive! #Networking #StartupCommunity #Entrepreneurship",
  "Product launch in T-minus 7 days! ⏰ Team has been working around the clock. Excited to share what we've built! #ProductLaunch #TeamWork #Innovation",
  
  // Pets & Animals
  "My cat discovered my keyboard... again 🐱 Working from home challenges include feline supervisors who have strong opinions about my code! #CatsOfInstagram #WorkFromHome #PetLife",
  "Dog park adventures! 🐕 Watching puppies play is pure joy. Animals teach us so much about living in the moment! #DogPark #PuppyLove #Joy",
  "Rescued this little guy from the street 🐾 Sometimes the best things in life find you when you least expect them! #AnimalRescue #Compassion #NewFriend",
  
  // Science & Education
  "Fascinating astronomy lecture today! 🌌 The James Webb telescope images continue to blow my mind. Space is incredible! #Astronomy #JWST #Space",
  "Chemistry experiment success! ⚗️ Finally got the crystallization process right after 15 attempts. Persistence pays off in science! #Chemistry #Experiment #Science",
  "Teaching kids about renewable energy 🌱 Their curiosity and questions about solar panels were amazing. Future scientists in the making! #Education #RenewableEnergy #Teaching"
];

// Generate 100+ diverse posts
export const richDemoPosts: Post[] = Array.from({ length: 120 }, (_, i) => {
  const author = allUsers[Math.floor(Math.random() * allUsers.length)];
  const postTypes = ['text', 'image', 'video', 'reel'] as const;
  const type = postTypes[Math.floor(Math.random() * postTypes.length)];
  const content = postContents[Math.floor(Math.random() * postContents.length)];
  
  // Generate realistic engagement numbers
  const likes = Math.floor(Math.random() * 1000) + 10;
  const commentCount = Math.floor(Math.random() * 50) + 1;
  
  // Generate comments
  const comments = Array.from({ length: commentCount }, (_, j) => ({
    id: `comment_${i}_${j}`,
    content: [
      "This is amazing! 🔥",
      "Love this content!",
      "Thanks for sharing! 💫",
      "Incredible work! 👏",
      "So inspiring! ✨",
      "Can't wait to try this!",
      "Absolutely beautiful! 😍",
      "This made my day! 🌟",
      "Great post! 👌",
      "Amazing talent! 🎨"
    ][Math.floor(Math.random() * 10)],
    author: allUsers[Math.floor(Math.random() * allUsers.length)],
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    likes: Math.floor(Math.random() * 20),
    replies: []
  }));

  return {
    id: `post_${i + 1}`,
    content,
    author,
    type,
    image: type === 'image' || Math.random() > 0.7 ? `https://images.unsplash.com/photo-${1600000000000 + i}?w=500&h=600&fit=crop` : undefined,
    video: type === 'video' || type === 'reel' ? `https://example.com/video_${i}.mp4` : undefined,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    likes,
    comments,
    shares: Math.floor(Math.random() * 100) + 1,
    views: Math.floor(Math.random() * 5000) + 100,
    hashtags: [
      '#creativity', '#inspiration', '#art', '#music', '#fitness', '#food', '#tech', 
      '#travel', '#lifestyle', '#fashion', '#gaming', '#education', '#nature', '#design'
    ].slice(0, Math.floor(Math.random() * 4) + 1),
    mentions: [],
    location: Math.random() > 0.8 ? 'San Francisco, CA' : undefined,
    community: Math.random() > 0.6 ? ['Art & Design', 'Tech Hub', 'Fitness Community', 'Food Lovers', 'Music Makers'][Math.floor(Math.random() * 5)] : undefined,
    reactions: {
      '❤️': Math.floor(likes * 0.6),
      '😂': Math.floor(likes * 0.1),
      '🔥': Math.floor(likes * 0.15),
      '👏': Math.floor(likes * 0.1),
      '😮': Math.floor(likes * 0.05)
    }
  };
});

// Enhanced communities
export const richDemoCommunities: Community[] = [
  {
    id: '1',
    name: 'Art & Design',
    description: 'A creative space for artists, designers, and visual creators to share their work and get inspired.',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    members: 15600,
    posts: 1200,
    isJoined: true,
    category: 'Creative',
    tags: ['art', 'design', 'creativity', 'visual'],
    isPrivate: false,
    moderators: ['1', '2'],
    rules: [
      'Be respectful and constructive with feedback',
      'Share original work or give proper credit',
      'Help fellow artists grow and learn'
    ],
    stats: {
      activeMembers: 3400,
      dailyPosts: 45,
      weeklyGrowth: 12
    }
  },
  {
    id: '2',
    name: 'Tech Hub',
    description: 'Discussion space for developers, tech enthusiasts, and innovators. Share projects, get help, and stay updated.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    members: 12300,
    posts: 980,
    isJoined: true,
    category: 'Technology',
    tags: ['programming', 'tech', 'innovation', 'coding'],
    isPrivate: false,
    moderators: ['4'],
    rules: [
      'Keep discussions tech-related and constructive',
      'Share resources and help others learn',
      'No spam or self-promotion without value'
    ],
    stats: {
      activeMembers: 2800,
      dailyPosts: 38,
      weeklyGrowth: 8
    }
  },
  {
    id: '3',
    name: 'Fitness Community',
    description: 'Motivation, tips, and support for your fitness journey. Share workouts, progress, and healthy recipes.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    members: 18900,
    posts: 1560,
    isJoined: false,
    category: 'Health & Fitness',
    tags: ['fitness', 'health', 'workout', 'nutrition'],
    isPrivate: false,
    moderators: ['3'],
    rules: [
      'Support and encourage fellow members',
      'Share evidence-based fitness advice',
      'Respect different fitness levels and goals'
    ],
    stats: {
      activeMembers: 4200,
      dailyPosts: 52,
      weeklyGrowth: 15
    }
  },
  {
    id: '4',
    name: 'Food Lovers',
    description: 'Share recipes, food photography, restaurant reviews, and culinary adventures from around the world.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    members: 14500,
    posts: 2100,
    isJoined: true,
    category: 'Food & Cooking',
    tags: ['food', 'cooking', 'recipes', 'culinary'],
    isPrivate: false,
    moderators: ['5'],
    rules: [
      'Share original recipes or give proper credit',
      'Be respectful of different dietary choices',
      'Help others with cooking questions and tips'
    ],
    stats: {
      activeMembers: 3600,
      dailyPosts: 68,
      weeklyGrowth: 10
    }
  },
  {
    id: '5',
    name: 'Music Makers',
    description: 'Connect with musicians, producers, and music lovers. Share your tracks, get feedback, and collaborate.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    members: 9800,
    posts: 780,
    isJoined: false,
    category: 'Music & Audio',
    tags: ['music', 'production', 'audio', 'collaboration'],
    isPrivate: false,
    moderators: ['2'],
    rules: [
      'Share original music or provide proper attribution',
      'Give constructive feedback to fellow musicians',
      'Respect all genres and styles of music'
    ],
    stats: {
      activeMembers: 2100,
      dailyPosts: 28,
      weeklyGrowth: 6
    }
  }
];

// Rich notifications
export const richDemoNotifications: Notification[] = Array.from({ length: 25 }, (_, i) => {
  const types = ['like', 'comment', 'follow', 'mention', 'community', 'system'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  const fromUser = allUsers[Math.floor(Math.random() * allUsers.length)];
  
  const notificationMessages = {
    like: `${fromUser.name} liked your post`,
    comment: `${fromUser.name} commented on your post`,
    follow: `${fromUser.name} started following you`,
    mention: `${fromUser.name} mentioned you in a post`,
    community: `New post in ${richDemoCommunities[Math.floor(Math.random() * richDemoCommunities.length)].name}`,
    system: 'Welcome to SocialFlow! Complete your profile to get started.'
  };

  return {
    id: `notification_${i + 1}`,
    type,
    message: notificationMessages[type],
    fromUser: type !== 'system' ? fromUser : undefined,
    postId: type === 'like' || type === 'comment' ? `post_${Math.floor(Math.random() * 120) + 1}` : undefined,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    read: Math.random() > 0.3,
    actionUrl: '/'
  };
});

// Direct Messages data
export const richDemoMessages: Message[] = Array.from({ length: 50 }, (_, i) => {
  const fromUser = allUsers[Math.floor(Math.random() * allUsers.length)];
  const toUser = allUsers[Math.floor(Math.random() * allUsers.length)];
  
  const messageContents = [
    "Hey! Loved your latest post 😊",
    "Are you available for a collaboration?",
    "Thanks for the follow!",
    "Your art style is incredible! Any tips for beginners?",
    "Would love to feature your work on our community page",
    "The recipe you shared was amazing! Made it last night 🍝",
    "Congrats on reaching 10k followers! 🎉",
    "Saw your story about the art exhibition. How was it?",
    "Do you have any recommendations for design tools?",
    "Your workout routine inspired me to get back to the gym! 💪",
    "The music track you shared is on repeat! 🎵",
    "Would love to connect and maybe work together sometime",
    "Your travel photos are stunning! What camera do you use?",
    "Just wanted to say your content always brightens my day ✨",
    "Are you going to the tech conference next month?"
  ];

  return {
    id: `message_${i + 1}`,
    conversationId: `conv_${Math.floor(i / 3) + 1}`,
    content: messageContents[Math.floor(Math.random() * messageContents.length)],
    senderId: fromUser.id,
    receiverId: toUser.id,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    read: Math.random() > 0.4,
    type: 'text',
    reactions: Math.random() > 0.8 ? ['❤️'] : []
  };
});

// Trending hashtags based on post content
export const trendingHashtags = [
  { tag: '#art', count: 1240, growth: '+15%' },
  { tag: '#fitness', count: 980, growth: '+23%' },
  { tag: '#food', count: 890, growth: '+8%' },
  { tag: '#tech', count: 750, growth: '+31%' },
  { tag: '#music', count: 680, growth: '+12%' },
  { tag: '#travel', count: 620, growth: '+18%' },
  { tag: '#lifestyle', count: 580, growth: '+6%' },
  { tag: '#design', count: 520, growth: '+25%' },
  { tag: '#creativity', count: 480, growth: '+19%' },
  { tag: '#inspiration', count: 420, growth: '+14%' }
];

// Export all data
export const richDemoData = {
  users: allUsers,
  posts: richDemoPosts,
  communities: richDemoCommunities,
  notifications: richDemoNotifications,
  messages: richDemoMessages,
  trendingHashtags
};