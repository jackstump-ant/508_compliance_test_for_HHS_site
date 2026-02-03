import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { createSubmission, getAllSubmissions, getSubmissionById } from '@/lib/db';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedExtensions = [
      '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
      '.html', '.htm', '.png', '.jpg', '.jpeg', '.gif'
    ];
    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `File type ${extension} not supported` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.resolve(UPLOAD_DIR);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record
    const submission = createSubmission({
      fileName: file.name,
      fileType: file.type || extension,
      filePath: filePath,
      fileSize: file.size,
    });

    return NextResponse.json({
      id: submission.id,
      fileName: submission.fileName,
      status: submission.status,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const submission = getSubmissionById(id);
      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(submission);
    }

    const submissions = getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to get submissions' },
      { status: 500 }
    );
  }
}
