// Eclipse Data - Static visibility paths for 2024-2030
// Path coordinates represent the centerline of totality/annularity

export type EclipseType = 'Total' | 'Annular' | 'Partial' | 'Hybrid';

export interface EclipseEvent {
    id: string;
    date: string;
    type: EclipseType;
    title: string;
    description: string;
    maxDuration: string;      // e.g., "4m 28s"
    magnitude: number;        // 1.0+ for total, <1.0 for annular
    path: [number, number][]; // [lat, lng] path of totality/annularity
    visibleFrom: string[];    // Countries/regions with best visibility
    peakTime: string;         // UTC time of greatest eclipse
    sarosNumber: number;      // Saros cycle number
}

// Solar eclipse visibility paths 2024-2030
// Sources: NASA Eclipse Web, TimeAndDate
export const SOLAR_ECLIPSES: EclipseEvent[] = [
    // 2024
    {
        id: 'solar-2024-04-08',
        date: '2024-04-08',
        type: 'Total',
        title: 'Great North American Eclipse',
        description: 'A spectacular total solar eclipse crossing Mexico, the United States, and Canada. One of the most observed eclipses in history.',
        maxDuration: '4m 28s',
        magnitude: 1.0566,
        peakTime: '18:17 UTC',
        sarosNumber: 139,
        visibleFrom: ['Mexico', 'United States', 'Canada'],
        path: [
            [18.4, -105.5], // Pacific entry
            [19.8, -104.1], // Mazatlán, Mexico
            [21.3, -102.3], // Durango
            [23.1, -100.0], // Monclova
            [25.9, -97.5],  // Texas border
            [29.4, -95.4],  // Houston area
            [32.8, -91.2],  // Arkansas
            [36.2, -86.8],  // Nashville
            [39.8, -83.0],  // Ohio
            [42.3, -79.5],  // Buffalo
            [44.3, -76.5],  // Montreal
            [46.5, -71.2],  // Quebec
            [47.5, -66.2],  // New Brunswick
            [44.6, -63.6],  // Nova Scotia
        ]
    },
    {
        id: 'solar-2024-10-02',
        date: '2024-10-02',
        type: 'Annular',
        title: 'Pacific & South American Annular Eclipse',
        description: 'An annular eclipse visible from the Pacific Ocean, Chile, and Argentina.',
        maxDuration: '7m 25s',
        magnitude: 0.9326,
        peakTime: '18:45 UTC',
        sarosNumber: 144,
        visibleFrom: ['Chile', 'Argentina', 'Pacific Ocean'],
        path: [
            [-12.0, -130.5],  // Pacific
            [-18.5, -115.0],  // Easter Island region
            [-25.0, -95.0],   // Pacific
            [-38.5, -72.0],   // Chile
            [-42.0, -71.5],   // Argentina
            [-45.5, -68.0],   // Patagonia
            [-48.0, -65.5],   // Southern Argentina
        ]
    },
    // 2025
    {
        id: 'solar-2025-03-29',
        date: '2025-03-29',
        type: 'Partial',
        title: 'North Atlantic Partial Eclipse',
        description: 'A partial solar eclipse visible from Europe, northern Africa, and North America.',
        maxDuration: 'N/A',
        magnitude: 0.9376,
        peakTime: '10:47 UTC',
        sarosNumber: 149,
        visibleFrom: ['Iceland', 'Greenland', 'Western Europe', 'Northwest Africa', 'Eastern North America'],
        path: [] // Partial eclipses don't have a path of totality
    },
    {
        id: 'solar-2025-09-21',
        date: '2025-09-21',
        type: 'Partial',
        title: 'South Pacific Partial Eclipse',
        description: 'A partial solar eclipse visible from New Zealand, Antarctica, and the Pacific.',
        maxDuration: 'N/A',
        magnitude: 0.855,
        peakTime: '19:42 UTC',
        sarosNumber: 154,
        visibleFrom: ['New Zealand', 'Antarctica', 'South Pacific'],
        path: []
    },
    // 2026
    {
        id: 'solar-2026-02-17',
        date: '2026-02-17',
        type: 'Annular',
        title: 'Antarctic Annular Eclipse',
        description: 'An annular eclipse with the path crossing Antarctica and the southern oceans.',
        maxDuration: '2m 20s',
        magnitude: 0.9649,
        peakTime: '12:12 UTC',
        sarosNumber: 121,
        visibleFrom: ['Antarctica', 'Southern Argentina', 'Chile'],
        path: [
            [-75.0, -30.0],  // Antarctica
            [-70.0, -45.0],
            [-65.0, -55.0],  // Drake Passage
            [-55.0, -67.0],  // Southern Chile
        ]
    },
    {
        id: 'solar-2026-08-12',
        date: '2026-08-12',
        type: 'Total',
        title: 'Arctic & European Total Eclipse',
        description: 'A total solar eclipse visible from Greenland, Iceland, Spain, and North Africa. The path of totality crosses over the Arctic and into Europe.',
        maxDuration: '2m 18s',
        magnitude: 1.0386,
        peakTime: '17:46 UTC',
        sarosNumber: 126,
        visibleFrom: ['Greenland', 'Iceland', 'Spain', 'Portugal', 'Morocco', 'Algeria'],
        path: [
            [65.0, -50.0],   // Greenland
            [66.5, -40.0],   // North Atlantic
            [65.0, -25.0],   // Iceland
            [62.0, -15.0],   // Norwegian Sea
            [55.0, -5.0],    // North Sea
            [45.0, -6.0],    // Bay of Biscay
            [42.5, -8.0],    // Galicia, Spain
            [40.0, -5.5],    // Central Spain
            [38.5, -4.5],    // Southern Spain
            [35.8, -5.5],    // Strait of Gibraltar
            [33.0, -6.0],    // Morocco
            [30.0, -4.5],    // Morocco
            [26.0, -2.0],    // Western Sahara/Mauritania
        ]
    },
    // 2027
    {
        id: 'solar-2027-02-06',
        date: '2027-02-06',
        type: 'Annular',
        title: 'South American Annular Eclipse',
        description: 'An annular eclipse crossing Chile, Argentina, and the South Atlantic.',
        maxDuration: '7m 51s',
        magnitude: 0.9281,
        peakTime: '16:00 UTC',
        sarosNumber: 131,
        visibleFrom: ['Chile', 'Argentina', 'Uruguay', 'South Atlantic'],
        path: [
            [-33.0, -71.5],  // Central Chile
            [-34.5, -70.5],  // Chile/Argentina border
            [-35.0, -68.0],  // Mendoza area
            [-35.5, -62.0],  // La Pampa
            [-35.8, -58.0],  // Buenos Aires area
            [-35.0, -55.0],  // Uruguay
            [-34.0, -52.0],  // South Atlantic
        ]
    },
    {
        id: 'solar-2027-08-02',
        date: '2027-08-02',
        type: 'Total',
        title: 'African & Arabian Total Eclipse',
        description: 'A spectacular total solar eclipse with over 6 minutes of totality, crossing North Africa and the Arabian Peninsula.',
        maxDuration: '6m 23s',
        magnitude: 1.0790,
        peakTime: '10:07 UTC',
        sarosNumber: 136,
        visibleFrom: ['Morocco', 'Spain', 'Algeria', 'Tunisia', 'Libya', 'Egypt', 'Saudi Arabia', 'Yemen'],
        path: [
            [36.5, -9.0],    // Atlantic near Portugal
            [36.0, -5.5],    // Strait of Gibraltar
            [35.5, -3.0],    // Morocco/Algeria
            [33.0, 0.0],     // Algeria
            [32.0, 5.0],     // Algeria
            [30.5, 10.0],    // Tunisia/Libya border
            [29.5, 15.0],    // Libya
            [27.5, 22.0],    // Egypt
            [26.0, 30.0],    // Luxor area
            [24.5, 35.0],    // Red Sea
            [22.0, 40.0],    // Saudi Arabia
            [18.0, 45.0],    // Yemen
            [15.0, 50.0],    // Gulf of Aden
        ]
    },
    // 2028
    {
        id: 'solar-2028-01-26',
        date: '2028-01-26',
        type: 'Annular',
        title: 'South American Annular Eclipse',
        description: 'An annular eclipse visible from South America.',
        maxDuration: '10m 27s',
        magnitude: 0.9208,
        peakTime: '15:08 UTC',
        sarosNumber: 141,
        visibleFrom: ['Ecuador', 'Peru', 'Brazil', 'Suriname', 'French Guiana'],
        path: [
            [-5.0, -81.0],   // Ecuador coast
            [-6.0, -77.0],   // Northern Peru
            [-5.5, -72.0],   // Amazon
            [-3.0, -65.0],   // Brazil Amazon
            [0.0, -55.0],    // Northern Brazil
            [4.0, -52.0],    // French Guiana
        ]
    },
    {
        id: 'solar-2028-07-22',
        date: '2028-07-22',
        type: 'Total',
        title: 'Australian Total Eclipse',
        description: 'A total solar eclipse visible from Australia and New Zealand.',
        maxDuration: '5m 10s',
        magnitude: 1.0564,
        peakTime: '02:55 UTC',
        sarosNumber: 146,
        visibleFrom: ['Australia', 'New Zealand'],
        path: [
            [-22.0, 115.0],  // Western Australia
            [-24.0, 120.0],  // Central Australia
            [-26.0, 130.0],  // Northern Territory/SA
            [-28.5, 140.0],  // South Australia
            [-32.0, 150.0],  // Sydney area
            [-35.0, 155.0],  // Tasman Sea
            [-40.0, 165.0],  // New Zealand North
            [-42.0, 175.0],  // New Zealand South
        ]
    },
    // 2029
    {
        id: 'solar-2029-01-14',
        date: '2029-01-14',
        type: 'Partial',
        title: 'North American Partial Eclipse',
        description: 'A partial solar eclipse visible from North America.',
        maxDuration: 'N/A',
        magnitude: 0.871,
        peakTime: '17:13 UTC',
        sarosNumber: 151,
        visibleFrom: ['Canada', 'United States', 'Mexico'],
        path: []
    },
    {
        id: 'solar-2029-06-12',
        date: '2029-06-12',
        type: 'Partial',
        title: 'Arctic Partial Eclipse',
        description: 'A partial solar eclipse visible from the Arctic regions.',
        maxDuration: 'N/A',
        magnitude: 0.458,
        peakTime: '04:06 UTC',
        sarosNumber: 118,
        visibleFrom: ['Arctic', 'Alaska', 'Northern Canada', 'Greenland', 'Iceland', 'Scandinavia'],
        path: []
    },
    {
        id: 'solar-2029-07-11',
        date: '2029-07-11',
        type: 'Partial',
        title: 'Antarctic Partial Eclipse',
        description: 'A partial solar eclipse visible from the Southern Hemisphere.',
        maxDuration: 'N/A',
        magnitude: 0.230,
        peakTime: '15:36 UTC',
        sarosNumber: 156,
        visibleFrom: ['Chile', 'Argentina', 'Antarctica'],
        path: []
    },
    {
        id: 'solar-2029-12-05',
        date: '2029-12-05',
        type: 'Partial',
        title: 'South Pacific Partial Eclipse',
        description: 'A partial solar eclipse visible from the South Pacific and Antarctica.',
        maxDuration: 'N/A',
        magnitude: 0.891,
        peakTime: '15:03 UTC',
        sarosNumber: 161,
        visibleFrom: ['Chile', 'Argentina', 'Antarctica', 'South Pacific'],
        path: []
    },
    // 2030
    {
        id: 'solar-2030-06-01',
        date: '2030-06-01',
        type: 'Annular',
        title: 'North African & Asian Annular Eclipse',
        description: 'An annular eclipse crossing North Africa, the Middle East, and Asia.',
        maxDuration: '5m 21s',
        magnitude: 0.9443,
        peakTime: '06:29 UTC',
        sarosNumber: 128,
        visibleFrom: ['Algeria', 'Tunisia', 'Libya', 'Greece', 'Turkey', 'Russia', 'China', 'Japan'],
        path: [
            [35.0, 0.0],     // Algeria
            [36.0, 10.0],    // Tunisia
            [35.0, 20.0],    // Libya/Mediterranean
            [37.0, 28.0],    // Turkey
            [42.0, 40.0],    // Georgia
            [48.0, 55.0],    // Kazakhstan
            [52.0, 80.0],    // Russia
            [50.0, 100.0],   // Russia/Mongolia
            [45.0, 120.0],   // China
            [40.0, 130.0],   // Korea
            [35.0, 140.0],   // Japan
        ]
    },
    {
        id: 'solar-2030-11-25',
        date: '2030-11-25',
        type: 'Total',
        title: 'African Total Eclipse',
        description: 'A total solar eclipse crossing Southern Africa and the Indian Ocean.',
        maxDuration: '3m 43s',
        magnitude: 1.0471,
        peakTime: '06:50 UTC',
        sarosNumber: 133,
        visibleFrom: ['Botswana', 'South Africa', 'Mozambique', 'Australia'],
        path: [
            [-25.0, 20.0],   // Namibia/Botswana
            [-26.0, 25.0],   // Botswana
            [-27.0, 30.0],   // South Africa
            [-26.0, 35.0],   // Indian Ocean
            [-22.0, 50.0],   // Madagascar
            [-18.0, 70.0],   // Indian Ocean
            [-15.0, 100.0],  // Indian Ocean
            [-18.0, 120.0],  // Western Australia
        ]
    },
];

