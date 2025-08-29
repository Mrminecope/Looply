# Social Media App API Reference

This document describes the comprehensive API endpoints available in the social media application.

## Base URL
```
https://{projectId}.supabase.co/functions/v1/make-server-5a529b02
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

## API Endpoints

### Authentication

#### POST /api/v1/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "bio": "",
    "avatar": "",
    "followerCount": 0,
    "followingCount": 0,
    "postCount": 0,
    "verified": false,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/v1/auth/login
Authenticate a user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": { /* user object */ },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### Feed

#### GET /api/v1/feed
Get paginated feed with optional filters.

**Query Parameters:**
- `type` (optional): `home` | `community`
- `cursor` (optional): Pagination cursor
- `limit` (optional): Number of posts (default: 20)
- `community` (optional): Community ID for community feeds

**Example:**
```
GET /api/v1/feed?type=home&limit=10&cursor=post123
```

**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "authorId": "user_id",
      "author": {
        "id": "user_id",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "avatar_url",
        "verified": true
      },
      "content": "Post content here",
      "type": "text",
      "mediaUrl": "media_url",
      "videoId": "video_upload_id",
      "thumbnail": "thumbnail_url",
      "community": "community_id",
      "likes": 10,
      "comments": 5,
      "shares": 2,
      "views": 100,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "isLiked": false,
      "playbackData": {
        "playbackId": "video_playback_id",
        "hlsUrl": "hls_stream_url",
        "dashUrl": "dash_stream_url"
      }
    }
  ],
  "nextCursor": "next_post_id",
  "hasMore": true
}
```

### Posts

#### POST /api/v1/posts
Create a new post.

**Request Body:**
```json
{
  "content": "Post content",
  "type": "text",
  "mediaUrl": "optional_media_url",
  "community": "optional_community_id",
  "videoId": "optional_video_upload_id",
  "thumbnail": "optional_thumbnail_url"
}
```

**Response:**
```json
{
  "post": {
    "id": "post_id",
    "authorId": "user_id",
    "content": "Post content",
    "type": "text",
    "likes": 0,
    "comments": 0,
    "shares": 0,
    "views": 0,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/v1/posts/:id
Get a specific post with full details including video playback data.

**Response:**
```json
{
  "post": {
    "id": "post_id",
    "author": { /* author details */ },
    "content": "Post content",
    "isLiked": false,
    "playbackData": {
      "playbackId": "video_playback_id",
      "hlsUrl": "hls_stream_url",
      "dashUrl": "dash_stream_url"
    }
  }
}
```

#### POST /api/v1/posts/:id/like
Like or unlike a post.

**Response:**
```json
{
  "liked": true,
  "likes": 11
}
```

#### POST /api/v1/posts/:id/comment
Add a comment to a post.

**Request Body:**
```json
{
  "content": "Comment text"
}
```

**Response:**
```json
{
  "comment": {
    "id": "comment_id",
    "postId": "post_id",
    "authorId": "user_id",
    "author": { /* author details */ },
    "content": "Comment text",
    "likes": 0,
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "commentCount": 6
}
```

### Video Upload

#### POST /api/v1/videos/upload-url
Get a presigned URL for video upload.

**Request Body:**
```json
{
  "fileName": "video.mp4",
  "fileSize": 1048576,
  "contentType": "video/mp4"
}
```

**Response:**
```json
{
  "upload_url": "presigned_upload_url",
  "upload_id": "upload_unique_id",
  "filePath": "storage_path"
}
```

#### POST /api/v1/videos/complete
Mark video upload as complete (called by streaming provider or after processing).

**Request Body:**
```json
{
  "upload_id": "upload_unique_id",
  "playback_id": "video_playback_id",
  "hls_url": "hls_stream_url",
  "dash_url": "dash_stream_url",
  "thumbnail_url": "thumbnail_url",
  "duration": 120.5
}
```

**Response:**
```json
{
  "success": true
}
```

### Communities

#### POST /api/v1/communities
Create a new community.

**Request Body:**
```json
{
  "name": "Community Name",
  "description": "Community description",
  "category": "General",
  "isPrivate": false
}
```

**Response:**
```json
{
  "community": {
    "id": "community_id",
    "name": "Community Name",
    "description": "Community description",
    "category": "General",
    "creatorId": "user_id",
    "memberCount": 1,
    "postCount": 0,
    "isPrivate": false,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/v1/communities/:id/join
Join or leave a community.

**Response:**
```json
{
  "joined": true,
  "memberCount": 15
}
```

### Webhooks

#### POST /api/v1/webhooks/video-processed
Webhook endpoint for video processing provider callbacks.

**Request Body:**
```json
{
  "upload_id": "upload_unique_id",
  "status": "processed",
  "playback_id": "video_playback_id",
  "hls_url": "hls_stream_url",
  "dash_url": "dash_stream_url",
  "thumbnail_url": "thumbnail_url",
  "duration": 120.5,
  "error_message": "optional_error_if_failed"
}
```

**Response:**
```json
{
  "success": true
}
```

## Legacy Endpoints (Backward Compatibility)

These endpoints maintain backward compatibility with the existing frontend:

- `GET /posts/feed` - Legacy feed endpoint
- `POST /posts` - Legacy post creation
- `POST /posts/:id/like` - Legacy like endpoint
- `GET /communities` - Legacy communities list
- `POST /communities` - Legacy community creation
- `POST /communities/:id/join` - Legacy community join
- `GET /notifications` - Notifications
- `POST /upload/signed-url` - File upload URLs
- `POST /files/signed-url` - File download URLs

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are subject to rate limiting based on user authentication and endpoint type. Video upload endpoints have higher limits to accommodate large file uploads.

## Data Types

### Post Types
- `text` - Text-only post
- `image` - Image post with media URL
- `video` - Video post with video ID and playback data
- `reel` - Short-form video content
- `link` - Link preview post

### Notification Types
- `like` - Post liked
- `comment` - Comment on post
- `follow` - User followed
- `mention` - User mentioned
- `video_processed` - Video processing complete
- `video_failed` - Video processing failed
- `community_join` - User joined community

### Community Roles
- `admin` - Full permissions
- `moderator` - Moderation permissions
- `member` - Basic member permissions

## Frontend Integration

The frontend uses helper functions for easy API access:

```typescript
import { 
  AuthAPI, 
  FeedAPI, 
  PostsAPI, 
  VideoAPI, 
  CommunitiesAPI, 
  NotificationsAPI 
} from './utils/api';

// Examples
const { posts } = await FeedAPI.getHome();
const { post } = await PostsAPI.create({ content: "Hello world!" });
const { upload_url, upload_id } = await VideoAPI.getUploadUrl("video.mp4", 1024, "video/mp4");
```