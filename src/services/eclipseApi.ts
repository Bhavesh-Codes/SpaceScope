// Eclipse API Service - Client-side fetching with static data

import {
    EclipseEvent,
    SOLAR_ECLIPSES,
    LUNAR_ECLIPSES,
    getUpcomingEclipses as getUpcoming,
    getEclipsesByYear as getByYear
} from '@/data/eclipseData';

export type { EclipseEvent } from '@/data/eclipseData';

// Fetch solar eclipses from API (with caching) and merge with static path data
export async function fetchSolarEclipses(year: number): Promise<EclipseEvent[]> {
    try {
        const response = await fetch(`/api/eclipses?year=${year}&type=solar`);
        const json = await response.json();

        if (json.error) {
            console.warn('Eclipse API error, using static data');
            return SOLAR_ECLIPSES.filter(e => new Date(e.date).getFullYear() === year);
        }

        if (json.cached) {
            console.log('✓ Solar eclipses from cache');
        }

        // Merge API data with our static path data
        return mergeWithStaticData(json.data || [], 'solar');
    } catch (error) {
        console.error('Error fetching solar eclipses:', error);
        return SOLAR_ECLIPSES.filter(e => new Date(e.date).getFullYear() === year);
    }
}

// Fetch all eclipses for a year
export async function fetchEclipsesForYear(year: number): Promise<EclipseEvent[]> {
    try {
        const response = await fetch(`/api/eclipses?year=${year}`);
        const json = await response.json();

        if (json.error) {
            console.warn('Eclipse API error, using static data');
            return getByYear(year);
        }

        if (json.cached) {
            console.log('✓ Eclipses from cache');
        }

        return json.data || getByYear(year);
    } catch (error) {
        console.error('Error fetching eclipses:', error);
        return getByYear(year);
    }
}

// Get upcoming eclipses (uses static data for reliability)
export function getUpcomingEclipses(count: number = 5): EclipseEvent[] {
    return getUpcoming(new Date()).slice(0, count);
}

// Get next eclipse of any type
export function getNextEclipse(): EclipseEvent | null {
    const upcoming = getUpcoming(new Date());
    return upcoming.length > 0 ? upcoming[0] : null;
}

// Get next solar eclipse specifically
export function getNextSolarEclipse(): EclipseEvent | null {
    const upcoming = getUpcoming(new Date())
        .filter(e => e.id.startsWith('solar-'));
    return upcoming.length > 0 ? upcoming[0] : null;
}

// Get next lunar eclipse
export function getNextLunarEclipse(): EclipseEvent | null {
    const upcoming = getUpcoming(new Date())
        .filter(e => e.id.startsWith('lunar-'));
    return upcoming.length > 0 ? upcoming[0] : null;
}

// Merge API response with our static path data
function mergeWithStaticData(apiData: any[], type: 'solar' | 'lunar'): EclipseEvent[] {
    const staticData = type === 'solar' ? SOLAR_ECLIPSES : LUNAR_ECLIPSES;

    // If API returned good data, try to match with our static records
    if (apiData && apiData.length > 0) {
        return apiData.map(apiEclipse => {
            // Try to find matching static data
            const matchingStatic = staticData.find(s =>
                s.date === apiEclipse.date ||
                new Date(s.date).toDateString() === new Date(apiEclipse.date).toDateString()
            );

            if (matchingStatic) {
                // Merge: API data takes precedence, but use static path data
                return {
                    ...matchingStatic,
                    ...apiEclipse,
                    path: matchingStatic.path, // Always use our curated path data
                };
            }

            // No matching static data, return API data as-is
            return apiEclipse;
        });
    }

    return staticData;
}

// Calculate days until an eclipse
export function daysUntilEclipse(eclipse: EclipseEvent): number {
    const eclipseDate = new Date(eclipse.date);
    const now = new Date();
    const diffTime = eclipseDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format eclipse date for display
export function formatEclipseDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Get countdown string
export function getEclipseCountdown(eclipse: EclipseEvent): string {
    const days = daysUntilEclipse(eclipse);
    if (days < 0) return 'Past';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
}
