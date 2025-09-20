// E:\mannsahay\src\app\api\resources\categories\route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get all unique categories from resources
    const resources = await prisma.resource.findMany({
      where: {
        isPublished: true,
      },
      select: {
        categories: true,
      },
    });
    
    // Extract all categories and count occurrences
    const categoryCounts: Record<string, number> = {};
    
    resources.forEach((resource) => {
      resource.categories.forEach((category) => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count
    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}