// Lunar eclipses 2024-2030
export const LUNAR_ECLIPSES: EclipseEvent[] = [
    // 2024
    {
        id: 'lunar-2024-03-25',
        date: '2024-03-25',
        type: 'Partial',
        title: 'Penumbral Lunar Eclipse',
        description: 'A subtle penumbral lunar eclipse visible from the Americas.',
        maxDuration: 'N/A',
        magnitude: -0.132,
        peakTime: '07:12 UTC',
        sarosNumber: 113,
        visibleFrom: ['Americas', 'Western Europe', 'Western Africa'],
        path: []
    },
    {
        id: 'lunar-2024-09-18',
        date: '2024-09-18',
        type: 'Partial',
        title: 'Partial Lunar Eclipse',
        description: 'A partial lunar eclipse with a small portion of the Moon entering Earth\'s umbra.',
        maxDuration: '1h 03m',
        magnitude: 0.085,
        peakTime: '02:44 UTC',
        sarosNumber: 118,
        visibleFrom: ['Americas', 'Europe', 'Africa', 'Western Asia'],
        path: []
    },
    // 2025
    {
        id: 'lunar-2025-03-14',
        date: '2025-03-14',
        type: 'Total',
        title: 'Total Lunar Eclipse',
        description: 'A total lunar eclipse visible from the Americas, featuring a deep red "Blood Moon".',
        maxDuration: '1h 05m',
        magnitude: 1.178,
        peakTime: '06:58 UTC',
        sarosNumber: 123,
        visibleFrom: ['North America', 'South America', 'Western Europe', 'Western Africa'],
        path: []
    },
    {
        id: 'lunar-2025-09-07',
        date: '2025-09-07',
        type: 'Total',
        title: 'Total Lunar Eclipse',
        description: 'A total lunar eclipse visible from Europe, Africa, and Asia.',
        maxDuration: '1h 22m',
        magnitude: 1.362,
        peakTime: '18:11 UTC',
        sarosNumber: 128,
        visibleFrom: ['Europe', 'Africa', 'Asia', 'Australia'],
        path: []
    },
    // 2026
    {
        id: 'lunar-2026-03-03',
        date: '2026-03-03',
        type: 'Total',
        title: 'Total Lunar Eclipse',
        description: 'A total lunar eclipse visible from the Pacific region and the Americas.',
        maxDuration: '58m',
        magnitude: 1.151,
        peakTime: '11:33 UTC',
        sarosNumber: 133,
        visibleFrom: ['East Asia', 'Australia', 'Pacific', 'Americas'],
        path: []
    },
    {
        id: 'lunar-2026-08-28',
        date: '2026-08-28',
        type: 'Partial',
        title: 'Partial Lunar Eclipse',
        description: 'A partial lunar eclipse visible from most of the world.',
        maxDuration: '3h 18m',
        magnitude: 0.930,
        peakTime: '04:13 UTC',
        sarosNumber: 138,
        visibleFrom: ['Americas', 'Europe', 'Africa', 'Asia', 'Australia'],
        path: []
    },
];

