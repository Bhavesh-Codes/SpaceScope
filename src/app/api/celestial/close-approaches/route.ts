import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';

// NASA Close Approach Data (CAD) API
interface CADResponse {
    count: string;
    fields: string[];
    data: string[][];
}

const CACHE_KEY = 'celestial:close_approaches';
const CACHE_TTL = 3600; // 1 hour (data doesn't change frequently)

export async function GET() {
    try {
        // Check cache first
        const cached = await getCache<CADResponse>(CACHE_KEY);
        if (cached) {
            console.log('✓ Close approaches from cache');
            return NextResponse.json({ ...cached, cached: true });
        }

        // Get close approaches for the next 365 days
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        const dateMin = today.toISOString().split('T')[0];
        const dateMax = nextYear.toISOString().split('T')[0];

        const url = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=${dateMax}&dist-max=0.2&sort=dist`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch close approaches');
        }

        const data: CADResponse = await response.json();

        // Cache the result
        await setCache(CACHE_KEY, data, CACHE_TTL);
        console.log('✓ Close approaches fetched and cached');

        return NextResponse.json({ ...data, cached: false });
    } catch (error) {
        console.error('Error fetching close approaches:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
