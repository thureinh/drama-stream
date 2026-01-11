import React from 'react';
import './globals.css';

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
            <body>
                {children}
            </body>
        </html>
    );
}
