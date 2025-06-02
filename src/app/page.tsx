// src/app/page.tsx
"use client";

import Layout from '@/components/Layout'; // Import your layout
import DashboardContent from '@/components/Dashboard'; // Your dashboard specific content

export default function RootPage() {
    return (
        <>
            <DashboardContent />
        </>
    );
}