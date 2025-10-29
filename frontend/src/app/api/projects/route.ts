import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, title, visibility = 'PUBLIC' } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const projectTitle = title || (trimmedQuery.length > 50 ? trimmedQuery.substring(0, 50) + '...' : trimmedQuery);

    // Check if a project with the same query already exists for this user
    const existingProject = await prisma.project.findFirst({
      where: {
        userId: session.user.id,
        title: projectTitle,
      },
      select: {
        id: true,
        title: true,
        visibility: true,
        sandboxId: true,
        previewUrl: true,
        lastSeenAt: true,
        currentSnapshotS3Key: true,
        currentSnapshotAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    let project;

    if (existingProject) {
      // Project already exists, return it
      project = existingProject;
      
      // Update lastSeenAt to current time
      await prisma.project.update({
        where: { id: project.id },
        data: { lastSeenAt: new Date() }
      });
      
      project.lastSeenAt = new Date();
    } else {
      // Create a new project
      project = await prisma.project.create({
        data: {
          userId: session.user.id,
          title: projectTitle,
          visibility: visibility as 'PUBLIC' | 'PRIVATE',
        },
        select: {
          id: true,
          title: true,
          visibility: true,
          sandboxId: true,
          previewUrl: true,
          lastSeenAt: true,
          currentSnapshotS3Key: true,
          currentSnapshotAt: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      // Create initial chat history entry with the user's query
      await prisma.chatHistory.create({
        data: {
          projectId: project.id,
          from: 'USER',
          content: trimmedQuery,
        }
      });
    }

    return NextResponse.json({
      success: true,
      isNewProject: !existingProject,
      project: {
        id: project.id,
        title: project.title,
        visibility: project.visibility,
        sandboxId: project.sandboxId,
        previewUrl: project.previewUrl,
        lastSeenAt: project.lastSeenAt,
        currentSnapshotS3Key: project.currentSnapshotS3Key,
        currentSnapshotAt: project.currentSnapshotAt,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all projects for the authenticated user
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        visibility: true,
        sandboxId: true,
        previewUrl: true,
        lastSeenAt: true,
        currentSnapshotS3Key: true,
        currentSnapshotAt: true,
        createdAt: true,
        updatedAt: true,
        chatHistories: {
          select: {
            id: true,
            from: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 1, // Get the first message (user's initial query)
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
