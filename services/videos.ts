import { createClient } from '@/utils/supabase/server';
import { Video } from '@/types';

// Define the shape of the row in the database
interface VideoRow {
    id: string;
    youtube_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    duration: string | null;
    published_at: string | null;
    tags: string[] | null;
    created_at: string | null;
}

import { getPresignedVideoUrl } from '@/utils/r2/server';

export async function getVideos(page: number = 1, limit: number = 20): Promise<Video[]> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }

    const videos = await Promise.all((data || []).map(async (row: VideoRow) => {
        const videoUrl = await getPresignedVideoUrl(`${row.youtube_id}.mp4`);

        return {
            id: row.id,
            title: row.title,
            url: videoUrl,
            thumbnail: row.thumbnail_url || '',
            tags: row.tags || [],
            uploadedAt: row.published_at || row.created_at || new Date().toISOString(),
            duration: row.duration ? formatDuration(row.duration) : '0:00',
            size: 0,
            category: row.tags?.[0] || 'Uncategorized',
            description: row.description || undefined,
        };
    }));

    return videos;
}

function formatDuration(duration: string): string {
    // Parse ISO 8601 duration (e.g., PT1H29M43S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
