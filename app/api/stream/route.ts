import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { ensureCookiesFile } from '@/utils/cookies';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return new NextResponse('Missing videoId', { status: 400 });
    }

    try {
        // Prepare cookies if available
        const cookiesPath = await ensureCookiesFile();

        // 1. Get the direct video URL using yt-dlp
        // -f b: Best quality (video+audio combined if available, or best single file)
        // -g: Get URL only
        const directUrl = await new Promise<string>((resolve, reject) => {
            const args = [
                '--no-cache-dir',
                '--no-playlist',
                '--force-ipv4',
                '-f', 'b',
                '-g',
            ];

            // Add cookies if available
            if (cookiesPath) {
                args.push('--cookies', cookiesPath);
            }

            // Explicitly set JS runtime to node to avoid warnings/errors
            // We assume node is available in the environment (it is in the Dockerfile)
            args.push('--js-runtimes', 'node');

            args.push(`https://www.youtube.com/watch?v=${videoId}`);

            const ytDlp = spawn('yt-dlp', args);

            let output = '';
            let errorOutput = '';

            ytDlp.stdout.on('data', (data) => {
                output += data.toString();
            });

            ytDlp.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            ytDlp.on('close', (code) => {
                const trimmedOutput = output.trim();
                // Check if output looks like a URL
                if (code === 0 && trimmedOutput.startsWith('http')) {
                    resolve(trimmedOutput);
                } else {
                    reject(new Error(`yt-dlp failed (code ${code}). Output: ${trimmedOutput.slice(0, 100)}... Error: ${errorOutput}`));
                }
            });
        });

        if (!directUrl) {
            return new NextResponse('Failed to retrieve video URL', { status: 500 });
        }

        // 2. Prepare headers for upstream request
        const headers: HeadersInit = {};
        const range = request.headers.get('range');
        if (range) {
            headers['Range'] = range;
        }

        // 3. Fetch from upstream YouTube URL
        const upstreamResponse = await fetch(directUrl, { headers });

        if (!upstreamResponse.body) {
            return new NextResponse('No content from upstream', { status: 502 });
        }

        // 4. Forward upstream headers to client
        const responseHeaders: HeadersInit = {};

        // Critical headers for streaming
        const contentLength = upstreamResponse.headers.get('content-length');
        if (contentLength) responseHeaders['Content-Length'] = contentLength;

        const contentRange = upstreamResponse.headers.get('content-range');
        if (contentRange) responseHeaders['Content-Range'] = contentRange;

        const contentType = upstreamResponse.headers.get('content-type');
        if (contentType) responseHeaders['Content-Type'] = contentType;

        const acceptRanges = upstreamResponse.headers.get('accept-ranges');
        if (acceptRanges) responseHeaders['Accept-Ranges'] = acceptRanges;

        // 5. Return stream
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
