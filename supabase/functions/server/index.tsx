import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS and logging middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Create storage buckets on startup
async function initializeStorage() {
  const buckets = [
    'make-5a529b02-avatars',
    'make-5a529b02-posts',
    'make-5a529b02-videos',
    'make-5a529b02-thumbnails'
  ];

  for (const bucketName of buckets) {
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, { public: false });
      if (error) {
        console.log(`Error creating bucket ${bucketName}:`, error);
      } else {
        console.log(`Created bucket: ${bucketName}`);
      }
    }
  }
}

// Initialize on startup
initializeStorage();

// Helper function to verify user authentication
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization header' };
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }

  return { user, error: null };
}

// Auth routes

// POST /api/v1/auth/login — returns JWT
app.post('/make-server-5a529b02/api/v1/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);
    
    return c.json({ 
      user: userData,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// POST /api/v1/auth/signup — create user
app.post('/make-server-5a529b02/api/v1/auth/signup', async (c) => {
  try {
    const { email, password, name, username } = await c.req.json();

    // Check if username already exists
    const existingUserId = await kv.get(`username:${username}`);
    if (existingUserId) {
      return c.json({ error: 'Username already taken' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, username },
      // Automatically confirm email since email server isn't configured
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    const userData = {
      id: data.user.id,
      email,
      name,
      username,
      bio: '',
      avatar: '',
      location: '',
      links: [],
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      verified: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user.id}`, userData);
    await kv.set(`username:${username}`, data.user.id);

    return c.json({ user: userData });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

app.post('/make-server-5a529b02/auth/signup', async (c) => {
  try {
    const { email, password, name, username } = await c.req.json();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, username },
      // Automatically confirm email since email server isn't configured
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    const userData = {
      id: data.user.id,
      email,
      name,
      username,
      bio: '',
      avatar: '',
      links: [],
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      verified: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user.id}`, userData);
    await kv.set(`username:${username}`, data.user.id);

    return c.json({ user: userData });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Feed routes

// GET /api/v1/feed?type=home|community&cursor=... — paginated feed
app.get('/make-server-5a529b02/api/v1/feed', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req);
    
    const feedType = c.req.query('type') || 'home';
    const cursor = c.req.query('cursor');
    const limit = parseInt(c.req.query('limit') || '20');
    const community = c.req.query('community');

    let posts = await kv.getByPrefix('post:');
    posts = posts.filter(post => !post.isDeleted);
    
    // Filter by community if specified
    if (feedType === 'community' && community) {
      posts = posts.filter(post => post.community === community);
    }
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Handle pagination with cursor
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = posts.findIndex(post => post.id === cursor);
      if (cursorIndex > -1) {
        startIndex = cursorIndex + 1;
      }
    }
    
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);
    const nextCursor = paginatedPosts.length === limit ? paginatedPosts[paginatedPosts.length - 1].id : null;
    
    // Get user data and like status for each post
    const postsWithDetails = await Promise.all(
      paginatedPosts.map(async (post) => {
        const author = await kv.get(`user:${post.authorId}`);
        let isLiked = false;
        
        if (user) {
          const likeKey = `like:${post.id}:${user.id}`;
          const existingLike = await kv.get(likeKey);
          isLiked = !!existingLike;
        }
        
        return { ...post, author, isLiked };
      })
    );

    return c.json({ 
      posts: postsWithDetails, 
      nextCursor,
      hasMore: !!nextCursor
    });
  } catch (error) {
    console.log('Feed error:', error);
    return c.json({ error: 'Failed to load feed' }, 500);
  }
});

// Posts routes

// POST /api/v1/posts — create post (link video id after upload)
app.post('/make-server-5a529b02/api/v1/posts', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const { content, type, mediaUrl, community, videoId, thumbnail } = await c.req.json();
    
    const postId = `post:${Date.now()}:${user.id}`;
    const post = {
      id: postId,
      authorId: user.id,
      content,
      type: type || 'text',
      mediaUrl,
      videoId, // For linking to processed video
      thumbnail,
      community,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    await kv.set(postId, post);
    
    // Update user post count
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.postCount = (userData.postCount || 0) + 1;
      userData.updatedAt = new Date().toISOString();
      await kv.set(`user:${user.id}`, userData);
    }

    // Update community post count if applicable
    if (community) {
      const communityData = await kv.get(community);
      if (communityData) {
        communityData.postCount = (communityData.postCount || 0) + 1;
        await kv.set(community, communityData);
      }
    }

    return c.json({ post });
  } catch (error) {
    console.log('Create post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// GET /api/v1/posts/:id — post detail (includes playback id for video)
app.get('/make-server-5a529b02/api/v1/posts/:id', async (c) => {
  try {
    const postId = c.req.param('id');
    const { user } = await verifyAuth(c.req);
    
    const post = await kv.get(postId);
    if (!post || post.isDeleted) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Get author data
    const author = await kv.get(`user:${post.authorId}`);
    
    // Check if user liked the post
    let isLiked = false;
    if (user) {
      const likeKey = `like:${postId}:${user.id}`;
      const existingLike = await kv.get(likeKey);
      isLiked = !!existingLike;
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await kv.set(postId, post);

    // Get video playback details if it's a video post
    let playbackData = null;
    if (post.type === 'video' && post.videoId) {
      const videoData = await kv.get(`video:${post.videoId}`);
      if (videoData && videoData.status === 'processed') {
        playbackData = {
          playbackId: videoData.playbackId,
          hlsUrl: videoData.hlsUrl,
          dashUrl: videoData.dashUrl
        };
      }
    }

    return c.json({ 
      post: { ...post, author, isLiked, playbackData }
    });
  } catch (error) {
    console.log('Get post error:', error);
    return c.json({ error: 'Failed to get post' }, 500);
  }
});

// POST /api/v1/posts/:id/like — like/unlike
app.post('/make-server-5a529b02/api/v1/posts/:id/like', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const postId = c.req.param('id');
    const likeKey = `like:${postId}:${user.id}`;
    
    const existingLike = await kv.get(likeKey);
    const post = await kv.get(postId);
    
    if (!post || post.isDeleted) {
      return c.json({ error: 'Post not found' }, 404);
    }

    if (existingLike) {
      // Unlike
      await kv.del(likeKey);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      await kv.set(likeKey, { 
        userId: user.id, 
        postId, 
        createdAt: new Date().toISOString() 
      });
      post.likes = (post.likes || 0) + 1;
      
      // Create notification for post author
      if (post.authorId !== user.id) {
        const notificationId = `notification:${Date.now()}:${post.authorId}`;
        const notification = {
          id: notificationId,
          userId: post.authorId,
          type: 'like',
          fromUserId: user.id,
          postId,
          read: false,
          createdAt: new Date().toISOString()
        };
        await kv.set(notificationId, notification);
      }
    }

    await kv.set(postId, post);
    return c.json({ liked: !existingLike, likes: post.likes });
  } catch (error) {
    console.log('Like error:', error);
    return c.json({ error: 'Like action failed' }, 500);
  }
});

// POST /api/v1/posts/:id/comment — comment
app.post('/make-server-5a529b02/api/v1/posts/:id/comment', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const postId = c.req.param('id');
    const { content } = await c.req.json();
    
    const post = await kv.get(postId);
    if (!post || post.isDeleted) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const commentId = `comment:${Date.now()}:${user.id}`;
    const comment = {
      id: commentId,
      postId,
      authorId: user.id,
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    await kv.set(commentId, comment);
    
    // Update post comment count
    post.comments = (post.comments || 0) + 1;
    await kv.set(postId, post);

    // Create notification for post author
    if (post.authorId !== user.id) {
      const notificationId = `notification:${Date.now()}:${post.authorId}`;
      const notification = {
        id: notificationId,
        userId: post.authorId,
        type: 'comment',
        fromUserId: user.id,
        postId,
        commentId,
        read: false,
        createdAt: new Date().toISOString()
      };
      await kv.set(notificationId, notification);
    }

    // Get author data for response
    const author = await kv.get(`user:${user.id}`);
    
    return c.json({ 
      comment: { ...comment, author },
      commentCount: post.comments
    });
  } catch (error) {
    console.log('Comment error:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// GET /api/v1/posts/:id/comments — get comments for a post
app.get('/make-server-5a529b02/api/v1/posts/:id/comments', async (c) => {
  try {
    const postId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '20');
    const cursor = c.req.query('cursor');

    const post = await kv.get(postId);
    if (!post || post.isDeleted) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Get all comments for the post
    const allComments = await kv.getByPrefix('comment:');
    let postComments = allComments
      .filter(comment => comment.postId === postId && !comment.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Handle pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = postComments.findIndex(comment => comment.id === cursor);
      if (cursorIndex > -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedComments = postComments.slice(startIndex, startIndex + limit);
    const nextCursor = paginatedComments.length === limit ? paginatedComments[paginatedComments.length - 1].id : null;

    // Get author data for each comment
    const commentsWithAuthors = await Promise.all(
      paginatedComments.map(async (comment) => {
        const author = await kv.get(`user:${comment.authorId}`);
        return { ...comment, author };
      })
    );

    return c.json({
      comments: commentsWithAuthors,
      nextCursor,
      hasMore: !!nextCursor,
      totalCount: postComments.length
    });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: 'Failed to get comments' }, 500);
  }
});

// DELETE /api/v1/posts/:id — delete a post
app.delete('/make-server-5a529b02/api/v1/posts/:id', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const postId = c.req.param('id');
    const post = await kv.get(postId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Check if user owns the post
    if (post.authorId !== user.id) {
      return c.json({ error: 'Not authorized to delete this post' }, 403);
    }

    // Mark post as deleted instead of actually deleting
    post.isDeleted = true;
    post.deletedAt = new Date().toISOString();
    await kv.set(postId, post);

    // Update user post count
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.postCount = Math.max(0, (userData.postCount || 0) - 1);
      userData.updatedAt = new Date().toISOString();
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

// Video routes

// POST /api/v1/videos/upload-url — get presigned upload URL (returns upload_url, upload_id)
app.post('/make-server-5a529b02/api/v1/videos/upload-url', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const { fileName, fileSize, contentType } = await c.req.json();
    
    const uploadId = `upload:${Date.now()}:${user.id}`;
    const bucketName = 'make-5a529b02-videos';
    const filePath = `${user.id}/${uploadId}-${fileName}`;

    // Create signed upload URL
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.log('Upload URL error:', uploadError);
      return c.json({ error: 'Failed to create upload URL' }, 500);
    }

    // Store upload metadata
    const uploadData = {
      id: uploadId,
      userId: user.id,
      fileName,
      fileSize,
      contentType,
      filePath,
      bucket: bucketName,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(`video:${uploadId}`, uploadData);

    return c.json({ 
      upload_url: data.signedUrl,
      upload_id: uploadId,
      filePath
    });
  } catch (error) {
    console.log('Video upload URL generation error:', error);
    return c.json({ error: 'Failed to generate upload URL' }, 500);
  }
});

// POST /api/v1/videos/complete — mark upload done (called by streaming provider)
app.post('/make-server-5a529b02/api/v1/videos/complete', async (c) => {
  try {
    const { upload_id, playback_id, hls_url, dash_url, thumbnail_url, duration } = await c.req.json();
    
    const videoData = await kv.get(`video:${upload_id}`);
    if (!videoData) {
      return c.json({ error: 'Upload not found' }, 404);
    }

    // Update video data with processing results
    const updatedVideoData = {
      ...videoData,
      status: 'processed',
      playbackId: playback_id,
      hlsUrl: hls_url,
      dashUrl: dash_url,
      thumbnailUrl: thumbnail_url,
      duration,
      processedAt: new Date().toISOString()
    };

    await kv.set(`video:${upload_id}`, updatedVideoData);

    // Create notification for user that their video is ready
    const notificationId = `notification:${Date.now()}:${videoData.userId}`;
    const notification = {
      id: notificationId,
      userId: videoData.userId,
      type: 'video_processed',
      videoId: upload_id,
      read: false,
      createdAt: new Date().toISOString()
    };
    await kv.set(notificationId, notification);

    return c.json({ success: true });
  } catch (error) {
    console.log('Video complete error:', error);
    return c.json({ error: 'Failed to mark video as complete' }, 500);
  }
});

// Communities routes

// POST /api/v1/communities — create community
app.post('/make-server-5a529b02/api/v1/communities', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const { name, description, category, isPrivate } = await c.req.json();
    
    const communityId = `community:${Date.now()}:${user.id}`;
    const community = {
      id: communityId,
      name,
      description,
      category: category || 'General',
      creatorId: user.id,
      memberCount: 1,
      postCount: 0,
      isPrivate: isPrivate || false,
      createdAt: new Date().toISOString()
    };

    await kv.set(communityId, community);
    
    // Add creator as first member with admin role
    const membershipKey = `membership:${communityId}:${user.id}`;
    await kv.set(membershipKey, {
      userId: user.id,
      communityId,
      role: 'admin',
      joinedAt: new Date().toISOString()
    });

    return c.json({ community });
  } catch (error) {
    console.log('Create community error:', error);
    return c.json({ error: 'Failed to create community' }, 500);
  }
});

// POST /api/v1/communities/:id/join — join community
app.post('/make-server-5a529b02/api/v1/communities/:id/join', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const communityId = c.req.param('id');
    const membershipKey = `membership:${communityId}:${user.id}`;
    
    const existingMembership = await kv.get(membershipKey);
    const community = await kv.get(communityId);
    
    if (!community) {
      return c.json({ error: 'Community not found' }, 404);
    }

    if (existingMembership) {
      // Leave community (only if not the creator)
      if (community.creatorId === user.id) {
        return c.json({ error: 'Cannot leave community you created' }, 400);
      }
      
      await kv.del(membershipKey);
      community.memberCount = Math.max(0, community.memberCount - 1);
    } else {
      // Join community
      await kv.set(membershipKey, {
        userId: user.id,
        communityId,
        role: 'member',
        joinedAt: new Date().toISOString()
      });
      community.memberCount = (community.memberCount || 0) + 1;
      
      // Create notification for community creator
      const notificationId = `notification:${Date.now()}:${community.creatorId}`;
      const notification = {
        id: notificationId,
        userId: community.creatorId,
        type: 'community_join',
        fromUserId: user.id,
        communityId,
        read: false,
        createdAt: new Date().toISOString()
      };
      await kv.set(notificationId, notification);
    }

    await kv.set(communityId, community);
    return c.json({ 
      joined: !existingMembership, 
      memberCount: community.memberCount 
    });
  } catch (error) {
    console.log('Community join error:', error);
    return c.json({ error: 'Join action failed' }, 500);
  }
});

// Webhook routes

// POST /api/v1/webhooks/video-processed — webhook endpoint for provider callbacks
app.post('/make-server-5a529b02/api/v1/webhooks/video-processed', async (c) => {
  try {
    // Verify webhook signature if needed (implement based on video provider)
    const webhookData = await c.req.json();
    
    const { 
      upload_id, 
      status, 
      playback_id, 
      hls_url, 
      dash_url, 
      thumbnail_url, 
      duration,
      error_message 
    } = webhookData;

    const videoData = await kv.get(`video:${upload_id}`);
    if (!videoData) {
      console.log('Webhook received for unknown upload:', upload_id);
      return c.json({ error: 'Upload not found' }, 404);
    }

    // Update video processing status
    const updatedVideoData = {
      ...videoData,
      status,
      processedAt: new Date().toISOString()
    };

    if (status === 'processed') {
      updatedVideoData.playbackId = playback_id;
      updatedVideoData.hlsUrl = hls_url;
      updatedVideoData.dashUrl = dash_url;
      updatedVideoData.thumbnailUrl = thumbnail_url;
      updatedVideoData.duration = duration;
    } else if (status === 'failed') {
      updatedVideoData.errorMessage = error_message;
    }

    await kv.set(`video:${upload_id}`, updatedVideoData);

    // Create notification for user
    const notificationId = `notification:${Date.now()}:${videoData.userId}`;
    const notification = {
      id: notificationId,
      userId: videoData.userId,
      type: status === 'processed' ? 'video_processed' : 'video_failed',
      videoId: upload_id,
      read: false,
      createdAt: new Date().toISOString()
    };
    await kv.set(notificationId, notification);

    console.log(`Video ${upload_id} processing ${status}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Video webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// User profile routes
app.get('/make-server-5a529b02/users/me', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  const userData = await kv.get(`user:${user.id}`);
  return c.json({ user: userData });
});

app.put('/make-server-5a529b02/users/me', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const updates = await c.req.json();
    const currentData = await kv.get(`user:${user.id}`) || {};
    
    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedData);
    return c.json({ user: updatedData });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Update failed' }, 500);
  }
});

// GET /api/v1/users/:id — get user profile
app.get('/make-server-5a529b02/api/v1/users/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const userData = await kv.get(`user:${userId}`);

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Don't return sensitive information
    const { email, ...publicUserData } = userData;
    
    return c.json({ user: publicUserData });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// GET /api/v1/users/:id/posts — get user's posts
app.get('/make-server-5a529b02/api/v1/users/:id/posts', async (c) => {
  try {
    const userId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '20');
    const cursor = c.req.query('cursor');

    const allPosts = await kv.getByPrefix('post:');
    let userPosts = allPosts
      .filter(post => post.authorId === userId && !post.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Handle pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = userPosts.findIndex(post => post.id === cursor);
      if (cursorIndex > -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedPosts = userPosts.slice(startIndex, startIndex + limit);
    const nextCursor = paginatedPosts.length === limit ? paginatedPosts[paginatedPosts.length - 1].id : null;

    // Get author data
    const userData = await kv.get(`user:${userId}`);
    const postsWithAuthor = paginatedPosts.map(post => ({
      ...post,
      author: userData
    }));

    return c.json({
      posts: postsWithAuthor,
      nextCursor,
      hasMore: !!nextCursor
    });
  } catch (error) {
    console.log('Get user posts error:', error);
    return c.json({ error: 'Failed to get user posts' }, 500);
  }
});

// POST /api/v1/users/:id/follow — follow/unfollow user
app.post('/make-server-5a529b02/api/v1/users/:id/follow', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const targetUserId = c.req.param('id');
    
    if (targetUserId === user.id) {
      return c.json({ error: 'Cannot follow yourself' }, 400);
    }

    const targetUser = await kv.get(`user:${targetUserId}`);
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const followKey = `follow:${user.id}:${targetUserId}`;
    const existingFollow = await kv.get(followKey);

    if (existingFollow) {
      // Unfollow
      await kv.del(followKey);
      
      // Update follower/following counts
      const currentUser = await kv.get(`user:${user.id}`);
      if (currentUser) {
        currentUser.followingCount = Math.max(0, (currentUser.followingCount || 0) - 1);
        await kv.set(`user:${user.id}`, currentUser);
      }
      
      targetUser.followerCount = Math.max(0, (targetUser.followerCount || 0) - 1);
      await kv.set(`user:${targetUserId}`, targetUser);
    } else {
      // Follow
      await kv.set(followKey, {
        followerId: user.id,
        followeeId: targetUserId,
        createdAt: new Date().toISOString()
      });
      
      // Update follower/following counts
      const currentUser = await kv.get(`user:${user.id}`);
      if (currentUser) {
        currentUser.followingCount = (currentUser.followingCount || 0) + 1;
        await kv.set(`user:${user.id}`, currentUser);
      }
      
      targetUser.followerCount = (targetUser.followerCount || 0) + 1;
      await kv.set(`user:${targetUserId}`, targetUser);

      // Create notification
      const notificationId = `notification:${Date.now()}:${targetUserId}`;
      const notification = {
        id: notificationId,
        userId: targetUserId,
        type: 'follow',
        fromUserId: user.id,
        read: false,
        createdAt: new Date().toISOString()
      };
      await kv.set(notificationId, notification);
    }

    return c.json({
      following: !existingFollow,
      followerCount: targetUser.followerCount
    });
  } catch (error) {
    console.log('Follow user error:', error);
    return c.json({ error: 'Follow action failed' }, 500);
  }
});

// GET /api/v1/search — search posts, users, communities
app.get('/make-server-5a529b02/api/v1/search', async (c) => {
  try {
    const query = c.req.query('q');
    const type = c.req.query('type') || 'all'; // all, posts, users, communities
    const limit = parseInt(c.req.query('limit') || '20');

    if (!query || query.length < 2) {
      return c.json({ error: 'Query must be at least 2 characters' }, 400);
    }

    const results: any = {};

    if (type === 'all' || type === 'posts') {
      const posts = await kv.getByPrefix('post:');
      const matchingPosts = posts
        .filter(post => 
          !post.isDeleted && 
          post.content.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      // Get author data for posts
      const postsWithAuthors = await Promise.all(
        matchingPosts.map(async (post) => {
          const author = await kv.get(`user:${post.authorId}`);
          return { ...post, author };
        })
      );

      results.posts = postsWithAuthors;
    }

    if (type === 'all' || type === 'users') {
      const users = await kv.getByPrefix('user:');
      const matchingUsers = users
        .filter(user =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)
        .map(user => {
          const { email, ...publicUser } = user;
          return publicUser;
        });

      results.users = matchingUsers;
    }

    if (type === 'all' || type === 'communities') {
      const communities = await kv.getByPrefix('community:');
      const matchingCommunities = communities
        .filter(community =>
          community.name.toLowerCase().includes(query.toLowerCase()) ||
          community.description.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);

      results.communities = matchingCommunities;
    }

    return c.json(results);
  } catch (error) {
    console.log('Search error:', error);
    return c.json({ error: 'Search failed' }, 500);
  }
});

// Notifications route
app.get('/make-server-5a529b02/notifications', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const notifications = await kv.getByPrefix(`notification:`);
    const userNotifications = notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    // Get user data for notifications
    const notificationsWithUsers = await Promise.all(
      userNotifications.map(async (notification) => {
        const fromUser = await kv.get(`user:${notification.fromUserId}`);
        return { ...notification, fromUser };
      })
    );

    return c.json({ notifications: notificationsWithUsers });
  } catch (error) {
    console.log('Notifications error:', error);
    return c.json({ error: 'Failed to load notifications' }, 500);
  }
});

// POST /api/v1/notifications/:id/read — mark notification as read
app.post('/make-server-5a529b02/api/v1/notifications/:id/read', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const notificationId = c.req.param('id');
    const notification = await kv.get(notificationId);

    if (!notification || notification.userId !== user.id) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    notification.read = true;
    notification.readAt = new Date().toISOString();
    await kv.set(notificationId, notification);

    return c.json({ success: true });
  } catch (error) {
    console.log('Mark notification read error:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// POST /api/v1/notifications/read-all — mark all notifications as read
app.post('/make-server-5a529b02/api/v1/notifications/read-all', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const notifications = await kv.getByPrefix('notification:');
    const userNotifications = notifications.filter(n => n.userId === user.id && !n.read);

    // Mark all as read
    await Promise.all(
      userNotifications.map(async (notification) => {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        await kv.set(notification.id, notification);
      })
    );

    return c.json({ 
      success: true, 
      markedCount: userNotifications.length 
    });
  } catch (error) {
    console.log('Mark all notifications read error:', error);
    return c.json({ error: 'Failed to mark notifications as read' }, 500);
  }
});

// File upload URL generation
app.post('/make-server-5a529b02/upload/signed-url', async (c) => {
  const { user, error } = await verifyAuth(c.req);
  if (!user) {
    return c.json({ error }, 401);
  }

  try {
    const { fileName, fileType, bucket } = await c.req.json();
    
    const validBuckets = ['avatars', 'posts', 'videos', 'thumbnails'];
    if (!validBuckets.includes(bucket)) {
      return c.json({ error: 'Invalid bucket' }, 400);
    }

    const bucketName = `make-5a529b02-${bucket}`;
    const filePath = `${user.id}/${Date.now()}-${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.log('Upload URL error:', uploadError);
      return c.json({ error: 'Failed to create upload URL' }, 500);
    }

    return c.json({ 
      uploadUrl: data.signedUrl,
      filePath,
      bucket: bucketName
    });
  } catch (error) {
    console.log('Upload URL generation error:', error);
    return c.json({ error: 'Failed to generate upload URL' }, 500);
  }
});

// Get signed download URL
app.post('/make-server-5a529b02/files/signed-url', async (c) => {
  try {
    const { bucket, filePath } = await c.req.json();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.log('Download URL error:', error);
      return c.json({ error: 'Failed to create download URL' }, 500);
    }

    return c.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.log('Download URL generation error:', error);
    return c.json({ error: 'Failed to generate download URL' }, 500);
  }
});

// Analytics tracking
app.post('/make-server-5a529b02/analytics/view', async (c) => {
  try {
    const { postId, type } = await c.req.json();
    
    if (postId) {
      const post = await kv.get(postId);
      if (post) {
        post.views = (post.views || 0) + 1;
        await kv.set(postId, post);
      }
    }

    // Track in analytics
    const analyticsKey = `analytics:${type}:${new Date().toISOString().split('T')[0]}`;
    const currentCount = await kv.get(analyticsKey) || 0;
    await kv.set(analyticsKey, currentCount + 1);

    return c.json({ success: true });
  } catch (error) {
    console.log('Analytics error:', error);
    return c.json({ error: 'Analytics tracking failed' }, 500);
  }
});

// Health check
app.get('/make-server-5a529b02/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
Deno.serve(app.fetch);