// API Route: /api/cosmic-weather/geomagnetic-storms
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';

const NASA_API_KEY = 'cOLaQdKCGpFXpUGAdIRMmQ5DTarzJmXdbbBm1yaS';
const BASE_URL = 'https://api.nasa.gov/DONKI';
const CACHE_KEY = 'cosmic:geomagnetic_storms';
const CACHE_TTL = 600; // 10 minutes

function getDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const format = (date: Date) => date.toISOString().split('T')[0];
    return { startDate: format(startDate), endDate: format(endDate) };
}

export async function GET() {
    try {
        // Check cache first
        const cached = await getCache(CACHE_KEY);
        if (cached) {
            return NextResponse.json({ data: cached, cached: true });
        }

        // Fetch from NASA
        const { startDate, endDate } = getDateRange();
        const url = `${BASE_URL}/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch from NASA API');
        }

        const data = await response.json();
        const result = data || [];

        // Cache the result
        await setCache(CACHE_KEY, result, CACHE_TTL);

        return NextResponse.json({ data: result, cached: false });
    } catch (error) {
        console.error('Geomagnetic storms API error:', error);
        return NextResponse.json({ data: [], error: 'Failed to fetch data' }, { status: 500 });
    }
}
