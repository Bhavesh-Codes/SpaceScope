import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';

// NASA SBDB Query API for comets
interface SBDBQueryResponse {
    count: string;
    fields: string[];
    data: string[][];
}

const CACHE_KEY = 'celestial:comets';
const CACHE_TTL = 3600; // 1 hour (comet data doesn't change frequently)

export async function GET() {
    try {
        // Check cache first
        const cached = await getCache<SBDBQueryResponse>(CACHE_KEY);
        if (cached) {
            console.log('✓ Comets from cache');
            return NextResponse.json({ ...cached, cached: true });
        }

        // Query for comets with orbital data
        const url = `https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=full_name,pdes,name,per,q&sb-kind=c&limit=10`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch comets');
        }

        const data: SBDBQueryResponse = await response.json();

        // Cache the result
        await setCache(CACHE_KEY, data, CACHE_TTL);
        console.log('✓ Comets fetched and cached');

        return NextResponse.json({ ...data, cached: false });
    } catch (error) {
        console.error('Error fetching comets:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
