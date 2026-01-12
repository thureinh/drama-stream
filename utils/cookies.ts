import fs from 'fs';
import path from 'path';
import os from 'os';

const COOKIES_FILE_PATH = path.join(os.tmpdir(), 'youtube_cookies.txt');

/**
 * Ensures the cookies file exists if the YOUTUBE_COOKIES environment variable is set.
 * Returns the path to the cookies file if created/exists, or null if no cookies provided.
 */
export async function ensureCookiesFile(): Promise<string | null> {
    const cookiesContent = process.env.YOUTUBE_COOKIES;

    if (!cookiesContent) {
        return null;
    }

    try {
        let finalContent = cookiesContent;

        // Debug detection
        const isNetscape = cookiesContent.trim().startsWith('# Netscape');
        console.log(`[Cookies] Env var length: ${cookiesContent.length}, Starts with '# Netscape': ${isNetscape}`);

        if (!isNetscape) {
            // If it doesn't look like a cookie file, try to treat it as Base64.
            // Remove all whitespace (newlines from wrapped base64 output)
            const cleanBase64 = cookiesContent.replace(/\s/g, '');
            try {
                const decoded = Buffer.from(cleanBase64, 'base64').toString('utf-8');
                if (decoded.trim().startsWith('# Netscape') || decoded.includes('\t')) {
                    console.log('[Cookies] Successfully decoded Base64 cookie content.');
                    finalContent = decoded;
                } else {
                    console.warn('[Cookies] Warning: Decoded content does not look like Netscape format. Using original content.');
                }
            } catch (e) {
                console.warn('[Cookies] Warning: Failed to decode as Base64, using original content.', e);
            }
        } else {
            console.log('[Cookies] Using raw content from env var.');
        }

        // We write the file every time to ensure freshness or simple logic. 
        // Optimization: check if content changed could be added later if needed.
        await fs.promises.writeFile(COOKIES_FILE_PATH, finalContent, 'utf-8');
        console.log(`[Cookies] Written to ${COOKIES_FILE_PATH}`);
        return COOKIES_FILE_PATH;
    } catch (error) {
        console.error('Failed to write cookies file:', error);
        return null;
    }
}
