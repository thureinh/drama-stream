import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { ensureCookiesFile } from '@/utils/cookies';

// 1. Define a constant User Agent to ensure consistency
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return new NextResponse('Missing videoId', { status: 400 });
    }

    try {
        const cookiesPath = await ensureCookiesFile();

        const directUrl = await new Promise<string>((resolve, reject) => {
            const args = [
                '--no-cache-dir',
                '--no-playlist',
                '--user-agent', USER_AGENT, // <--- Use constant
                '-f', 'b', // Selects best single file with video+audio
                '-g',
            ];

            if (cookiesPath) args.push('--cookies', cookiesPath);
            args.push('--js-runtimes', 'node');
            args.push(`https://www.youtube.com/watch?v=${videoId}`);

            const ytDlp = spawn('yt-dlp', args);

            let output = '';
            let errorOutput = '';

            ytDlp.stdout.on('data', (data) => output += data.toString());
            ytDlp.stderr.on('data', (data) => errorOutput += data.toString());

            ytDlp.on('close', (code) => {
                // 2. Safety: Split by newline in case multiple URLs are returned and take the first one
                const cleanUrl = output.trim().split('\n')[0];

                if (code === 0 && cleanUrl.startsWith('http')) {
                    resolve(cleanUrl);
                } else {
                    reject(new Error(`yt-dlp failed (code ${code}). Error: ${errorOutput}`));
                }
            });
        });

        if (!directUrl) {
            return new NextResponse('Failed to retrieve video URL', { status: 500 });
        }

        // 3. Prepare headers for the fetch request
        const headers: HeadersInit = {
            'User-Agent': USER_AGENT, // <--- CRITICAL: Must match the signer's UA
        };

        // Forward Range header (essential for seeking/scrubbing)
        const range = request.headers.get('range');
        if (range) {
            headers['Range'] = range;
        }

        // 4. Fetch from upstream with the correct headers
        const upstreamResponse = await fetch(directUrl, { headers });

        if (!upstreamResponse.body) {
            return new NextResponse('No content from upstream', { status: 502 });
        }

        // 5. Forward upstream headers to client
        const responseHeaders: HeadersInit = {};
        const copyHeaders = [
            'content-length',
            'content-range',
            'content-type',
            'accept-ranges'
        ];

        copyHeaders.forEach(header => {
            const value = upstreamResponse.headers.get(header);
            if (value) responseHeaders[header] = value;
        });

        return new NextResponse(upstreamResponse.body as any, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('Stream proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}