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
    category: 'Past' | 'Current' | 'Future';
    detailedDescription: string;
    stats: { label: string; value: string }[];
    rocket?: string;
    launchSite?: string;
    launchDate?: string;
    timeline?: { year: string; title: string; description: string }[];
}

export const MISSIONS: Mission[] = [
    // --- PAST ---
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
        target: 'Earth Orbit',
        category: 'Past',
        detailedDescription: 'Sputnik 1 was the first artificial Earth satellite. The Soviet Union launched it into an elliptical low Earth orbit on 4 October 1957. It orbited for three weeks before its three silver-zinc batteries ran out. The satellite was a 58 cm (23 in) diameter polished metal sphere, with four external radio antennas.',
        stats: [
            { label: 'Launch Mass', value: '83.6 kg' },
            { label: 'Orbit Height', value: '215 km - 939 km' },
            { label: 'Orbital Period', value: '96.2 minutes' }
        ],
        rocket: 'Sputnik 8K71PS',
        launchSite: 'Baikonur Cosmodrome, Site 1/5',
        launchDate: 'October 4, 1957',
        timeline: [
            { year: '1957', title: 'Launch', description: 'Launched successfully into elliptical Low Earth Orbit.' },
            { year: '1957', title: 'Battery Depletion', description: 'Transmitter stopped working after 3 weeks.' },
            { year: '1958', title: 'Re-entry', description: 'Burned up in the atmosphere on 4 January 1958.' }
        ]
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
        target: 'Earth Orbit',
        category: 'Past',
        detailedDescription: 'Vostok 1 was the first spaceflight of the Vostok programme and the first human spaceflight in history. The Vostok 3KA space capsule was launched from Baikonur Cosmodrome on April 12, 1961, with Soviet cosmonaut Yuri Gagarin aboard, making him the first human to cross into outer space.',
        stats: [
            { label: 'Crew', value: 'Yuri Gagarin' },
            { label: 'Flight Time', value: '108 minutes' },
            { label: 'Max Altitude', value: '327 km' }
        ],
        rocket: 'Vostok-K 8K72K',
        launchSite: 'Baikonur Cosmodrome, Site 1/5',
        launchDate: 'April 12, 1961',
        timeline: [
            { year: '1961', title: 'Liftoff', description: 'Launched from Baikonur Cosmodrome.' },
            { year: '1961', title: 'Orbit', description: 'Completed one orbit around Earth.' },
            { year: '1961', title: 'Landing', description: 'Gagarin ejected and parachuted to safety.' }
        ]
    },
    {
        id: 'apollo-11',
        name: 'Apollo 11',
        agency: 'NASA',
        year: '1969',
        status: 'Success',
        description: 'The first crewed mission to land on the Moon.',
        details: 'Neil Armstrong and Buzz Aldrin formed the American crew that landed the Apollo Lunar Module Eagle on July 20, 1969.',
        image: '/missions/apollo11.png',
        color: 'text-blue-400',
        target: 'Moon',
        category: 'Past',
        detailedDescription: 'Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC.',
        stats: [
            { label: 'Crew Size', value: '3' },
            { label: 'Moonwalk Duration', value: '2h 31m 40s' },
            { label: 'Samples Collected', value: '21.55 kg' }
        ],
        rocket: 'Saturn V',
        launchSite: 'Kennedy Space Center, LC-39A',
        launchDate: 'July 16, 1969',
        timeline: [
            { year: '1969', title: 'Launch', description: 'Lifted off from Florida towards the Moon.' },
            { year: '1969', title: 'Moon Landing', description: 'Eagle landed at Tranquility Base.' },
            { year: '1969', title: 'Return', description: 'Splashed down in the Pacific Ocean.' }
        ]
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
        target: 'Interstellar',
        category: 'Past',
        detailedDescription: 'Voyager 1 is a space probe launched by NASA on September 5, 1977. It is the most distant human-made object from Earth.',
        stats: [
            { label: 'Distance from Earth', value: '24+ billion km' },
            { label: 'Speed', value: '61,500 km/h' },
            { label: 'Instrument', value: 'Golden Record' }
        ],
        rocket: 'Titan IIIE',
        launchSite: 'Cape Canaveral, LC-41',
        launchDate: 'September 5, 1977',
        timeline: [
            { year: '1977', title: 'Launch', description: 'Began its journey to the outer planets.' },
            { year: '1979', title: 'Jupiter Flyby', description: 'Closest approach to Jupiter.' },
            { year: '2012', title: 'Interstellar Space', description: 'Crossed the heliopause.' }
        ]
    },
    {
        id: 'voyager-2',
        name: 'Voyager 2',
        agency: 'NASA',
        year: '1977',
        status: 'Ongoing',
        description: 'Grand Tour of the giant planets.',
        details: 'The only spacecraft to visit all four giant planets: Jupiter, Saturn, Uranus, and Neptune.',
        image: '/missions/voyager_2.webp',
        color: 'text-blue-500',
        target: 'Interstellar',
        category: 'Past',
        detailedDescription: 'Voyager 2 is a space probe launched by NASA on August 20, 1977, to study the outer planets. It is the only spacecraft to have visited Uranus and Neptune.',
        stats: [
            { label: 'Planets Visited', value: '4' },
            { label: 'Distance from Earth', value: '20+ billion km' },
            { label: 'Instrument', value: 'Golden Record' }
        ],
        rocket: 'Titan IIIE',
        launchSite: 'Cape Canaveral, LC-41',
        launchDate: 'August 20, 1977',
        timeline: [
            { year: '1977', title: 'Launch', description: 'Launched ahead of Voyager 1.' },
            { year: '1986', title: 'Uranus Flyby', description: 'First ever flyby of Uranus.' },
            { year: '1989', title: 'Neptune Flyby', description: 'First ever flyby of Neptune.' }
        ]
    },
    {
        id: 'hubble',
        name: 'Hubble Space Telescope',
        agency: 'NASA / ESA',
        year: '1990',
        status: 'Ongoing',
        description: 'Revolutionizing our view of the universe.',
        details: 'A large space-based observatory that has provided some of the most detailed images of distant stars and galaxies ever seen.',
        image: '/missions/hubble.webp',
        color: 'text-purple-400',
        target: 'Low Earth Orbit',
        category: 'Past',
        detailedDescription: 'The Hubble Space Telescope was launched into low Earth orbit in 1990 and remains in operation. It is one of the largest and most versatile space telescopes.',
        stats: [
            { label: 'Orbit Height', value: '540 km' },
            { label: 'Mirror Diameter', value: '2.4 m' },
            { label: 'Launch Mass', value: '11,110 kg' }
        ],
        rocket: 'Space Shuttle Discovery (STS-31)',
        launchSite: 'Kennedy Space Center, LC-39B',
        launchDate: 'April 24, 1990',
        timeline: [
            { year: '1990', title: 'Deployment', description: 'Released from Discovery payload bay.' },
            { year: '1993', title: 'First Servicing', description: 'Fixed the mirror aberration.' },
            { year: '2009', title: 'Last Servicing', description: 'Final upgrade mission.' }
        ]
    },
    // --- CURRENT ---
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
        target: 'Earth Orbit',
        category: 'Current',
        detailedDescription: 'The International Space Station (ISS) is a large spacecraft in orbit around Earth. It serves as a home where crews of astronauts and cosmonauts live. The space station is also a unique science laboratory.',
        stats: [
            { label: 'Speed', value: '28,000 km/h' },
            { label: 'Orbits per Day', value: '16' },
            { label: 'Inhabited Since', value: 'Nov 2000' }
        ],
        rocket: 'Proton-K / Space Shuttle',
        launchSite: 'Baikonur / KSC',
        launchDate: 'November 20, 1998',
        timeline: [
            { year: '1998', title: 'First Module', description: 'Zarya module launched.' },
            { year: '2000', title: 'First Crew', description: 'Expedition 1 arrives.' },
            { year: '2011', title: 'Construction Complete', description: 'US Orbital Segment finished.' }
        ]
    },
    {
        id: 'chandrayaan-1',
        name: 'Chandrayaan-1',
        agency: 'ISRO',
        year: '2008',
        status: 'Success',
        description: 'Discovery of water molecules on the Moon.',
        details: 'India\'s first lunar probe. The Moon Impact Probe separated from the orbiter and struck the south pole in a controlled manner.',
        image: '/missions/chandrayaan1.png',
        color: 'text-orange-500',
        target: 'Moon',
        category: 'Past', // Corrected category
        detailedDescription: 'Chandrayaan-1 was India\'s first mission to the Moon. It operated for almost a year and is best known for helping to discover evidence of water molecules on the moon.',
        stats: [
            { label: 'Launch Mass', value: '1380 kg' },
            { label: 'Mission Life', value: '312 days' },
            { label: 'Instruments', value: '11' }
        ],
        rocket: 'PSLV-XL C11',
        launchSite: 'Satish Dhawan Space Centre',
        launchDate: 'October 22, 2008',
        timeline: [
            { year: '2008', title: 'Launch', description: 'Successfully inserted into Lunar Transfer Orbit.' },
            { year: '2008', title: 'Impact Probe', description: 'MIP landed on Moon South Pole.' },
            { year: '2009', title: 'Mission End', description: 'Contact lost after 312 days.' }
        ]
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
        target: 'Mars',
        category: 'Past',
        detailedDescription: 'The Mars Orbiter Mission (MOM), unofficially known as Mangalyaan, was a space probe orbiting Mars since 24 September 2014. It was launched on 5 November 2013.',
        stats: [
            { label: 'Cost', value: '$73 Million' },
            { label: 'Time in Orbit', value: '8 years' },
            { label: 'Launch Date', value: 'Nov 5, 2013' }
        ],
        rocket: 'PSLV-XL C25',
        launchSite: 'Satish Dhawan Space Centre',
        launchDate: 'November 5, 2013',
        timeline: [
            { year: '2013', title: 'Launch', description: 'Textbook launch from Sriharikota.' },
            { year: '2014', title: 'Mars Insertion', description: 'Entered Mars orbit successfully.' },
            { year: '2022', title: 'End of Mission', description: 'Fuel exhaustion and battery drain.' }
        ]
    },
    {
        id: 'perseverance',
        name: 'Perseverance Rover',
        agency: 'NASA',
        year: '2020',
        status: 'Ongoing',
        description: 'Seeking signs of ancient life on Mars.',
        details: 'A car-sized rover designed to explore the crater Jezero on Mars as part of NASA\'s Mars 2020 mission.',
        image: '/missions/Perseverance rover.jpg',
        color: 'text-red-400',
        target: 'Mars',
        category: 'Current',
        detailedDescription: 'Perseverance is a car-sized Mars rover designed to explore the Jezero crater on Mars. It was manufactured by the Jet Propulsion Laboratory.',
        stats: [
            { label: 'Landing Date', value: 'Feb 18, 2021' },
            { label: 'Rotocraft', value: 'Ingenuity' },
            { label: 'Samples Collected', value: '20+' }
        ],
        rocket: 'Atlas V 541',
        launchSite: 'Cape Canaveral, LC-41',
        launchDate: 'July 30, 2020',
        timeline: [
            { year: '2020', title: 'Launch', description: 'Departed Earth for Mars.' },
            { year: '2021', title: 'Landing', description: 'Skycrane landing in Jezero Crater.' },
            { year: '2021', title: 'First Flight', description: 'Ingenuity takes first helicopter flight.' }
        ]
    },
    {
        id: 'jwst',
        name: 'James Webb Telescope',
        agency: 'NASA / ESA',
        year: '2021',
        status: 'Ongoing',
        description: 'Observing the infrared universe & early galaxies.',
        details: 'The largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for the Hubble.',
        image: '/missions/jwst.png',
        color: 'text-yellow-400',
        target: 'Lagrange Point 2',
        category: 'Current',
        detailedDescription: 'The James Webb Space Telescope (JWST) is a space telescope which conducts infrared astronomy. As the largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint.',
        stats: [
            { label: 'Mirror Diameter', value: '6.5 m' },
            { label: 'Operating Temp', value: '-223° C' },
            { label: 'Distance', value: '1.5 million km' }
        ],
        rocket: 'Ariane 5 ECA',
        launchSite: 'Guiana Space Centre',
        launchDate: 'December 25, 2021',
        timeline: [
            { year: '2021', title: 'Launch', description: 'Perfect launch on Christmas Day.' },
            { year: '2022', title: 'Deployment', description: 'Complex sunshield deployment.' },
            { year: '2022', title: 'First Images', description: 'Deep field image revealed.' }
        ]
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
        target: 'Moon',
        category: 'Current',
        detailedDescription: 'Chandrayaan-3 is the third mission in the Chandrayaan programme. The mission consists of a lunar lander named Vikram and a lunar rover named Pragyan.',
        stats: [
            { label: 'Touchdown', value: 'Aug 23, 2023' },
            { label: 'Site', value: 'Shiv Shakti Point' },
            { label: 'Mission Life', value: '14 Days' }
        ],
        rocket: 'LVM3 M4',
        launchSite: 'Satish Dhawan Space Centre',
        launchDate: 'July 14, 2023',
        timeline: [
            { year: '2023', title: 'Launch', description: 'Sent into orbit by LVM3.' },
            { year: '2023', title: 'Soft Landing', description: 'Historical landing near South Pole.' },
            { year: '2023', title: 'Rover Operations', description: 'Pragyan explored lunar surface.' }
        ]
    },
    {
        id: 'aditya-l1',
        name: 'Aditya-L1',
        agency: 'ISRO',
        year: '2023',
        status: 'Ongoing',
        description: 'India\'s first dedicated solar observatory.',
        details: 'Placed at Lagrange Point 1 (L1), it observes the Sun\'s photosphere, chromosphere, and corona.',
        image: '/missions/adityal1.png',
        color: 'text-yellow-600',
        target: 'Sun (L1)',
        category: 'Current',
        detailedDescription: 'Aditya-L1 is a coronagraphy spacecraft for studying the solar atmosphere. It orbits at about 1.5 million km from Earth.',
        stats: [
            { label: 'Orbit', value: 'Halo Orbit (L1)' },
            { label: 'Payloads', value: '7' },
            { label: 'Launch Mass', value: '1475 kg' }
        ],
        rocket: 'PSLV-XL C57',
        launchSite: 'Satish Dhawan Space Centre',
        launchDate: 'September 2, 2023',
        timeline: [
            { year: '2023', title: 'Launch', description: 'Successful liftoff.' },
            { year: '2024', title: 'L1 Insertion', description: ' Reached final halo orbit.' },
            { year: '2024', title: 'Operations', description: 'Sending solar data.' }
        ]
    },
    // --- FUTURE ---
    {
        id: 'artemis-2',
        name: 'Artemis II',
        agency: 'NASA',
        year: '2026 (Planned)',
        status: 'Planned',
        description: 'First crewed flight of Artemis.',
        details: 'Planned to be the first crewed mission of NASA\'s Orion spacecraft, currently planned to be launched by the Space Launch System (SLS).',
        image: '/missions/artemis.png',
        color: 'text-indigo-400',
        target: 'Moon Orbit',
        category: 'Future',
        detailedDescription: 'Artemis II is the planned first crewed mission of NASA\'s Orion spacecraft. The mission will carry four astronauts on a flyby around the Moon, testing critical life support and communication systems before returning to Earth.',
        stats: [
            { label: 'Duration', value: '10 days' },
            { label: 'Crew', value: '4 Astronauts' },
            { label: 'Distance', value: '8,889 km beyond Moon' }
        ],
        rocket: 'SLS Block 1',
        launchSite: 'Kennedy Space Center, LC-39B',
        launchDate: 'February 2026',
        timeline: [
            { year: '2026', title: 'Launch', description: 'Targeting Feb 6, 2026 launch window.' },
            { year: '2026', title: 'Lunar Flyby', description: 'Free-return trajectory around Moon.' },
            { year: '2026', title: 'Splashdown', description: 'Pacific Ocean landing.' }
        ]
    },
    {
        id: 'gaganyaan',
        name: 'Gaganyaan',
        agency: 'ISRO',
        year: '2027 (Manned)',
        status: 'Planned',
        description: 'India\'s first manned spaceflight mission.',
        details: 'Gaganyaan envisages demonstration of human spaceflight capability by launching a crew of 3 members to an orbit of 400 km for a 3-day mission.',
        image: '/missions/gaganyaan.png',
        color: 'text-orange-400',
        target: 'Low Earth Orbit',
        category: 'Future',
        detailedDescription: 'The Gaganyaan project envisages demonstration of human spaceflight capability. The first uncrewed test flight (G1) is scheduled for 2025, followed by further tests, with the first crewed mission (H1) targeting 2027.',
        stats: [
            { label: 'Crew', value: '4 Selected' },
            { label: 'Orbit', value: '400 km LEO' },
            { label: 'Test Flight', value: 'Dec 2025 (G1)' }
        ],
        rocket: 'LVM3 (Human Rated)',
        launchSite: 'Satish Dhawan Space Centre',
        launchDate: '2027 (H1 Target)',
        timeline: [
            { year: '2025', title: 'Test Flight G1', description: 'Uncrewed flight with Vyommitra robot.' },
            { year: '2026', title: 'Test Flight G2/G3', description: 'Further qualification flights.' },
            { year: '2027', title: 'Manned Launch', description: 'First Indian crewed mission.' }
        ]
    }
];