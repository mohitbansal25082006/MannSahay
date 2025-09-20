// E:\mannsahay\src\app\api\resources\recommendations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    
    // Get user data for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interests: true,
        preferredLanguage: true,
        preferredSpecializations: true,
        moodHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        resourceBookmarks: {
          include: {
            resource: {
              select: {
                categories: true,
                tags: true,
                type: true,
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Extract user preferences
    const userInterests = user.interests || [];
    const userSpecializations = user.preferredSpecializations || [];
    const userLanguage = user.preferredLanguage || 'en';
    
    // Get bookmarked categories and tags
    const bookmarkedCategories = user.resourceBookmarks.flatMap(
      (bookmark) => bookmark.resource.categories
    );
    const bookmarkedTags = user.resourceBookmarks.flatMap(
      (bookmark) => bookmark.resource.tags
    );
    
    // Calculate average mood
    const avgMood = user.moodHistory.length > 0
      ? user.moodHistory.reduce((sum: number, mood: any) => sum + mood.mood, 0) / user.moodHistory.length
      : 5;
    
    // Build recommendation criteria
    const where: any = {
      isPublished: true,
    };
    
    // Language filter
    if (userLanguage !== 'all') {
      where.language = userLanguage;
    }
    
    // Get all resources that match criteria
    const resources = await prisma.resource.findMany({
      where,
      include: {
        _count: {
          select: {
            ratings: true,
            bookmarks: true,
            downloads: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
      take: 50, // Get more to score and rank
    });
    
    // Score each resource based on user preferences
    const scoredResources = await Promise.all(
      resources.map(async (resource) => {
        let score = 0;
        const reasons = [];
        
        // Calculate average rating
        const avgRating = resource.ratings.length > 0
          ? resource.ratings.reduce((sum, rating) => sum + rating.rating, 0) / resource.ratings.length
          : 0;
        
        // Base score from rating
        score += avgRating * 0.2;
        
        // Interest match
        const interestMatches = resource.categories.filter((category) =>
          userInterests.includes(category)
        ).length;
        if (interestMatches > 0) {
          score += interestMatches * 0.3;
          reasons.push(`Matches your interests: ${resource.categories.join(', ')}`);
        }
        
        // Specialization match
        const specializationMatches = resource.categories.filter((category) =>
          userSpecializations.includes(category)
        ).length;
        if (specializationMatches > 0) {
          score += specializationMatches * 0.4;
          reasons.push(`Matches your specializations: ${resource.categories.join(', ')}`);
        }
        
        // Bookmarked category/tag match
        const categoryMatches = resource.categories.filter((category) =>
          bookmarkedCategories.includes(category)
        ).length;
        const tagMatches = resource.tags.filter((tag) =>
          bookmarkedTags.includes(tag)
        ).length;
        
        if (categoryMatches > 0 || tagMatches > 0) {
          score += (categoryMatches + tagMatches) * 0.25;
          reasons.push(`Similar to your bookmarked resources`);
        }
        
        // Mood-based scoring
        if (avgMood < 4) {
          // User is feeling down, recommend uplifting content
          if (resource.categories.includes('wellness') || 
              resource.categories.includes('mindfulness') ||
              resource.type === 'MUSIC' ||
              resource.type === 'MEDITATION') {
            score += 0.3;
            reasons.push('Content for emotional wellness');
          }
        } else if (avgMood > 7) {
          // User is feeling good, recommend growth content
          if (resource.categories.includes('personal-growth') || 
              resource.categories.includes('skill-building')) {
            score += 0.2;
            reasons.push('Content for personal growth');
          }
        }
        
        // Popularity boost
        const popularityScore = (
          resource._count.bookmarks * 0.01 +
          resource._count.downloads * 0.005 +
          resource._count.ratings * 0.02
        );
        score += popularityScore;
        
        // Featured boost
        if (resource.isFeatured) {
          score += 0.1;
          reasons.push('Featured content');
        }
        
        return {
          ...resource,
          score,
          reasons: reasons.length > 0 ? reasons.join(', ') : 'General recommendation',
          averageRating: parseFloat(avgRating.toFixed(1)),
        };
      })
    );
    
    // Sort by score and take top recommendations
    const recommendations = scoredResources
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Save recommendations to database
    await prisma.resourceRecommendation.deleteMany({
      where: { userId },
    });
    
    await prisma.resourceRecommendation.createMany({
      data: recommendations.map((resource) => ({
        userId,
        resourceId: resource.id,
        score: resource.score,
        reason: resource.reasons,
      })),
    });
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}