// Helper to get upcoming eclipses
export function getUpcomingEclipses(fromDate: Date = new Date()): EclipseEvent[] {
    const allEclipses = [...SOLAR_ECLIPSES, ...LUNAR_ECLIPSES];
    return allEclipses
        .filter(e => new Date(e.date) >= fromDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper to get eclipses by year
export function getEclipsesByYear(year: number): EclipseEvent[] {
    const allEclipses = [...SOLAR_ECLIPSES, ...LUNAR_ECLIPSES];
    return allEclipses
        .filter(e => new Date(e.date).getFullYear() === year)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper to check if an eclipse is solar
export function isSolarEclipse(eclipse: EclipseEvent): boolean {
    return eclipse.id.startsWith('solar-');
}

// Get eclipse type color
export function getEclipseTypeColor(type: EclipseType): string {
    switch (type) {
        case 'Total': return '#ff6b6b';
        case 'Annular': return '#ffd93d';
        case 'Partial': return '#6bcbff';
        case 'Hybrid': return '#c084fc';
        default: return '#ffffff';
    }
}

// Get eclipse type icon (for visualization)
export function getEclipseTypeDescription(type: EclipseType): string {
    switch (type) {
        case 'Total': return 'Moon completely covers the Sun, revealing the corona';
        case 'Annular': return 'Moon covers the Sun\'s center, leaving a bright ring';
        case 'Partial': return 'Moon covers only part of the Sun';
        case 'Hybrid': return 'Eclipse shifts between total and annular along its path';
        default: return '';
    }
}
