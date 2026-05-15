import { NextRequest, NextResponse } from 'next/server';
import { classifyImage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const result = await classifyImage(image, mimeType || 'image/jpeg');

    return NextResponse.json({ success: true, classification: result });
  } catch (error: any) {
    console.error('Classification error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Classification failed', details: error.message },
      { status: 500 }
    );
  }
}
