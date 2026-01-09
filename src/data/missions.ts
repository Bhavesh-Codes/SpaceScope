export interface Mission {
    id: string;
    name: string;
    agency: string;
    year: string;
    status: 'Success' | 'Ongoing' | 'Planned' | 'Partial Success';
    description: string;
    details: string; // Formatting for the Bento Grid
    image: string;
    color: string; // For accents
    target: string;
}

export const MISSIONS: Mission[] = [
    // --- LEGENDS (Past/Classic) ---
    {
        id: 'sputnik-1',
        name: 'Sputnik 1',
        agency: 'USSR',
        year: '1957',
        status: 'Success',
        description: 'The first artificial satellite to orbit Earth.',
        details: 'Launched by the Soviet Union on October 4, 1957, it orbited for three weeks before its batteries died, triggering the Space Race.',
        image: '/missions/sputnik1.png',
        color: 'text-gray-400',
        target: 'Earth Orbit'
    },
    {
        id: 'vostok-1',
        name: 'Vostok 1',
        agency: 'USSR',
        year: '1961',
        status: 'Success',
        description: 'First human in outer space.',
        details: 'Yuri Gagarin became the first human to journey into outer space, completing one orbit of Earth on April 12, 1961.',
        image: '/missions/vostok1.png',
        color: 'text-red-500',
        target: 'Earth Orbit'
    },
    {
        id: 'apollo-11',
        name: 'Apollo 11',
        agency: 'NASA',
        year: '1969',
        status: 'Success',
        description: 'The first crewed mission to land on the Moon.',
        details: 'Neil Armstrong and Buzz Aldrin formed the American crew that landed the Apollo Lunar Module Eagle on July 20, 1969. It remains one of humanity\'s greatest achievements.',
        image: '/missions/apollo11.png',
        color: 'text-blue-400',
        target: 'Moon'
    },
    {
        id: 'voyager-1',
        name: 'Voyager 1',
        agency: 'NASA',
        year: '1977',
        status: 'Ongoing',
        description: 'Farthest human-made object in space.',
        details: 'Voyager 1 has now crossed the heliopause and entered interstellar space. It carries a Golden Record containing sounds and images of Earth.',
        image: '/missions/voyager1.png',
        color: 'text-yellow-500',
        target: 'Interstellar'
    },
    {
        id: 'chandrayaan-1',
        name: 'Chandrayaan-1',
        agency: 'ISRO',
        year: '2008',
        status: 'Success',
        description: 'Discovery of water molecules on the Moon.',
        details: 'India\'s first lunar probe. The Moon Impact Probe separated from the orbiter and struck the south pole in a controlled manner, confirming the presence of water ice.',
        image: '/missions/chandrayaan1.png',
        color: 'text-orange-500',
        target: 'Moon'
    },

    // --- FRONTIERS (Modern/Active) ---
    {
        id: 'iss',
        name: 'ISS',
        agency: 'International',
        year: '1998–Present',
        status: 'Ongoing',
        description: 'Longest continuous human space presence.',
        details: 'A modular space station in low Earth orbit. It is a multinational collaborative project involving five space agencies: NASA, Roscosmos, JAXA, ESA, and CSA.',
        image: '/missions/iss.png',
        color: 'text-white',
        target: 'Earth Orbit'
    },
    {
        id: 'mangalyaan',
        name: 'Mangalyaan (MOM)',
        agency: 'ISRO',
        year: '2013',
        status: 'Success',
        description: 'India\'s first interplanetary mission to Mars.',
        details: 'The Mars Orbiter Mission (MOM) made India the first Asian nation to reach Martian orbit and the first nation in the world to do so on its maiden attempt.',
        image: '/missions/mangalyaan.png',
        color: 'text-orange-500',
        target: 'Mars'
    },
    {
        id: 'jwst',
        name: 'James Webb Telescope',
        agency: 'NASA / ESA',
        year: '2021',
        status: 'Ongoing',
        description: 'Observing the infrared universe & early galaxies.',
        details: 'The largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for the Hubble Space Telescope.',
        image: '/missions/jwst.png',
        color: 'text-yellow-400',
        target: 'Lagrange Point 2'
    },
    {
        id: 'chandrayaan-3',
        name: 'Chandrayaan-3',
        agency: 'ISRO',
        year: '2023',
        status: 'Success',
        description: 'First successful landing on the lunar south pole.',
        details: 'This mission demonstrated India\'s capability for safe landing and roving on the lunar surface. The Vikram lander and Pragyan rover conducted in-situ scientific experiments.',
        image: '/missions/chandrayaan3.png',
        color: 'text-yellow-400',
        target: 'Moon'
    },
    {
        id: 'aditya-l1',
        name: 'Aditya-L1',
        agency: 'ISRO',
        year: '2023',
        status: 'Ongoing',
        description: 'India\'s first dedicated solar observatory.',
        details: 'Placed at Lagrange Point 1 (L1), it observes the Sun\'s photosphere, chromosphere, and corona to study solar activities and their effect on space weather.',
        image: '/missions/adityal1.png',
        color: 'text-yellow-600',
        target: 'Sun (L1)'
    },

    // --- HORIZONS (Future) ---
    {
        id: 'gaganyaan',
        name: 'Gaganyaan',
        agency: 'ISRO',
        year: '2025 (Planned)',
        status: 'Planned',
        description: 'India\'s first human spaceflight mission.',
        details: 'Gaganyaan envisages demonstration of human spaceflight capability by launching a crew of 3 members to an orbit of 400 km for a 3-day mission and bringing them back safely to Earth.',
        image: '/missions/gaganyaan.png',
        color: 'text-orange-400',
        target: 'Earth Orbit'
    },
    {
        id: 'artemis',
        name: 'Artemis Program',
        agency: 'NASA',
        year: '2025+',
        status: 'Ongoing',
        description: 'Returning humans to the Moon to stay.',
        details: 'The Artemis program aims to land the first woman and first person of color on the Moon, establishing a sustainable presence to prepare for missions to Mars.',
        image: '/missions/artemis.png',
        color: 'text-indigo-400',
        target: 'Moon/Mars'
    }
];
