import { NextRequest, NextResponse } from 'next/server';

/**
 * EONET API Route
 * Proxies requests to NASA's Earth Observatory Natural Event Tracker (EONET) API
 * Provides natural events like wildfires, volcanoes, severe storms, etc.
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'open';
        const limit = searchParams.get('limit') || '50';
        const days = searchParams.get('days') || '60';

        // NASA EONET API endpoint
        const eonetUrl = `https://eonet.gsfc.nasa.gov/api/v3/events?status=${status}&limit=${limit}&days=${days}`;

        const response = await fetch(eonetUrl, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`EONET API error: ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        console.error('Error fetching EONET data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch EONET events', events: [] },
            { status: 500 }
        );
    }
}
