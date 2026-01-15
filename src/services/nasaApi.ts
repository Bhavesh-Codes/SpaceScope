// NASA DONKI API Service - Client-side fetching from server-side cached routes
// The actual NASA API calls and Redis caching happen in the server-side API routes

export interface SolarFlare {
    flrID: string;
    classType: string;
    sourceLocation: string;
    beginTime: string;
    peakTime: string;
    endTime: string;
    activeRegionNum: number;
}

export interface CMEEvent {
    activityID: string;
    startTime: string;
    sourceLocation: string;
    note: string;
    cmeAnalyses?: Array<{
        speed: number;
        type: string;
        latitude: number;
        longitude: number;
        halfAngle: number;
    }>;
}

export interface RadiationEvent {
    sepID: string;
    eventTime: string;
    instruments?: Array<{ displayName: string }>;
    linkedEvents?: Array<{ activityID: string }>;
}

export interface GeomagneticStorm {
    gstID: string;
    startTime: string;
    allKpIndex?: Array<{
        observedTime: string;
        kpIndex: number;
        source: string;
    }>;
    linkedEvents?: Array<{ activityID: string }>;
}

// Fetch from local API routes (which handle caching and NASA API calls)
export async function fetchSolarFlares(): Promise<SolarFlare[]> {
    try {
        const response = await fetch('/api/cosmic-weather/solar-flares');
        const json = await response.json();
        if (json.cached) {
            console.log('✓ Solar flares from cache');
        }
        return json.data || [];
    } catch (error) {
        console.error('Error fetching solar flares:', error);
        return [];
    }
}

export async function fetchCMEEvents(): Promise<CMEEvent[]> {
    try {
        const response = await fetch('/api/cosmic-weather/cme');
        const json = await response.json();
        if (json.cached) {
            console.log('✓ CME events from cache');
        }
        return json.data || [];
    } catch (error) {
        console.error('Error fetching CME events:', error);
        return [];
    }
}

export async function fetchRadiationEvents(): Promise<RadiationEvent[]> {
    // Radiation events are less frequent, keep in-memory fallback
    return [];
}

export async function fetchGeomagneticStorms(): Promise<GeomagneticStorm[]> {
    try {
        const response = await fetch('/api/cosmic-weather/geomagnetic-storms');
        const json = await response.json();
        if (json.cached) {
            console.log('✓ Geomagnetic storms from cache');
        }
        return json.data || [];
    } catch (error) {
        console.error('Error fetching geomagnetic storms:', error);
        return [];
    }
}

// Prefetch all data in parallel
export async function prefetchAllCosmicWeather(): Promise<void> {
    await Promise.all([
        fetchSolarFlares(),
        fetchCMEEvents(),
        fetchGeomagneticStorms()
    ]);
}

// Helper to convert Kp index to G-scale storm level
export function kpToGScale(kpIndex: number): string {
    if (kpIndex >= 9) return 'G5';
    if (kpIndex >= 8) return 'G4';
    if (kpIndex >= 7) return 'G3';
    if (kpIndex >= 6) return 'G2';
    if (kpIndex >= 5) return 'G1';
    return 'G0';
}

// Helper to convert solar flare class to numeric value for charting
export function flareClassToValue(classType: string): number {
    if (!classType) return 0;
    const letter = classType.charAt(0).toUpperCase();
    const number = parseFloat(classType.slice(1)) || 1;

    const baseValues: Record<string, number> = {
        'A': 1,
        'B': 10,
        'C': 100,
        'M': 1000,
        'X': 10000
    };

    return (baseValues[letter] || 1) * number;
}
