import { NextResponse, NextRequest } from 'next/server';
import { getVideos } from '@/services/videos';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const videos = await getVideos(page, limit);
        return NextResponse.json(videos);
    } catch (error) {
        console.error('API Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }
}
