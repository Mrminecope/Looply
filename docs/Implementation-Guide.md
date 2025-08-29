# Backend Implementation Guide

## 🚀 Quick Start: NestJS Backend Setup

### **Prerequisites**
```bash
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### **1. Create NestJS Project**
```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Create new project
nest new social-media-backend
cd social-media-backend

# Install essential dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install @prisma/client prisma
npm install passport passport-jwt passport-local
npm install bcryptjs class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
```

### **2. Database Setup with Prisma**
```bash
# Initialize Prisma
npx prisma init

# Install PostgreSQL (Docker recommended)
docker run --name postgres-social \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=social_media \
  -p 5432:5432 \
  -d postgres:15
```

**Create `prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  name      String
  bio       String?
  avatar    String?
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  likes     Like[]
  comments  Comment[]
  followers Follow[] @relation("UserFollows")
  following Follow[] @relation("FollowUser")
  communities CommunityMember[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  content   String
  type      PostType @default(TEXT)
  image     String?
  video     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  communityId String?
  community   Community? @relation(fields: [communityId], references: [id])
  likes       Like[]
  comments    Comment[]

  @@map("posts")
}

model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  coverImage  String?
  isPrivate   Boolean  @default(false)
  category    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  posts   Post[]
  members CommunityMember[]

  @@map("communities")
}

model CommunityMember {
  id   String @id @default(cuid())
  role Role   @default(MEMBER)

  // Relations
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  communityId String
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  @@unique([userId, communityId])
  @@map("community_members")
}

model Like {
  id     String @id @default(cuid())
  userId String
  postId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("likes")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("comments")
}

model Follow {
  id          String @id @default(cuid())
  followerId  String
  followingId String

  follower  User @relation("UserFollows", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("FollowUser", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@map("follows")
}

enum PostType {
  TEXT
  IMAGE
  VIDEO
  REEL
  LINK
}

enum Role {
  ADMIN
  MODERATOR
  MEMBER
}
```

### **3. Environment Configuration**
```bash
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/social_media"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
```

### **4. Generate and Run Migrations**
```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

### **5. Core Backend Structure**

**Create `src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommunitiesModule,
  ],
})
export class AppModule {}
```

**Create `src/prisma/prisma.service.ts`:**
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

**Create `src/auth/auth.service.ts`:**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return this.login(result);
  }
}
```

### **6. API Endpoints Structure**

**Create `src/posts/posts.controller.ts`:**
```typescript
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Request() req) {
    return this.postsService.getFeed(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: any, @Request() req) {
    return this.postsService.create({
      ...createPostDto,
      authorId: req.user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likePost(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleLike(id, req.user.id);
  }
}
```

### **7. File Upload Setup**

```bash
# Install file upload dependencies
npm install @nestjs/platform-express multer
npm install @types/multer
```

**Create `src/upload/upload.controller.ts`:**
```typescript
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }
}
```

---

## 🔄 **Frontend Integration**

### **1. Replace AuthService**

**Update `utils/auth.ts`:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { user: null, error: error.message };
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { user: data.user };
    } catch (error) {
      return { user: null, error: 'Network error' };
    }
  }

  static async signUp(email: string, password: string, name: string, username: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, username }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { user: null, error: error.message };
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { user: data.user };
    } catch (error) {
      return { user: null, error: 'Network error' };
    }
  }

  static getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  static getToken() {
    return localStorage.getItem('access_token');
  }

  static signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
}
```

### **2. Create API Service**

**Create `utils/api.ts`:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  }
}

export const api = new ApiService();
```

### **3. Update App.tsx API Calls**

**Replace mock operations in `App.tsx`:**
```typescript
// Replace loadMockData with:
const loadData = async () => {
  try {
    const [postsData, communitiesData] = await Promise.all([
      api.get('/posts/feed'),
      api.get('/communities'),
    ]);
    setPosts(postsData);
    setCommunities(communitiesData);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

// Replace handleCreatePost with:
const handleCreatePost = async (postData: any) => {
  try {
    let imageUrl = null;
    if (postData.image) {
      const uploadResult = await api.uploadFile(postData.image);
      imageUrl = uploadResult.url;
    }

    const newPost = await api.post('/posts', {
      content: postData.content,
      type: postData.type || 'text',
      image: imageUrl,
      communityId: postData.community,
    });

    setPosts([newPost, ...posts]);
    toast.success('Post created successfully!');
  } catch (error) {
    console.error('Create post error:', error);
    toast.error('Failed to create post');
  }
};

// Replace handleLike with:
const handleLike = async (postId: string) => {
  try {
    const result = await api.post(`/posts/${postId}/like`, {});
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: result.liked, likes: result.likes }
        : post
    ));
  } catch (error) {
    console.error('Like error:', error);
    toast.error('Failed to like post');
  }
};
```

---

## 🚀 **Deployment**

### **1. Backend Deployment (Railway)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway deploy
```

### **2. Frontend Deployment (Vercel)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

### **3. Environment Variables**
```bash
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
CORS_ORIGIN="https://your-app.vercel.app"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="https://your-backend.railway.app"
```

---

## 📊 **Monitoring Setup**

### **1. Add Health Check**
```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

### **2. Add Logging**
```bash
npm install @nestjs/common winston nest-winston
```

### **3. Error Handling**
```typescript
// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

This implementation guide provides a complete path from your current React app to a production-ready backend with authentication, file uploads, and database integration. The modular structure allows for easy scaling and feature additions.