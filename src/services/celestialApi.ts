// Celestial Events API Service
// Uses local API routes to proxy NASA SBDB and CAD APIs (bypassing CORS)

import { CelestialEvent, EventType } from '@/data/celestialEvents';

// ============================================================================
// NASA Close Approach Data (CAD) API - Near Earth Objects
// Uses local API route to bypass CORS
// ============================================================================

interface CADResponse {
    count: string;
    fields: string[];
    data: string[][];
}

export async function fetchCloseApproaches(): Promise<CelestialEvent[]> {
    try {
        // Use local API route to bypass CORS
        const response = await fetch('/api/celestial/close-approaches');

        if (!response.ok) throw new Error('Failed to fetch close approaches');

        const data: CADResponse = await response.json();

        if (!data.data || data.data.length === 0) return [];

        // Convert to CelestialEvent format (take top 10)
        return data.data.slice(0, 10).map((row, index) => {
            const [des, orbit_id, jd, cd, dist, dist_min, dist_max, v_rel, v_inf, t_sigma, h] = row;

            // Parse the close approach date
            const dateStr = cd.replace(/(\d{4})-(\w{3})-(\d{2}).*/, '$2 $3, $1');
            const yearVal = parseInt(cd.split('-')[0]);
            const distanceAU = parseFloat(dist);
            const distanceKm = (distanceAU * 149597870.7).toFixed(0);
            const velocityKmS = parseFloat(v_rel).toFixed(1);

            return {
                id: `neo-${des.replace(/\s+/g, '-')}-${index}`,
                title: `Asteroid ${des} Close Approach`,
                date: dateStr,
                year: yearVal,
                time: cd.split(' ')[1] || 'TBD',
                type: 'IMPACT' as EventType, // Using IMPACT for NEOs
                description: `Near-Earth Object ${des} will pass within ${distanceAU.toFixed(4)} AU (${parseInt(distanceKm).toLocaleString()} km) of Earth at a relative velocity of ${velocityKmS} km/s.`,
                scientificExplanation: `Near-Earth Objects (NEOs) are asteroids and comets that orbit the Sun and approach Earth's orbital distance. This object has an absolute magnitude of ${h || 'unknown'}, which indicates its size. Close approaches are routinely tracked for planetary defense.`,
                visibilityRegion: 'Not visible to naked eye - Tracked by observatories',
                coordinates: [0, 0] as [number, number],
                visibilityRadius: 180
            };
        });
    } catch (error) {
        console.error('Error fetching close approaches:', error);
        return [];
    }
}

// ============================================================================
// NASA SBDB API - Comets
// Uses local API route to bypass CORS
// ============================================================================

interface SBDBQueryResponse {
    count: string;
    fields: string[];
    data: string[][];
}

export async function fetchActiveComets(): Promise<CelestialEvent[]> {
    try {
        // Use local API route to bypass CORS
        const response = await fetch('/api/celestial/comets');

        if (!response.ok) throw new Error('Failed to fetch comets');

        const data: SBDBQueryResponse = await response.json();

        if (!data.data || data.data.length === 0) return [];

        return data.data.map((row, index) => {
            const [fullname, pdes, name, period, perihelion] = row;

            return {
                id: `comet-${pdes || index}`,
                title: `Comet ${name || fullname?.split('/')[1] || 'Unknown'}`,
                date: 'Active',
                year: new Date().getFullYear(),
                time: 'Observable',
                type: 'COMET' as EventType,
                description: `${fullname} with orbital period of ~${parseFloat(period || '0').toFixed(1)} years. Perihelion distance: ${parseFloat(perihelion || '0').toFixed(2)} AU.`,
                scientificExplanation: `Comets are "dirty snowballs" of frozen gases, rock, and dust. When they approach the Sun, solar heating causes them to release gas and dust, forming spectacular tails that can stretch millions of kilometers.`,
                visibilityRegion: 'Variable - depends on current position',
                coordinates: [0, 0] as [number, number],
                visibilityRadius: 180
            };
        });
    } catch (error) {
        console.error('Error fetching comets:', error);
        return [];
    }
}

// ============================================================================
// Combined Fetch Function
// ============================================================================

export async function fetchAllLiveCelestialEvents(): Promise<CelestialEvent[]> {
    try {
        const [closeApproaches, comets] = await Promise.all([
            fetchCloseApproaches(),
            fetchActiveComets()
        ]);

        // Combine all live events
        return [...closeApproaches, ...comets];
    } catch (error) {
        console.error('Error fetching live celestial events:', error);
        return [];
    }
}
