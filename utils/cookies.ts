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
        // We write the file every time to ensure freshness or simple logic. 
        // Optimization: check if content changed could be added later if needed.
        await fs.promises.writeFile(COOKIES_FILE_PATH, cookiesContent, 'utf-8');
        return COOKIES_FILE_PATH;
    } catch (error) {
        console.error('Failed to write cookies file:', error);
        return null;
    }
}
