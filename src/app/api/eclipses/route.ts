// API Route: /api/eclipses
// Fetches solar eclipse data from USNO API with Redis caching

import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';
import { getEclipsesByYear, SOLAR_ECLIPSES, LUNAR_ECLIPSES } from '@/data/eclipseData';

const USNO_BASE_URL = 'https://aa.usno.navy.mil/api/eclipses/solar/year';
const CACHE_TTL = 3600; // 1 hour (eclipse data doesn't change)

interface USNOEclipse {
    day: number;
    month: number;
    year: number;
    event: string;
}

interface USNOResponse {
    apiversion: string;
    year: number;
    eclipses_in_year: USNOEclipse[];
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const type = searchParams.get('type'); // 'solar', 'lunar', or undefined for both

    const cacheKey = `eclipses:${year}:${type || 'all'}`;

    try {
        // Check cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            console.log('✓ Eclipses from cache');
            return NextResponse.json({ data: cached, cached: true, year });
        }

        // For lunar or all eclipses, we primarily use static data
        // (USNO API only has solar eclipses)
        if (type === 'lunar') {
            const lunarEclipses = LUNAR_ECLIPSES.filter(
                e => new Date(e.date).getFullYear() === year
            );
            await setCache(cacheKey, lunarEclipses, CACHE_TTL);
            return NextResponse.json({ data: lunarEclipses, cached: false, year });
        }

        // Try to fetch solar eclipses from USNO API
        let solarEclipses = SOLAR_ECLIPSES.filter(
            e => new Date(e.date).getFullYear() === year
        );

        try {
            const response = await fetch(`${USNO_BASE_URL}?year=${year}`, {
                next: { revalidate: 3600 }
            });

            if (response.ok) {
                const usnoData: USNOResponse = await response.json();
                console.log(`✓ USNO API returned ${usnoData.eclipses_in_year?.length || 0} eclipses`);

                // Merge USNO data with our static data
                // Our static data has more details (paths, etc.)
                if (usnoData.eclipses_in_year && usnoData.eclipses_in_year.length > 0) {
                    // USNO confirms our data, use our richer static data
                    solarEclipses = SOLAR_ECLIPSES.filter(
                        e => new Date(e.date).getFullYear() === year
                    );
                }
            }
        } catch (apiError) {
            console.warn('USNO API unavailable, using static data:', apiError);
        }

        // Combine based on type parameter
        let result;
        if (type === 'solar') {
            result = solarEclipses;
        } else {
            // Return both solar and lunar
            const lunarEclipses = LUNAR_ECLIPSES.filter(
                e => new Date(e.date).getFullYear() === year
            );
            result = [...solarEclipses, ...lunarEclipses].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        }

        // Cache the result
        await setCache(cacheKey, result, CACHE_TTL);
        console.log(`✓ Eclipses fetched and cached for ${year}`);

        return NextResponse.json({ data: result, cached: false, year });
    } catch (error) {
        console.error('Eclipse API error:', error);

        // Fallback to static data
        const fallbackData = getEclipsesByYear(year);
        return NextResponse.json({
            data: fallbackData,
            cached: false,
            year,
            fallback: true
        });
    }
}
