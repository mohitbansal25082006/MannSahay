// E:\mannsahay\src\app\api\forum\stats\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get total posts count (excluding hidden posts)
    const totalPosts = await prisma.post.count({
      where: { isHidden: false }
    });

    // Get active users count (users who have posted or replied in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          {
            posts: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo
                },
                isHidden: false
              }
            }
          },
          {
            replies: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo
                },
                isHidden: false
              }
            }
          }
        ]
      }
    });

    // Get today's posts count (excluding hidden posts)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        isHidden: false
      }
    });

    // Get posts by category (excluding hidden posts)
    const postsByCategory = await prisma.post.groupBy({
      by: ['category'],
      where: { isHidden: false },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    // Get most active users (users with most non-hidden posts in the last 30 days)
    const mostActiveUsers = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo
            },
            isHidden: false
          }
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            posts: {
              where: {
                createdAt: {
                  gte: thirtyDaysAgo
                },
                isHidden: false
              }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Get trending posts (most liked non-hidden posts in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        isHidden: false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            hashedId: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      },
      orderBy: {
        likes: {
          _count: 'desc'
        }
      },
      take: 3
    });

    return NextResponse.json({
      totalPosts,
      activeUsers,
      todaysPosts,
      postsByCategory,
      mostActiveUsers,
      trendingPosts
    });
  } catch (error) {
    console.error('Forum stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}