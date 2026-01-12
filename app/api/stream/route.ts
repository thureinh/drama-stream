import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { ensureCookiesFile } from '@/utils/cookies';

// Keep this constant! It ensures yt-dlp and fetch look identical to YouTube.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) return new NextResponse('Missing videoId', { status: 400 });

    try {
        const cookiesPath = await ensureCookiesFile();

        // 1. Get the direct URL
        const directUrl = await new Promise<string>((resolve, reject) => {
            const args = [
                '--no-cache-dir',
                '--no-playlist',
                '--user-agent', USER_AGENT, // Match the fetch request
                '-f', 'b',
                '-g',
            ];

            if (cookiesPath) args.push('--cookies', cookiesPath);
            args.push('--js-runtimes', 'node'); // Fixes the "No JS runtime" warning
            args.push(`https://www.youtube.com/watch?v=${videoId}`);

            const ytDlp = spawn('yt-dlp', args);

            let output = '';
            let errorOutput = '';

            ytDlp.stdout.on('data', (data) => output += data.toString());
            ytDlp.stderr.on('data', (data) => errorOutput += data.toString());

            ytDlp.on('close', (code) => {
                const cleanUrl = output.trim().split('\n')[0];
                if (code === 0 && cleanUrl.startsWith('http')) {
                    resolve(cleanUrl);
                } else {
                    reject(new Error(`yt-dlp error: ${errorOutput}`));
                }
            });
        });

        // 2. Fetch the video stream using the SAME User-Agent
        // If you remove this header, fetch uses 'node-fetch/1.0', which mismatches yt-dlp -> 403 Error
        const headers: HeadersInit = {
            'User-Agent': USER_AGENT,
        };

        const range = request.headers.get('range');
        if (range) headers['Range'] = range;

        const upstreamResponse = await fetch(directUrl, { headers });

        if (!upstreamResponse.body) {
            return new NextResponse('Upstream Error', { status: 502 });
        }

        // 3. Pipe the stream back to the client
        const responseHeaders: HeadersInit = {};
        const headersToCopy = ['content-length', 'content-range', 'content-type', 'accept-ranges'];

        headersToCopy.forEach(h => {
            const val = upstreamResponse.headers.get(h);
            if (val) responseHeaders[h] = val;
        });

        return new NextResponse(upstreamResponse.body as any, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}