// E:\mannsahay\src\app\api\resources\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ResourceType } from '@/types';

interface ResourceWhereInput {
  isPublished: boolean;
  categories?: {
    has: string;
  };
  type?: ResourceType;
  language?: string;
  OR?: Array<{
    title?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
    tags?: { has: string };
    categories?: { has: string };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const language = searchParams.get('language') || 'en';
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build filters with proper typing
    const where: ResourceWhereInput = {
      isPublished: true,
    };
    
    // Only add category filter if it's not "all"
    if (category && category !== 'all') {
      where.categories = {
        has: category,
      };
    }
    
    // Only add type filter if it's not "all" and is a valid ResourceType
    if (type && type !== 'all' && Object.values(ResourceType).includes(type as ResourceType)) {
      where.type = type as ResourceType;
    }
    
    // Only add language filter if it's not "all"
    if (language && language !== 'all') {
      where.language = language;
    }
    
    // Only add search filter if it's not empty
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { categories: { has: search } },
      ];
    }
    
    // Get resources with user interactions
    const resources = await prisma.resource.findMany({
      where,
      include: {
        _count: {
          select: {
            ratings: true,
            bookmarks: true,
            downloads: true,
            views: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });
    
    // Calculate average rating and check if user bookmarked
    const resourcesWithStats = await Promise.all(
      resources.map(async (resource) => {
        const avgRating = resource.ratings.length > 0
          ? resource.ratings.reduce((sum, rating) => sum + rating.rating, 0) / resource.ratings.length
          : 0;
        
        let isBookmarked = false;
        let userRating: number | null = null;
        
        if (userId) {
          const [bookmark, rating] = await Promise.all([
            prisma.resourceBookmark.findUnique({
              where: {
                userId_resourceId: {
                  userId,
                  resourceId: resource.id,
                },
              },
            }),
            prisma.resourceRating.findUnique({
              where: {
                userId_resourceId: {
                  userId,
                  resourceId: resource.id,
                },
              },
            }),
          ]);
          
          isBookmarked = !!bookmark;
          userRating = rating?.rating || null;
        }
        
        return {
          ...resource,
          averageRating: parseFloat(avgRating.toFixed(1)),
          isBookmarked,
          userRating,
        };
      })
    );
    
    const total = await prisma.resource.count({ where });
    
    return NextResponse.json({
      resources: resourcesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

interface CreateResourceData {
  title: string;
  description?: string;
  content?: string;
  type: ResourceType;
  language?: string;
  fileUrl?: string;
  fileKey?: string;
  fileSize?: number;
  duration?: number;
  author?: string;
  tags?: string[];
  categories?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch the full user to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data: CreateResourceData = await request.json();
    const {
      title,
      description,
      content,
      type,
      language,
      fileUrl,
      fileKey,
      fileSize,
      duration,
      author,
      tags,
      categories,
      isPublished,
      isFeatured,
    } = data;
    
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        content,
        type,
        language: language || 'en',
        fileUrl,
        fileKey,
        fileSize,
        duration,
        author,
        tags: tags || [],
        categories: categories || [],
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
      },
    });
    
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}