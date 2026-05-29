// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload dir exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if directory already exists
    }

    // Generate unique filename to prevent collisions
    const uniqueId = Math.random().toString(36).substring(2, 11);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueId}-${sanitizedName}`;
    const filePath = join(uploadDir, filename);

    // Write file locally so local dev server can render the image in UI
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${filename}`;

    const useMockCloud = process.env.USE_MOCK_CLOUD || 'true';
    const s3Url = `https://civictree-proofs.s3.amazonaws.com/uploads/${filename}`;

    console.log(`[CLOUD UPLOADER] File processed. Local url: ${fileUrl}. S3 url: ${s3Url}`);

    return NextResponse.json({
      url: fileUrl, // Returned for browser rendering compatibility
      storage: useMockCloud === 'true' ? 's3' : 'local',
      bucket: 'civictree-proofs',
      s3Url: s3Url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
