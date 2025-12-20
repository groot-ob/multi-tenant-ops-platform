import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getTenantPrisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const tenantId = data.get('tenantId') as string;
    const incidentId = data.get('incidentId') as string;

    if (!file || !tenantId || !incidentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Prepare Storage Path
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const fullPath = path.join(uploadDir, fileName);

    // 2. Ensure directory exists and write file
    await mkdir(uploadDir, { recursive: true });
    await writeFile(fullPath, buffer);

    // 3. Save Metadata to Database
    const db = getTenantPrisma(tenantId);
    await db.attachment.create({
      data: {
        filename: file.name,
        fileUrl: `/uploads/${fileName}`,
        fileType: file.type,
        fileSize: file.size,
        incidentId,
        tenantId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}