import { writeFile, mkdir, unlink } from 'fs/promises';
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const fullPath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(fullPath, buffer);

    // Simulate antivirus scan 
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const isMalicious = Math.random() < 0.05;
    if (isMalicious) {
      // Delete the file from the public folder if it's "infected"
      await unlink(fullPath);
      console.warn(`[AV SCAN] Threat detected in ${file.name}. File deleted.`);
      
      return NextResponse.json({ 
        error: "Security Check Failed", 
        details: "Our antivirus scanner detected a potential threat in this file." 
      }, { status: 403 });
    }

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