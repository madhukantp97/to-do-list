// src/app/layout.tsx
import type { Metadata } from 'next';
import AppProvider from '@/contexts/AppContext';
import Layout from '@/components/Layout'; // Import the Layout component
import '../styles/globals.css'; // Ensure this path is correct

export const metadata: Metadata = {
    title: 'Productivity Hub',
    description: 'Your personal productivity dashboard.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    src="/softgen/script.js"
                    async
                    data-softgen-monitoring="true"
                />
            </head>
            <body className="antialiased">
                <AppProvider>
                    <Layout>{children}</Layout> {/* Wrap children with Layout */}
                </AppProvider>
            </body>
        </html>
    );
}