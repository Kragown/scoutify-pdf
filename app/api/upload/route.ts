import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'photo';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'L\'image ne doit pas dépasser 5MB' },
        { status: 400 }
      );
    }

    const uploadDir = type === 'logo' ? 'public/logos' : 'public/photos';
    const uploadPath = join(process.cwd(), uploadDir);

    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(uploadPath, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const relativePath = uploadDir === 'public/photos' 
      ? `/photos/${filename}`
      : uploadDir === 'public/logos'
      ? `/logos/${filename}`
      : `/${uploadDir}/${filename}`;

    return NextResponse.json({
      success: true,
      path: relativePath,
      message: 'Fichier uploadé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}
