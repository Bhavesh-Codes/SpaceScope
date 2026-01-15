export type EventType =
    | 'SOLAR_ECLIPSE'
    | 'LUNAR_ECLIPSE'
    | 'METEOR_SHOWER'
    | 'PLANETARY_TRANSIT'
    | 'COMET'
    | 'SUPERMOON'
    | 'AURORA'
    | 'ZODIAC'
    | 'CONJUNCTION';

export interface CelestialEvent {
    id: string;
    title: string;
    date: string;
    year: number;
    time: string;
    type: EventType;
    description: string;
    scientificExplanation: string;
    visibilityRegion: string;
    coordinates: [number, number];
    visibilityRadius: number;
    image?: string;
}

// ============================================================================
// EVENT TEMPLATES FOR GENERATION
// ============================================================================

const EVENT_TEMPLATES: Record<EventType, { titles: string[], descriptions: string[], explanations: string[] }> = {
    SOLAR_ECLIPSE: {
        titles: ['Total Solar Eclipse', 'Annular Solar Eclipse', 'Partial Solar Eclipse', 'Hybrid Solar Eclipse'],
        descriptions: [
            'The Moon passes between Earth and Sun, casting a shadow on Earth.',
            'A dramatic darkening of the sky as the Moon blocks the Sun.',
            'The corona becomes visible as the Moon covers the solar disk.',
            'An awe-inspiring celestial alignment visible from specific regions.'
        ],
        explanations: [
            'Solar eclipses occur when the Moon is positioned between Earth and the Sun, blocking sunlight.',
            'The Moon\'s shadow creates a path of totality where observers see complete darkness.',
            'During totality, the solar corona - the Sun\'s outer atmosphere - becomes visible.',
            'Eclipse paths are determined by the Moon\'s orbital inclination and distance from Earth.'
        ]
    },
    LUNAR_ECLIPSE: {
        titles: ['Total Lunar Eclipse', 'Partial Lunar Eclipse', 'Penumbral Lunar Eclipse', 'Blood Moon Eclipse'],
        descriptions: [
            'Earth\'s shadow falls upon the Moon, creating a reddish glow.',
            'The Moon passes through Earth\'s umbral shadow.',
            'A subtle darkening as the Moon enters Earth\'s penumbra.',
            'The Moon takes on a deep red color during totality.'
        ],
        explanations: [
            'Lunar eclipses occur when Earth passes between the Sun and Moon.',
            'The red color comes from sunlight refracted through Earth\'s atmosphere.',
            'Unlike solar eclipses, lunar eclipses are visible from anywhere on Earth\'s night side.',
            'The depth of the eclipse depends on how centrally the Moon passes through Earth\'s shadow.'
        ]
    },
    METEOR_SHOWER: {
        titles: ['Perseid Meteor Shower', 'Geminid Meteor Shower', 'Leonid Meteor Shower', 'Quadrantid Meteor Shower', 'Orionid Meteor Shower', 'Eta Aquariid Meteor Shower', 'Draconid Meteor Shower', 'Lyrid Meteor Shower', 'Taurid Meteor Shower', 'Ursid Meteor Shower'],
        descriptions: [
            'Annual meteor display with dozens of shooting stars per hour.',
            'One of the most reliable meteor showers of the year.',
            'Bright meteors streak across the night sky from the radiant point.',
            'Fast-moving meteors produce brilliant trails in the atmosphere.',
            'A spectacular display of cosmic debris entering Earth\'s atmosphere.'
        ],
        explanations: [
            'Meteor showers occur when Earth passes through debris trails left by comets.',
            'The radiant point is the apparent origin of meteors, named after constellations.',
            'Meteors burn up at altitudes of 80-120 km due to atmospheric friction.',
            'Peak activity occurs when Earth crosses the densest part of the debris stream.'
        ]
    },
    PLANETARY_TRANSIT: {
        titles: ['Mercury Transit', 'Venus Transit', 'Jupiter-Saturn Conjunction', 'Mars Opposition', 'Venus at Greatest Elongation', 'Mercury at Greatest Elongation', 'Jupiter Opposition', 'Saturn Opposition', 'Neptune Opposition', 'Uranus Opposition'],
        descriptions: [
            'A rare planetary alignment visible from Earth.',
            'An inner planet crosses the face of the Sun.',
            'Two planets appear exceptionally close in the sky.',
            'A planet reaches its closest approach to Earth.',
            'Optimal viewing conditions for planetary observation.'
        ],
        explanations: [
            'Planetary transits occur when inner planets pass between Earth and the Sun.',
            'Conjunctions happen when planets appear close together from Earth\'s perspective.',
            'Opposition occurs when an outer planet is opposite the Sun, at its closest to Earth.',
            'These events are determined by the orbital mechanics of our solar system.'
        ]
    },
    COMET: {
        titles: ['Great Comet Apparition', 'Periodic Comet Return', 'New Comet Discovery', 'Bright Comet Observation', 'Comet Perihelion Passage'],
        descriptions: [
            'A bright comet graces the night sky with its luminous tail.',
            'A periodic visitor returns to the inner solar system.',
            'A newly discovered comet becomes visible to observers.',
            'A magnificent comet displays both dust and gas tails.',
            'A comet reaches its closest approach to the Sun.'
        ],
        explanations: [
            'Comets are icy bodies that develop tails when heated by the Sun.',
            'The dust tail curves away from the Sun due to orbital motion.',
            'The gas tail always points directly away from the Sun due to solar wind.',
            'Periodic comets have predictable orbits; non-periodic comets may never return.'
        ]
    },
    SUPERMOON: {
        titles: ['Super Full Moon', 'Perigee Moon', 'Giant Moon', 'Closest Full Moon'],
        descriptions: [
            'The Moon appears larger and brighter at perigee.',
            'An unusually large full moon illuminates the night.',
            'The closest full moon of the year creates a spectacular sight.',
            'Enhanced tidal effects accompany this closer lunar approach.'
        ],
        explanations: [
            'Supermoons occur when a full moon coincides with lunar perigee.',
            'The Moon can appear up to 14% larger and 30% brighter than at apogee.',
            'The term "supermoon" was coined in 1979 by astrologer Richard Nolle.',
            'Supermoons can affect ocean tides more than average full moons.'
        ]
    },
    AURORA: {
        titles: ['Aurora Borealis Display', 'Northern Lights Storm', 'Geomagnetic Storm Aurora', 'Solar Flare Aurora', 'Auroral Substorm'],
        descriptions: [
            'Dancing lights illuminate the polar skies.',
            'Brilliant auroral displays visible at lower latitudes.',
            'Solar activity creates exceptional northern lights.',
            'Vivid colors paint the night sky in greens and reds.',
            'An intense geomagnetic event produces spectacular auroras.'
        ],
        explanations: [
            'Auroras occur when solar wind particles interact with atmospheric gases.',
            'Green auroras result from oxygen at lower altitudes; red from higher oxygen.',
            'Strong solar flares and coronal mass ejections enhance auroral activity.',
            'The auroral oval expands during geomagnetic storms, reaching lower latitudes.'
        ]
    },
    ZODIAC: {
        titles: ['Zodiacal Light Peak', 'Gegenschein Observation', 'Zodiacal Band Visibility', 'False Dawn'],
        descriptions: [
            'A faint glow extends along the ecliptic before dawn or after dusk.',
            'The gegenschein appears as a faint glow opposite the Sun.',
            'Optimal conditions for observing interplanetary dust.',
            'Ancient skywatchers mistook this for an early sunrise.'
        ],
        explanations: [
            'Zodiacal light is caused by sunlight scattering off interplanetary dust.',
            'This dust originates from comets and asteroid collisions.',
            'Best observed from dark locations when the ecliptic is steep.',
            'The gegenschein is brightest because dust particles backscatter light.'
        ]
    },
    CONJUNCTION: {
        titles: ['Great Conjunction', 'Planetary Alignment', 'Triple Conjunction', 'Moon-Planet Conjunction', 'Planetary Grouping'],
        descriptions: [
            'Multiple planets appear close together in the sky.',
            'A rare alignment creates a celestial spectacle.',
            'Planets and the Moon gather in a small area of sky.',
            'An ancient-style conjunction recalls historical observations.',
            'Several bright objects create a memorable sky scene.'
        ],
        explanations: [
            'Conjunctions occur due to the relative orbital motions of planets.',
            'Great conjunctions of Jupiter and Saturn occur every 20 years.',
            'Apparent close approaches do not mean actual proximity in space.',
            'Ancient astronomers tracked conjunctions for omens and calendars.'
        ]
    }
};

