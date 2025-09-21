// E:\mannsahay\src\app\api\resources\[id]\summarize\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Await the params as required by Next.js 13+
    const { id } = await params;
    const resourceId = id;
    
    // Fetch the resource from the database
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    // Check if summary already exists and is recent (less than 7 days old)
    if (resource.summary && resource.summaryGeneratedAt) {
      const summaryAge = new Date().getTime() - new Date(resource.summaryGeneratedAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      if (summaryAge < sevenDaysInMs) {
        return NextResponse.json({
          summary: resource.summary,
          cached: true,
        });
      }
    }
    
    // Get the content to summarize
    let content = '';
    
    if (resource.content) {
      // Use the content directly if available
      content = resource.content;
    } else if (resource.fileUrl) {
      // For now, we'll use the description if content is not available
      // In a real implementation, you would extract text from the file
      content = resource.description || resource.title;
    } else {
      return NextResponse.json(
        { error: 'No content available to summarize' },
        { status: 400 }
      );
    }
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is empty or cannot be processed' },
        { status: 400 }
      );
    }
    
    // Generate the summary using AI
    const summary = await generateResourceSummary(
      content,
      resource.type,
      resource.title,
      resource.language
    );
    
    // Save the summary to the database
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        summary,
        summaryGeneratedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      summary,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating resource summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

// Function to generate resource summary using OpenAI
async function generateResourceSummary(
  content: string,
  type: string,
  title: string,
  language: string = 'en'
): Promise<string> {
  try {
    // Create prompt based on content type
    let prompt = '';
    
    switch (type) {
      case 'ARTICLE':
        prompt = `Summarize the following article in 3-5 bullet points, focusing on the key takeaways and main ideas:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'VIDEO':
        prompt = `Summarize the key points from this video transcript in 3-5 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'AUDIO':
        prompt = `Summarize the main insights from this audio content in 3-5 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'PDF':
        prompt = `Extract and summarize the key information from this document in 3-5 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'MUSIC':
        prompt = `Describe this music resource and its potential benefits for mental wellness in 2-3 sentences:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'MEDITATION':
        prompt = `Summarize this meditation resource, including its purpose and benefits, in 2-3 sentences:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'EXERCISE':
        prompt = `Summarize this exercise, including its purpose and how to perform it, in 3-4 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'INFOGRAPHIC':
        prompt = `Summarize the key information presented in this infographic in 3-4 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'WORKSHEET':
        prompt = `Summarize this worksheet, including its purpose and key activities, in 3-4 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      case 'GUIDE':
        prompt = `Summarize the key steps and advice from this guide in 3-5 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;
      default:
        prompt = `Summarize the following content in 3-5 bullet points:\n\nTitle: ${title}\n\nContent: ${content}`;
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at summarizing mental health and wellness content. Create concise, informative summaries that capture the essence of the content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });
    
    return response.choices[0]?.message?.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error generating summary with OpenAI:', error);
    return 'Unable to generate summary at this time. Please try again later.';
  }
}