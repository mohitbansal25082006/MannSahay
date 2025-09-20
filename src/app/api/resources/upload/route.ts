// E:\mannsahay\src\app\api\resources\upload\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { ResourceType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in' },
        { status: 401 }
      );
    }
    
    // Get admin email from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not configured' },
        { status: 500 }
      );
    }
    
    // Check if the user's email matches the admin email
    if (session.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can upload resources' },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Generate a unique filename to avoid conflicts
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;
    
    // Upload file to Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: 'public',
    });
    
    // Create resource in database
    const resource = await prisma.resource.create({
      data: {
        title: metadata.title,
        description: metadata.description,
        content: metadata.content,
        type: metadata.type,
        language: metadata.language || 'en',
        fileUrl: blob.url,
        fileKey: blob.url, // Using blob URL as key for simplicity
        fileSize: file.size,
        duration: metadata.duration,
        author: metadata.author,
        tags: metadata.tags || [],
        categories: metadata.categories || [],
        isPublished: metadata.isPublished || false,
        isFeatured: metadata.isFeatured || false,
      },
    });
    
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error uploading resource:', error);
    return NextResponse.json(
      { error: 'Failed to upload resource' },
      { status: 500 }
    );
  }
}