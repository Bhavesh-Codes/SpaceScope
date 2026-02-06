// ==========================================
// CELESTIAL EVENTS PAGE
// Route: /celestial-events
// Shows: Upcoming celestial events, astronomy calendar
// ==========================================
import React from 'react';
import CelestialLayout from '@/components/celestial/CelestialLayout';

export default function CelestialEventsPage() {
    return (
        <main className="min-h-screen bg-black">
            <CelestialLayout />
        </main>
    );
}