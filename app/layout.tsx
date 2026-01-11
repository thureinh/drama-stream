import React from 'react';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
    title: 'WasabiStream AI',
    description: 'WasabiStream AI',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </head>
            <body className="font-sans antialiased text-zinc-900 bg-zinc-50 dark:text-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
