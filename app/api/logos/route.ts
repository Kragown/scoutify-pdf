import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const logosDir = join(process.cwd(), 'public', 'logos');
    
    if (!existsSync(logosDir)) {
      return NextResponse.json({
        success: true,
        logos: []
      });
    }

    const files = await readdir(logosDir);
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const logoFiles = files
      .filter(file => {
        const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
        return imageExtensions.includes(ext);
      })
      .map(file => ({
        filename: file,
        path: `/logos/${file}`
      }));

    return NextResponse.json({
      success: true,
      logos: logoFiles
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des logos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des logos' },
      { status: 500 }
    );
  }
}