// Only 4 regions as requested: USA, India, Iceland, Antarctica
const REGIONS = [
    { name: 'United States of America', coords: [38, -97] as [number, number], radius: 40 },
    { name: 'India', coords: [20, 78] as [number, number], radius: 25 },
    { name: 'Iceland', coords: [65, -18] as [number, number], radius: 10 },
    { name: 'Antarctica', coords: [-75, 0] as [number, number], radius: 30 },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

// Generate events for each year - 5 events per region = 20 total
function generateEventsForYear(year: number): CelestialEvent[] {
    const events: CelestialEvent[] = [];
    const random = seededRandom(year);

    const eventTypes: EventType[] = ['SOLAR_ECLIPSE', 'LUNAR_ECLIPSE', 'METEOR_SHOWER', 'PLANETARY_TRANSIT', 'COMET', 'SUPERMOON', 'AURORA', 'ZODIAC', 'CONJUNCTION'];

    // Generate 5 events per region (4 regions × 5 = 20 events per year)
    for (let regionIdx = 0; regionIdx < REGIONS.length; regionIdx++) {
        const region = REGIONS[regionIdx];

        for (let i = 0; i < 5; i++) {
            const typeIndex = Math.floor(random() * eventTypes.length);
            const type = eventTypes[typeIndex];
            const template = EVENT_TEMPLATES[type];

            const titleIndex = Math.floor(random() * template.titles.length);
            const descIndex = Math.floor(random() * template.descriptions.length);
            const explIndex = Math.floor(random() * template.explanations.length);

            const month = Math.floor(random() * 12);
            const day = Math.floor(random() * 28) + 1;
            const hour = Math.floor(random() * 24);
            const minute = Math.floor(random() * 60);

            // Add slight variation to coordinates within the region
            const latOffset = (random() - 0.5) * 10;
            const lngOffset = (random() - 0.5) * 15;

            events.push({
                id: `${type.toLowerCase()}-${year}-${region.name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
                title: `${template.titles[titleIndex]} ${year}`,
                date: `${MONTHS[month]} ${day}, ${year}`,
                year,
                time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} UTC`,
                type,
                description: template.descriptions[descIndex],
                scientificExplanation: template.explanations[explIndex],
                visibilityRegion: region.name,
                coordinates: [
                    Math.max(-85, Math.min(85, region.coords[0] + latOffset)),
                    Math.max(-180, Math.min(180, region.coords[1] + lngOffset))
                ],
                visibilityRadius: Math.max(10, region.radius - Math.floor(random() * 10))
            });
        }
    }

    return events;
}

// Generate all events from 1850 to 2030
function generateAllEvents(): CelestialEvent[] {
    const allEvents: CelestialEvent[] = [];

    for (let year = 1850; year <= 2030; year++) {
        allEvents.push(...generateEventsForYear(year));
    }

    return allEvents;
}

// ============================================================================
// GENERATED CELESTIAL EVENTS (1850-2030) - 20 events per year
// ============================================================================

export const CELESTIAL_EVENTS: CelestialEvent[] = generateAllEvents();

// Pre-compute events by year for O(1) lookups
const EVENTS_BY_YEAR: Map<number, CelestialEvent[]> = new Map();
CELESTIAL_EVENTS.forEach(event => {
    if (!EVENTS_BY_YEAR.has(event.year)) {
        EVENTS_BY_YEAR.set(event.year, []);
    }
    EVENTS_BY_YEAR.get(event.year)!.push(event);
});

// Helper to get unique years from events
export const getEventYears = (): number[] => {
    return Array.from(EVENTS_BY_YEAR.keys()).sort((a, b) => a - b);
};

// Helper to filter events by year - O(1) lookup
export const getEventsByYear = (year: number): CelestialEvent[] => {
    return EVENTS_BY_YEAR.get(year) || [];
};

// Filter events by country/region
export const getEventsByRegion = (region: string): CelestialEvent[] => {
    return CELESTIAL_EVENTS.filter(e =>
        e.visibilityRegion.toLowerCase().includes(region.toLowerCase()) ||
        e.visibilityRegion === 'Global'
    );
};

export const EVENT_ICONS: Record<EventType, string> = {
    SOLAR_ECLIPSE: "🌑",
    LUNAR_ECLIPSE: "🌕",
    METEOR_SHOWER: "☄️",
    PLANETARY_TRANSIT: "🪐",
    COMET: "☄️",
    SUPERMOON: "🌕",
    AURORA: "✨",
    ZODIAC: "♎",
    CONJUNCTION: "⭐"
};

export const EVENT_COLORS: Record<EventType, string> = {
    SOLAR_ECLIPSE: "#FDB813",
    LUNAR_ECLIPSE: "#FF4500",
    METEOR_SHOWER: "#00BFFF",
    PLANETARY_TRANSIT: "#FF69B4",
    COMET: "#00CED1",
    SUPERMOON: "#F0E68C",
    AURORA: "#32CD32",
    ZODIAC: "#9370DB",
    CONJUNCTION: "#FFD700"
};
