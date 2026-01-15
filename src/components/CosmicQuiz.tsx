'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Unlock, CheckCircle, XCircle, Brain, RotateCcw, ShieldAlert, Star, PauseCircle, PlayCircle, Save } from 'lucide-react';

// --- DATA & TYPES ---
// (Ensure you have your generateQuizData function here or imported)
// For brevity in this snippet, I am assuming QUIZ_DATA is available. 
// If you need the data block again, let me know, but it should be the same as before.

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// --- PAUSE STATE INTERFACE ---
interface PausedSession {
  levelId: number;
  questionIndex: number;
  score: number;
  difficulty: Difficulty;
  timestamp: number;
}

// Progress for a single difficulty
interface DifficultyProgress {
  unlockedLevelIds: number[];
  completedLevelIds: number[];
  pausedSession: PausedSession | null;
}

// All progress keyed by difficulty
interface SavedProgress {
  EASY: DifficultyProgress;
  MEDIUM: DifficultyProgress;
  HARD: DifficultyProgress;
}

// Default progress for new difficulty
const getDefaultDifficultyProgress = (): DifficultyProgress => ({
  unlockedLevelIds: [1],
  completedLevelIds: [],
  pausedSession: null
});

// Default full progress
const getDefaultProgress = (): SavedProgress => ({
  EASY: getDefaultDifficultyProgress(),
  MEDIUM: getDefaultDifficultyProgress(),
  HARD: getDefaultDifficultyProgress()
});

// --- LINKED LIST LOGIC (Updated for State) ---
class QuizNode {
  data: any; // Using any here to match your data structure flexibly
  next: QuizNode | null = null;
  isUnlocked: boolean = false;
  completed: boolean = false;

  constructor(data: any, isUnlocked: boolean = false, completed: boolean = false) {
    this.data = data;
    this.isUnlocked = isUnlocked;
    this.completed = completed;
  }
}

class QuizLinkedList {
  head: QuizNode | null = null;

  constructor(levels: any[], progress: DifficultyProgress) {
    if (levels.length === 0) return;

    // Initialize Level 1
    const isL1Unlocked = progress.unlockedLevelIds.includes(1);
    const isL1Complete = progress.completedLevelIds.includes(1);

    // Level 1 is always unlocked by default if nothing is saved, otherwise follow save
    this.head = new QuizNode(levels[0], true, isL1Complete);

    let current = this.head;

    // Chain the rest
    for (let i = 1; i < levels.length; i++) {
      const id = levels[i].id;
      const isUnlocked = progress.unlockedLevelIds.includes(id);
      const isComplete = progress.completedLevelIds.includes(id);

      const newNode = new QuizNode(levels[i], isUnlocked, isComplete);
      current.next = newNode;
      current = newNode;
    }
  }

  toArray(): QuizNode[] {
    const nodes: QuizNode[] = [];
    let current = this.head;
    while (current) {
      nodes.push(current);
      current = current.next;
    }
    return nodes;
  }

  find(id: number): QuizNode | null {
    let current = this.head;
    while (current) {
      if (current.data.id === id) return current;
      current = current.next;
    }
    return null;
  }
}

// Replace your existing generateQuizData function with this one:

const generateQuizData = () => {
  return [
    // LEVEL 1: ORBITAL MECHANICS
    {
      id: 1,
      title: "Level 1: Orbital Mechanics",
      description: "Master the laws of gravity and motion that govern spaceflight.",
      questions: {
        EASY: [
          { id: 0, text: "Which force keeps planets in orbit around the Sun?", options: ["Magnetism", "Gravity", "Friction", "Nuclear Force"], correctIndex: 1 },
          { id: 1, text: "What is the shape of most planetary orbits?", options: ["Perfect Circle", "Square", "Ellipse", "Triangle"], correctIndex: 2 },
          { id: 2, text: "What is the term for the point in an orbit closest to Earth?", options: ["Apogee", "Perigee", "Zenith", "Nadir"], correctIndex: 1 },
          { id: 3, text: "How long does it take Earth to orbit the Sun once?", options: ["24 Hours", "30 Days", "365 Days", "10 Years"], correctIndex: 2 },
          { id: 4, text: "What is the name of the speed needed to break free from a planet's gravity?", options: ["Orbital Velocity", "Escape Velocity", "Terminal Velocity", "Warp Speed"], correctIndex: 1 },
          { id: 5, text: "Which scientist formulated the Three Laws of Planetary Motion?", options: ["Isaac Newton", "Johannes Kepler", "Galileo Galilei", "Albert Einstein"], correctIndex: 1 },
          { id: 6, text: "What does 'LEO' stand for in space missions?", options: ["Low Earth Orbit", "Lunar Entry Orbit", "Large Engine Output", "Long Elliptical Orbit"], correctIndex: 0 },
        ],
        MEDIUM: [
          { id: 0, text: "What is the approximate escape velocity of Earth?", options: ["7.9 km/s", "11.2 km/s", "25.0 km/s", "300,000 km/s"], correctIndex: 1 },
          { id: 1, text: "A Geostationary Orbit (GEO) allows a satellite to:", options: ["Orbit the poles", "Remain above a fixed point on Earth", "Fly at the lowest possible altitude", "Travel to the Moon"], correctIndex: 1 },
          { id: 2, text: "In an elliptical orbit, where does a planet move fastest?", options: ["At perihelion (closest approach)", "At aphelion (farthest point)", "It moves at constant speed", "When aligned with the Moon"], correctIndex: 0 },
          { id: 3, text: "What is a 'Hohmann Transfer' used for?", options: ["Landing on a planet", "Efficiently moving between two orbits", "Launching from a moving platform", "Docking with the ISS"], correctIndex: 1 },
          { id: 4, text: "Which law states 'For every action, there is an equal and opposite reaction'?", options: ["Kepler's 1st Law", "Newton's 3rd Law", "Einstein's Relativity", "Hubble's Law"], correctIndex: 1 },
          { id: 5, text: "What causes orbital decay in Low Earth Orbit?", options: ["Solar wind pressure", "Atmospheric drag", "Lunar gravity", "Magnetic interference"], correctIndex: 1 },
          { id: 6, text: "The point in an orbit farthest from the Sun is called:", options: ["Aphelion", "Perihelion", "Apoapsis", "Periapsis"], correctIndex: 0 },
        ],
        HARD: [
          { id: 0, text: "Calculate the orbital period of a satellite in a geostationary orbit.", options: ["12 hours", "23 hours 56 minutes", "24 hours exactly", "48 hours"], correctIndex: 1 },
          { id: 1, text: "What is the Oberth Effect?", options: ["Engines are more efficient at high speeds", "Orbits decay faster in sunlight", "Gravity assists cool the engine", "Rockets gain efficiency in a vacuum"], correctIndex: 0 },
          { id: 2, text: "Which Lagrange point is located between the Sun and Earth?", options: ["L1", "L2", "L4", "L5"], correctIndex: 0 },
          { id: 3, text: "The Tsiolkovsky rocket equation relates delta-v to what?", options: ["Engine heat", "Mass ratio and exhaust velocity", "Atmospheric density", "Launch angle"], correctIndex: 1 },
          { id: 4, text: "What is orbital inclination?", options: ["The shape of the ellipse", "The tilt of the orbit relative to the equator", "The speed of the satellite", "The distance from the center"], correctIndex: 1 },
          { id: 5, text: "A 'gravity assist' or 'slingshot' changes a spacecraft's velocity relative to:", options: ["The planet it flies by", "The Sun", "The spacecraft itself", "The galactic center"], correctIndex: 1 },
          { id: 6, text: "Specific Impulse (Isp) is a measure of:", options: ["Thrust duration", "Engine efficiency", "Fuel tank capacity", "Rocket weight"], correctIndex: 1 },
        ]
      }
    },

    // LEVEL 2: SOLAR PHYSICS
    {
      id: 2,
      title: "Level 2: Solar Physics",
      description: "Explore the fusion engine that powers our solar system.",
      questions: {
        EASY: [
          { id: 0, text: "What is the Sun mostly made of?", options: ["Oxygen and Carbon", "Hydrogen and Helium", "Iron and Nickel", "Nitrogen and Argon"], correctIndex: 1 },
          { id: 1, text: "What do we call the visible surface of the Sun?", options: ["Corona", "Core", "Photosphere", "Chromosphere"], correctIndex: 2 },
          { id: 2, text: "Darker, cooler areas on the Sun's surface are called:", options: ["Solar Flares", "Sunspots", "Black Holes", "Craters"], correctIndex: 1 },
          { id: 3, text: "What process powers the Sun?", options: ["Nuclear Fission", "Nuclear Fusion", "Combustion", "Geothermal Energy"], correctIndex: 1 },
          { id: 4, text: "How long does light take to travel from the Sun to Earth?", options: ["8 seconds", "8 minutes", "8 hours", "8 days"], correctIndex: 1 },
          { id: 5, text: "The outermost layer of the Sun's atmosphere is the:", options: ["Corona", "Mantle", "Crust", "Exosphere"], correctIndex: 0 },
          { id: 6, text: "What is the Solar Wind?", options: ["A breeze of oxygen", "A stream of charged particles", "Heat waves", "Magnetic dust"], correctIndex: 1 },
        ],
        MEDIUM: [
          { id: 0, text: "Which spectral class does our Sun belong to?", options: ["O-Type", "G-Type (Yellow Dwarf)", "M-Type (Red Dwarf)", "A-Type"], correctIndex: 1 },
          { id: 1, text: "What is a Coronal Mass Ejection (CME)?", options: ["A solar eclipse", "A massive burst of plasma", "A sunspot disappearing", "A comet hitting the sun"], correctIndex: 1 },
          { id: 2, text: "During nuclear fusion in the Sun, Hydrogen is converted into:", options: ["Lithium", "Carbon", "Helium", "Oxygen"], correctIndex: 2 },
          { id: 3, text: "The solar cycle of magnetic activity lasts approximately:", options: ["1 year", "11 years", "50 years", "100 years"], correctIndex: 1 },
          { id: 4, text: "What protects Earth from the solar wind?", options: ["The Ozone Layer", "The Magnetosphere", "The Atmosphere", "The Moon"], correctIndex: 1 },
          { id: 5, text: "What temperature is the Sun's core?", options: ["5,000°C", "15 Million°C", "100,000°C", "1 Billion°C"], correctIndex: 1 },
          { id: 6, text: "What is the 'Maunder Minimum'?", options: ["The sun's lowest daily temperature", "A period of very low sunspot activity", "The smallest solar flare recorded", "The time before sunrise"], correctIndex: 1 },
        ],
        HARD: [
          { id: 0, text: "The Proton-Proton chain reaction dominates in stars of what size?", options: ["Supergiants", "Sun-like stars", "Neutron stars", "Brown dwarfs"], correctIndex: 1 },
          { id: 1, text: "Why is the Solar Corona hotter than the Photosphere?", options: ["Nuclear fusion happens there", "Magnetic reconnection releases energy", "It absorbs starlight", "It is closer to Earth"], correctIndex: 1 },
          { id: 2, text: "What are solar spicules?", options: ["Jets of gas in the chromosphere", "Types of sunspots", "Rings around the sun", "Solar wind particles"], correctIndex: 0 },
          { id: 3, text: "Helioseismology is the study of:", options: ["Solar eclipses", "Sunquakes and internal structure", "Solar wind speed", "Helium abundance"], correctIndex: 1 },
          { id: 4, text: "What is the Carrington Event?", options: ["A supernova observation", "A massive 1859 geomagnetic storm", "The discovery of Helium", "The first solar photo"], correctIndex: 1 },
          { id: 5, text: "The boundary where the Solar Wind slows down against interstellar medium is:", options: ["Termination Shock", "Bow Shock", "Heliopause", "Magnetotail"], correctIndex: 0 },
          { id: 6, text: "Which particle produced in the core escapes the Sun almost instantly?", options: ["Photon", "Electron", "Neutrino", "Proton"], correctIndex: 2 },
        ]
      }
    },

    // LEVEL 3: PLANETARY SCIENCE
    {
      id: 3,
      title: "Level 3: Planetary Science",
      description: "Survey the diverse worlds within our own solar neighborhood.",
      questions: {
        EASY: [
          { id: 0, text: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2 },
          { id: 1, text: "Which is the largest planet in our Solar System?", options: ["Earth", "Saturn", "Jupiter", "Neptune"], correctIndex: 2 },
          { id: 2, text: "Which planet has beautiful, prominent rings?", options: ["Mars", "Saturn", "Mercury", "Venus"], correctIndex: 1 },
          { id: 3, text: "What is the hottest planet in the solar system?", options: ["Mercury", "Mars", "Venus", "Jupiter"], correctIndex: 2 },
          { id: 4, text: "Which planet is no longer classified as a major planet?", options: ["Pluto", "Uranus", "Neptune", "Mars"], correctIndex: 0 },
          { id: 5, text: "What is the Great Red Spot on Jupiter?", options: ["A volcano", "A giant storm", "A crater", "An ocean"], correctIndex: 1 },
          { id: 6, text: "Which planet rotates on its side?", options: ["Earth", "Mars", "Uranus", "Neptune"], correctIndex: 2 },
        ],
        MEDIUM: [
          { id: 0, text: "Olympus Mons, the largest volcano in the solar system, is on:", options: ["Venus", "Earth", "Mars", "Io"], correctIndex: 2 },
          { id: 1, text: "Which moon of Saturn has a thick atmosphere?", options: ["Titan", "Enceladus", "Rhea", "Mimas"], correctIndex: 0 },
          { id: 2, text: "What are the four 'Gas Giants'?", options: ["Mercury, Venus, Earth, Mars", "Jupiter, Saturn, Uranus, Neptune", "Mars, Jupiter, Saturn, Uranus", "Earth, Mars, Jupiter, Saturn"], correctIndex: 1 },
          { id: 3, text: "What is the main component of Venus's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2 },
          { id: 4, text: "The asteroid belt is located between which two planets?", options: ["Earth and Mars", "Mars and Jupiter", "Jupiter and Saturn", "Mercury and Venus"], correctIndex: 1 },
          { id: 5, text: "Which moon is known to have subsurface liquid water oceans?", options: ["Luna", "Phobos", "Europa", "Io"], correctIndex: 2 },
          { id: 6, text: "What is the Kuiper Belt?", options: ["Ring around Saturn", "Region beyond Neptune full of icy bodies", "The core of Jupiter", "A cloud of dust near the Sun"], correctIndex: 1 },
        ],
        HARD: [
          { id: 0, text: "What is the 'Roche Limit'?", options: ["The edge of the solar system", "Distance where a moon breaks up due to tidal forces", "Maximum speed of a planet", "Minimum temperature for life"], correctIndex: 1 },
          { id: 1, text: "Io, a moon of Jupiter, is geologically active due to:", options: ["Solar radiation", "Tidal heating", "Impact craters", "Nuclear core"], correctIndex: 1 },
          { id: 2, text: "Which planet has 'retrograde rotation' (spins backward)?", options: ["Mars", "Jupiter", "Venus", "Neptune"], correctIndex: 2 },
          { id: 3, text: "What are the 'Kirkwood Gaps'?", options: ["Gaps in Saturn's rings", "Gaps in the Asteroid Belt caused by Jupiter", "Craters on the Moon", "Valleys on Mars"], correctIndex: 1 },
          { id: 4, text: "Tholins are organic compounds that give which object its red color?", options: ["Mars", "Pluto", "The Sun", "Jupiter"], correctIndex: 1 },
          { id: 5, text: "Valles Marineris is:", options: ["A volcano on Venus", "A canyon system on Mars", "An ocean on Titan", "A crater on Mercury"], correctIndex: 1 },
          { id: 6, text: "Metallic Hydrogen is thought to exist in the core of:", options: ["Earth", "Mars", "Jupiter", "Venus"], correctIndex: 2 },
        ]
      }
    },

    // LEVEL 4: DEEP SPACE
    {
      id: 4,
      title: "Level 4: Deep Space",
      description: "Journey into the interstellar medium, nebulae, and star clusters.",
      questions: {
        EASY: [
          { id: 0, text: "What is a Light Year measure of?", options: ["Time", "Distance", "Brightness", "Speed"], correctIndex: 1 },
          { id: 1, text: "What is a nebula?", options: ["A dead star", "A giant cloud of gas and dust", "A black hole", "A planet"], correctIndex: 1 },
          { id: 2, text: "What is the name of our galaxy?", options: ["Andromeda", "Whirlpool", "Milky Way", "Triangulum"], correctIndex: 2 },
          { id: 3, text: "Which star is closest to Earth (after the Sun)?", options: ["Sirius", "Proxima Centauri", "Betelgeuse", "Polaris"], correctIndex: 1 },
          { id: 4, text: "A group of stars forming a pattern is called a:", options: ["Galaxy", "Constellation", "Nebula", "Solar System"], correctIndex: 1 },
          { id: 5, text: "What explodes at the end of a massive star's life?", options: ["Supernova", "Nebula", "Quasar", "Pulsar"], correctIndex: 0 },
          { id: 6, text: "What is the most common type of star in the universe?", options: ["Red Dwarf", "Blue Giant", "Yellow Dwarf", "Neutron Star"], correctIndex: 0 },
        ],
        MEDIUM: [
          { id: 0, text: "The Pillars of Creation are located in which nebula?", options: ["Orion Nebula", "Eagle Nebula", "Crab Nebula", "Ring Nebula"], correctIndex: 1 },
          { id: 1, text: "What is a Pulsar?", options: ["A pulsating variable star", "A rotating neutron star emitting beams of radiation", "A binary star system", "A white dwarf"], correctIndex: 1 },
          { id: 2, text: "What color are the hottest stars?", options: ["Red", "Yellow", "White", "Blue"], correctIndex: 3 },
          { id: 3, text: "How far across is the Milky Way galaxy?", options: ["1,000 light years", "100,000 light years", "1 million light years", "10 light years"], correctIndex: 1 },
          { id: 4, text: "What happens when a star runs out of hydrogen fuel?", options: ["It turns into a planet", "It leaves the main sequence", "It disappears", "It speeds up"], correctIndex: 1 },
          { id: 5, text: "Which galaxy is on a collision course with the Milky Way?", options: ["Triangulum", "Andromeda", "Sombrero", "Cartwheel"], correctIndex: 1 },
          { id: 6, text: "A Globular Cluster is:", options: ["A loose group of young stars", "A spherical collection of old stars", "A cluster of galaxies", "A dense asteroid field"], correctIndex: 1 },
        ],
        HARD: [
          { id: 0, text: "What is the Chandrasekhar Limit?", options: ["Max mass of a white dwarf", "Max speed of light", "Size of a black hole", "Age of the universe"], correctIndex: 0 },
          { id: 1, text: "What is a Magnetar?", options: ["A magnetic planet", "A neutron star with an extremely strong magnetic field", "A galactic core", "A type of quasar"], correctIndex: 1 },
          { id: 2, text: "Population I stars are characterized by:", options: ["Low metallicity", "High metallicity and youth", "Being extremely old", "Existing in the halo"], correctIndex: 1 },
          { id: 3, text: "What is a Brown Dwarf?", options: ["A dead star", "A 'failed' star that couldn't sustain fusion", "A planet made of dirt", "A cooling white dwarf"], correctIndex: 1 },
          { id: 4, text: "The Hertzsprung-Russell diagram plots luminosity against:", options: ["Distance", "Temperature (Color)", "Mass", "Age"], correctIndex: 1 },
          { id: 5, text: "What is a Wolf-Rayet star?", options: ["A star with a planet", "A massive, rapidly losing mass star", "A neutron star binary", "An invisible star"], correctIndex: 1 },
          { id: 6, text: "Planetary Nebulae are formed by:", options: ["Supernovae", "Low-mass stars shedding outer layers", "Planet collisions", "Black hole jets"], correctIndex: 1 },
        ]
      }
    },

    // LEVEL 5: BLACK HOLES
    {
      id: 5,
      title: "Level 5: Black Holes",
      description: "Approach the event horizon and understand the most extreme objects in existence.",
      questions: {
        EASY: [
          { id: 0, text: "What is a Black Hole?", options: ["A hole in a planet", "A region with gravity so strong light cannot escape", "A dead sun", "A dark cloud"], correctIndex: 1 },
          { id: 1, text: "What is the boundary of a black hole called?", options: ["The Edge", "Event Horizon", "Terminator Line", "Singularity"], correctIndex: 1 },
          { id: 2, text: "What lies at the very center of a black hole?", options: ["A planet", "A singularity", "A wormhole", "Nothing"], correctIndex: 1 },
          { id: 3, text: "How do we detect black holes if they are invisible?", options: ["We can see them", "By their effect on nearby stars", "By radar", "By sending probes"], correctIndex: 1 },
          { id: 4, text: "What happens if you fall into a black hole?", options: ["You travel in time", "You get 'spaghettified'", "You bounce off", "Nothing"], correctIndex: 1 },
          { id: 5, text: "What is the supermassive black hole at the center of our galaxy called?", options: ["Sagittarius A*", "Cygnus X-1", "Andromeda Core", "The Great Attractor"], correctIndex: 0 },
          { id: 6, text: "Can light escape a black hole?", options: ["Yes", "No", "Sometimes", "Only blue light"], correctIndex: 1 },
        ],
        MEDIUM: [
          { id: 0, text: "What causes 'Spaghettification'?", options: ["Extreme heat", "Tidal forces pulling harder on your feet than head", "Rotation speed", "Magnetic fields"], correctIndex: 1 },
          { id: 1, text: "What is an Accretion Disk?", options: ["The shadow of the hole", "Material spiraling into the black hole", "The event horizon", "A ring of dark matter"], correctIndex: 1 },
          { id: 2, text: "Who predicted Black Holes using the Theory of Relativity?", options: ["Newton", "Einstein", "Hawking", "Bohr"], correctIndex: 1 },
          { id: 3, text: "Cygnus X-1 was the first discovered:", options: ["Pulsar", "Black Hole candidate", "Exoplanet", "Galaxy"], correctIndex: 1 },
          { id: 4, text: "What is Hawking Radiation?", options: ["Heat from the disk", "Theoretical radiation causing black holes to evaporate", "Light from behind the hole", "Radio waves"], correctIndex: 1 },
          { id: 5, text: "What is a Quasar?", options: ["A type of star", "An active galactic nucleus powered by a black hole", "A quiet black hole", "A neutron star"], correctIndex: 1 },
          { id: 6, text: "Time near a black hole event horizon moves:", options: ["Faster", "Slower (Time Dilation)", "At normal speed", "Backwards"], correctIndex: 1 },
        ],
        HARD: [
          { id: 0, text: "The 'No-Hair Theorem' states black holes have only 3 properties: Mass, Angular Momentum, and:", options: ["Radius", "Electric Charge", "Temperature", "Volume"], correctIndex: 1 },
          { id: 1, text: "What is the Schwarzschild Radius?", options: ["Radius of the accretion disk", "Radius of the Event Horizon for a non-rotating black hole", "Distance to the nearest star", "Size of the singularity"], correctIndex: 1 },
          { id: 2, text: "What is an Ergosphere?", options: ["Region outside a rotating black hole where space is dragged", "The center point", "The jet stream", "The magnetic field"], correctIndex: 0 },
          { id: 3, text: "A rotating black hole is known as a:", options: ["Schwarzschild black hole", "Kerr black hole", "Reissner-Nordstrom black hole", "Einstein black hole"], correctIndex: 1 },
          { id: 4, text: "What is the Information Paradox?", options: ["We can't see inside", "Quantum information appears lost when matter enters a black hole", "Black holes are too dark", "Gravity is infinite"], correctIndex: 1 },
          { id: 5, text: "The first direct image of a Black Hole shadow was of:", options: ["Sgr A*", "M87*", "Cygnus X-1", "Centaurus A"], correctIndex: 1 },
          { id: 6, text: "Penrose Process allows energy extraction from:", options: ["The singularity", "The ergosphere of a rotating black hole", "Hawking radiation", "The jet"], correctIndex: 1 },
        ]
      }
    },

    // LEVEL 6: COSMOLOGY
    {
      id: 6,
      title: "Level 6: Cosmology",
      description: "Study the origin, evolution, and fate of the Universe itself.",
      questions: {
        EASY: [
          { id: 0, text: "How old is the universe?", options: ["2000 years", "4.5 billion years", "13.8 billion years", "100 billion years"], correctIndex: 2 },
          { id: 1, text: "What theory describes the beginning of the universe?", options: ["Steady State", "The Big Bang", "String Theory", "Flat Earth"], correctIndex: 1 },
          { id: 2, text: "Is the universe static or expanding?", options: ["Static", "Shrinking", "Expanding", "Rotating"], correctIndex: 2 },
          { id: 3, text: "What is the majority of the universe made of?", options: ["Stars", "Planets", "Dark Energy and Dark Matter", "Gas"], correctIndex: 2 },
          { id: 4, text: "Who discovered that the universe is expanding?", options: ["Einstein", "Newton", "Edwin Hubble", "Galileo"], correctIndex: 2 },
          { id: 5, text: "What is the 'Cosmic Microwave Background'?", options: ["Radio noise", "Leftover heat/radiation from the Big Bang", "Starlight", "Solar wind"], correctIndex: 1 },
          { id: 6, text: "What shape is the observable universe?", options: ["Square", "Spherical", "Pyramid", "Disc"], correctIndex: 1 },
        ],
        MEDIUM: [
          { id: 0, text: "What is Dark Matter?", options: ["Black holes", "Matter that does not interact with light but has gravity", "Anti-matter", "Dust clouds"], correctIndex: 1 },
          { id: 1, text: "What is Dark Energy responsible for?", options: ["Holding galaxies together", "Accelerating the expansion of the universe", "Creating stars", "Slowing time"], correctIndex: 1 },
          { id: 2, text: "What is Redshift?", options: ["Stars turning red with age", "Light stretching as objects move away", "Atmospheric distortion", "Camera filter"], correctIndex: 1 },
          { id: 3, text: "The 'Big Crunch' is a theoretical scenario where:", options: ["The universe expands forever", "The universe stops expanding and collapses", "Stars explode", "Black holes merge"], correctIndex: 1 },
          { id: 4, text: "Inflation Theory suggests the early universe:", options: ["Expanded slowly", "Expanded exponentially fast for a fraction of a second", "Did not expand", "Shrank"], correctIndex: 1 },
          { id: 5, text: "The observable universe is approximately how wide?", options: ["13.8 billion light years", "93 billion light years", "Infinite", "100 light years"], correctIndex: 1 },
          { id: 6, text: "What is the 'Great Attractor'?", options: ["A black hole", "A gravity anomaly pulling galaxies (including ours) towards it", "A star", "A magnet"], correctIndex: 1 },
        ],
        HARD: [
          { id: 0, text: "What is the critical density of the universe?", options: ["Density required to stop expansion", "Density of a black hole", "Density of water", "Density of the core"], correctIndex: 0 },
          { id: 1, text: "Baryonic Acoustic Oscillations (BAO) are:", options: ["Sound waves in the early universe plasma", "Star vibrations", "Radio waves from pulsars", "Black hole mergers"], correctIndex: 0 },
          { id: 2, text: "What does the Lambda-CDM model represent?", options: ["Standard model of Big Bang cosmology", "A model for star formation", "A black hole theory", "Planetary motion"], correctIndex: 0 },
          { id: 3, text: "Olbers' Paradox asks:", options: ["Why is gravity weak?", "Why is the night sky dark if the universe is infinite/static?", "Where is the antimatter?", "How do stars burn?"], correctIndex: 1 },
          { id: 4, text: "The 'Heat Death' of the universe implies:", options: ["Everything burns up", "Maximum entropy and no available energy", "The universe freezes instantly", "A new Big Bang"], correctIndex: 1 },
          { id: 5, text: "Hubble's Constant measures:", options: ["Speed of light", "Rate of universe expansion", "Mass of the sun", "Distance to Andromeda"], correctIndex: 1 },
          { id: 6, text: "Recombination (380,000 years after Big Bang) allowed:", options: ["Stars to form", "Photons to travel freely (Light)", "Gravity to start", "Black holes to merge"], correctIndex: 1 },
        ]
      }
    },

    // LEVEL 7: EXOBIOLOGY
    {
      id: 7,
      title: "Level 7: Exobiology",
      description: "The search for life beyond Earth and the conditions required for it.",
      questions: {
        EASY: [
          { id: 0, text: "What is the 'Goldilocks Zone'?", options: ["Zone with gold", "Habitable zone where water can be liquid", "Zone with bears", "Zone near the sun"], correctIndex: 1 },
          { id: 1, text: "What is the most essential molecule for life as we know it?", options: ["Methane", "Liquid Water", "Iron", "Helium"], correctIndex: 1 },
          { id: 2, text: "What does SETI stand for?", options: ["Search for Extraterrestrial Intelligence", "Space Exploration Team International", "Sending Energy To Infinity", "System for Extra Terrestrials"], correctIndex: 0 },
          { id: 3, text: "Which planet/moon is a top candidate for finding life?", options: ["Mercury", "Europa (Moon of Jupiter)", "The Sun", "Venus surface"], correctIndex: 1 },
          { id: 4, text: "What is an Exoplanet?", options: ["A planet ejected from orbit", "A planet orbiting a star other than the Sun", "A dwarf planet", "A moon"], correctIndex: 1 },
          { id: 5, text: "What are Extremophiles?", options: ["Aliens", "Organisms that live in extreme environments on Earth", "Large stars", "Fast rockets"], correctIndex: 1 },
          { id: 6, text: "The Drake Equation estimates:", options: ["Rocket fuel needed", "Number of active, communicative civilizations", "Distance to Mars", "Speed of light"], correctIndex: 1 },
        ],
        MEDIUM: [
          { id: 0, text: "What is a 'Biosignature'?", options: ["An alien autograph", "Substance providing evidence of past or present life", "A type of rock", "Radio signal"], correctIndex: 1 },
          { id: 1, text: "Kepler Space Telescope detected planets using which method?", options: ["Direct imaging", "Transit Photometry", "Radar", "Sonar"], correctIndex: 1 },
          { id: 2, text: "What is Panspermia?", options: ["A disease", "Theory that life exists throughout the universe and is distributed by meteoroids", "A type of plant", "Star formation"], correctIndex: 1 },
          { id: 3, text: "Enceladus (Saturn's moon) ejects plumes of:", options: ["Lava", "Water vapor and ice", "Sulfur", "Dust"], correctIndex: 1 },
          { id: 4, text: "The Fermi Paradox asks:", options: ["Where is everybody?", "How fast is light?", "Is the earth round?", "Are we alone?"], correctIndex: 0 },
          { id: 5, text: "Which element is the basis for all life on Earth?", options: ["Silicon", "Carbon", "Iron", "Gold"], correctIndex: 1 },
          { id: 6, text: "A 'Super-Earth' refers to:", options: ["A planet with super beings", "An exoplanet with mass higher than Earth but lower than ice giants", "A star", "A galaxy"], correctIndex: 1 },
        ],
        HARD: [
          { id: 0, text: "What is the 'Great Filter' theory?", options: ["A telescope filter", "A barrier to evolution that makes intelligent life rare", "Atmospheric cleaning", "Ocean filtration"], correctIndex: 1 },
          { id: 1, text: "Silicon-based life is proposed because Silicon is:", options: ["Stronger than carbon", "Chemically similar to Carbon (same group)", "More abundant", "Conductive"], correctIndex: 1 },
          { id: 2, text: "The 'Wow! Signal' was:", options: ["A confirmed alien message", "A strong narrowband radio signal detected in 1977", "A pulsar", "Satellite interference"], correctIndex: 1 },
          { id: 3, text: "Which method detects exoplanets by the star's 'wobble'?", options: ["Transit", "Radial Velocity", "Microlensing", "Direct Imaging"], correctIndex: 1 },
          { id: 4, text: "The TRAPPIST-1 system is famous for:", options: ["Having 7 Earth-sized planets", "Being a black hole", "Having no planets", "Being blue"], correctIndex: 0 },
          { id: 5, text: "What is a Dyson Sphere?", options: ["A vacuum cleaner", "Hypothetical megastructure completely encompassing a star", "A planet shape", "A type of rocket"], correctIndex: 1 },
          { id: 6, text: "Terraforming is the process of:", options: ["Mining a planet", "Modifying a planet's atmosphere/temperature to be Earth-like", "Building a base", "Flying to Earth"], correctIndex: 1 },
        ]
      }
    },
  ];
};
const QUIZ_DATA = generateQuizData(); // Assume this exists from previous step

// --- COMPONENT ---

export default function CosmicQuiz({ onBack }: { onBack: () => void }) {
  // --- STATE ---
  const [gameState, setGameState] = useState<'DIFFICULTY_SELECT' | 'MAP' | 'PLAYING' | 'RESULT'>('DIFFICULTY_SELECT');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Persistence State - per difficulty
  const [savedProgress, setSavedProgress] = useState<SavedProgress>(getDefaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Gameplay State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  // Helper to get current difficulty's progress
  const currentProgress = savedProgress[difficulty];

  // Fisher-Yates shuffle for randomizing questions
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('orbital_academy_progress_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate structure has all difficulties
        if (parsed.EASY && parsed.MEDIUM && parsed.HARD) {
          setSavedProgress(parsed);
        }
      } catch {
        // Invalid data, use default
      }
    }
    setIsLoaded(true); // Mark as loaded AFTER attempting to load
  }, []);

  // Save to LocalStorage whenever progress changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('orbital_academy_progress_v2', JSON.stringify(savedProgress));
    }
  }, [savedProgress, isLoaded]);

  // Re-build Linked List based on current difficulty's progress
  const quizList = useMemo(() => new QuizLinkedList(QUIZ_DATA, currentProgress), [currentProgress]);
  const currentLevelNode = useMemo(() => quizList.find(currentLevelId), [currentLevelId, quizList]);
  const baseQuestions = currentLevelNode?.data.questions[difficulty] || [];
  // Use shuffled questions if available, otherwise use base
  const activeQuestions = shuffledQuestions.length > 0 ? shuffledQuestions : baseQuestions;
  const nodes = quizList.toArray();

  // --- ACTIONS ---

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameState('MAP');
  };

  const enterLevel = (id: number) => {
    const node = quizList.find(id);
    if (!node?.isUnlocked) return;

    setCurrentLevelId(id);
    const levelQuestions = node.data.questions[difficulty] || [];

    // Check for paused session in current difficulty
    if (currentProgress.pausedSession && currentProgress.pausedSession.levelId === id) {
      // RESUME - use saved shuffled order if available
      const session = currentProgress.pausedSession;
      setCurrentQuestionIndex(session.questionIndex);
      setScore(session.score);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      // Keep the current shuffled questions (they were saved with the session)
      if (shuffledQuestions.length === 0) {
        setShuffledQuestions(shuffleArray(levelQuestions));
      }
    } else {
      // START FRESH - shuffle questions for new attempt
      setShuffledQuestions(shuffleArray(levelQuestions));
      resetLevelState();
    }
    setGameState('PLAYING');
  };

  const pauseGame = () => {
    const session: PausedSession = {
      levelId: currentLevelId,
      questionIndex: currentQuestionIndex,
      score: score,
      difficulty: difficulty,
      timestamp: Date.now()
    };

    setSavedProgress(prev => ({
      ...prev,
      [difficulty]: {
        ...prev[difficulty],
        pausedSession: session
      }
    }));

    setGameState('MAP');
  };

  const resetLevelState = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    // When starting fresh, ensure we clear any pause data for this level
    if (currentProgress.pausedSession?.levelId === currentLevelId) {
      setSavedProgress(prev => ({
        ...prev,
        [difficulty]: {
          ...prev[difficulty],
          pausedSession: null
        }
      }));
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(optionIndex);
    setIsAnswerRevealed(true);

    if (optionIndex === activeQuestions[currentQuestionIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < 6) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      finishLevel();
    }
  };

  const finishLevel = () => {
    // Clear pause session since we finished
    setSavedProgress(prev => ({
      ...prev,
      [difficulty]: {
        ...prev[difficulty],
        pausedSession: null
      }
    }));
    setGameState('RESULT');
  };

  const handleNextLevel = () => {
    // Unlock next level logic
    const nextNode = quizList.find(currentLevelId)?.next;

    if (nextNode) {
      const nextId = nextNode.data.id;

      setSavedProgress(prev => ({
        ...prev,
        [difficulty]: {
          ...prev[difficulty],
          unlockedLevelIds: Array.from(new Set([...prev[difficulty].unlockedLevelIds, nextId])),
          completedLevelIds: Array.from(new Set([...prev[difficulty].completedLevelIds, currentLevelId]))
        }
      }));

      setCurrentLevelId(nextId);
      // Shuffle questions for the new level
      setShuffledQuestions(shuffleArray(nextNode.data.questions[difficulty] || []));
      resetLevelState();
      setGameState('PLAYING');
    } else {
      // All levels done
      setSavedProgress(prev => ({
        ...prev,
        [difficulty]: {
          ...prev[difficulty],
          completedLevelIds: Array.from(new Set([...prev[difficulty].completedLevelIds, currentLevelId]))
        }
      }));
      setGameState('MAP');
    }
  };

  const handleRetry = () => {
    if (difficulty === 'HARD') {
      // Hard mode reset: Lock everything except level 1 for this difficulty
      setSavedProgress(prev => ({
        ...prev,
        [difficulty]: getDefaultDifficultyProgress()
      }));
      setCurrentLevelId(1);
    }
    // Shuffle questions for the retry
    const levelNode = quizList.find(currentLevelId);
    if (levelNode) {
      setShuffledQuestions(shuffleArray(levelNode.data.questions[difficulty] || []));
    }
    resetLevelState();
    setGameState('PLAYING');
  };

  // --- RENDER HELPERS ---

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden text-slate-200 font-inter">
      {/* Static Background */}
      <div className="fixed inset-0 bg-[url('/backgrounds/bg_earth.png')] bg-cover bg-center opacity-20 blur-2xl pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/90 pointer-events-none" />

      {/* FIXED HEADER - Translucent */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <button
          onClick={() => {
            // Navigate within quiz states instead of always going to orbit
            if (gameState === 'PLAYING') {
              // From playing: pause and go to map
              pauseGame();
            } else if (gameState === 'MAP') {
              // From map: go to difficulty select
              setGameState('DIFFICULTY_SELECT');
            } else if (gameState === 'RESULT') {
              // From result: go to map
              setGameState('MAP');
            } else {
              // From difficulty select: go to orbit
              onBack();
            }
          }}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-orbitron font-bold tracking-widest text-white">ORBITAL ACADEMY</h1>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.3em]">
            {gameState === 'DIFFICULTY_SELECT' ? 'Choose your difficulty' :
              gameState === 'MAP' ? `Difficulty: ${difficulty}` :
                gameState === 'PLAYING' ? `Level ${currentLevelId} | ${difficulty}` :
                  'Results'}
          </p>
        </div>
      </header>

      {/* Main Content - Added Top Padding (pt-32) to push content down */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center pt-32 pb-24 px-4">
        <AnimatePresence mode="wait">

          {/* 1. DIFFICULTY SELECT */}
          {gameState === 'DIFFICULTY_SELECT' && (
            <motion.div key="diff" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl grid md:grid-cols-3 gap-6 mt-10">
              <div className="md:col-span-3 text-center mb-8">
                <Brain className="w-16 h-16 mx-auto text-white mb-4 animate-pulse" />
                <h2 className="text-4xl font-orbitron font-bold text-white mb-2">Initialize Simulation</h2>
                <p className="text-slate-400">Select your cognitive stress level.</p>
              </div>

              {[
                { id: 'EASY', label: 'Easy', desc: 'Standard protocols. Unlimited retries.', color: 'border-green-500/50 hover:bg-green-500/10' },
                { id: 'MEDIUM', label: 'Medium', desc: 'Advanced queries. Standard retries.', color: 'border-yellow-500/50 hover:bg-yellow-500/10' },
                { id: 'HARD', label: 'Hard', desc: 'Permadeath. Critical failure resets campaign.', color: 'border-red-500/50 hover:bg-red-500/10' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => startGame(d.id as Difficulty)}
                  className={`p-8 rounded-3xl border bg-slate-900/50 backdrop-blur-xl text-left transition-all group ${d.color}`}
                >
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-2 group-hover:scale-105 transition-transform">{d.label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{d.desc}</p>
                </button>
              ))}
            </motion.div>
          )}

          {/* 2. CAMPAIGN MAP */}
          {gameState === 'MAP' && (
            <motion.div key="map" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl">
              <h2 className="text-3xl font-orbitron font-bold text-center mb-12 text-white">Mission Trajectory</h2>
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-8 top-8 bottom-8 w-1 bg-white/10 rounded-full" />

                {nodes.map((node) => {
                  const isPaused = currentProgress.pausedSession?.levelId === node.data.id;

                  return (
                    <div key={node.data.id} className="relative flex items-center gap-6 mb-8 group">
                      {/* Node Circle */}
                      <button
                        disabled={!node.isUnlocked}
                        onClick={() => enterLevel(node.data.id)}
                        className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isPaused
                          ? 'bg-amber-500/20 border-amber-500 text-amber-500 hover:scale-110 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                          : node.isUnlocked
                            ? 'bg-black border-white text-white cursor-pointer hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-black border-white/10 text-slate-700 cursor-not-allowed'
                          }`}
                      >
                        {isPaused ? <PauseCircle className="w-8 h-8" /> : (node.completed ? <CheckCircle className="w-6 h-6" /> : node.isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />)}
                      </button>

                      {/* Info Card */}
                      <div className={`flex-1 p-6 rounded-2xl border backdrop-blur-md transition-all ${isPaused
                        ? 'bg-amber-900/20 border-amber-500/50'
                        : node.isUnlocked
                          ? 'bg-slate-900/60 border-white/20 hover:bg-slate-800/60'
                          : 'bg-black/40 border-white/5 opacity-50'
                        }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-orbitron font-bold text-lg ${isPaused ? 'text-amber-500' : 'text-white'}`}>
                              {node.data.title}
                            </h3>
                            <p className="text-sm text-slate-400">{node.data.description}</p>
                          </div>
                          {isPaused && (
                            <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">
                              Resume Mission
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 3. PLAYING QUIZ */}
          {gameState === 'PLAYING' && (
            <motion.div key="quiz" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-3xl">
              {/* Header Controls */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex) / 7) * 100}%` }}
                      className="h-full bg-white"
                    />
                  </div>
                  <span className="font-orbitron text-xs tracking-widest text-slate-400">Q{currentQuestionIndex + 1}/7</span>
                </div>

                {/* PAUSE BUTTON */}
                <button
                  onClick={pauseGame}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors text-xs font-orbitron tracking-widest uppercase"
                >
                  <Save className="w-4 h-4" />
                  Pause Mission
                </button>
              </div>

              {/* Question Card */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-white" />
                <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-8 leading-tight">
                  {activeQuestions[currentQuestionIndex].text}
                </h3>

                <div className="grid gap-4">
                  {activeQuestions[currentQuestionIndex].options.map((option: string, idx: number) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === activeQuestions[currentQuestionIndex].correctIndex;

                    let buttonStyle = "border-white/10 hover:bg-white/5 text-slate-300";
                    if (isAnswerRevealed) {
                      if (isCorrect) buttonStyle = "border-green-500 bg-green-500/20 text-green-200";
                      else if (isSelected && !isCorrect) buttonStyle = "border-red-500 bg-red-500/20 text-red-200";
                      else buttonStyle = "border-white/5 text-slate-600 opacity-50";
                    } else if (isSelected) {
                      buttonStyle = "border-white bg-white/10 text-white";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerRevealed}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all font-inter text-lg ${buttonStyle}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isAnswerRevealed && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end h-12">
                {isAnswerRevealed && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={nextQuestion}
                    className="px-8 py-3 bg-white text-black font-orbitron font-bold rounded-full hover:scale-105 transition-transform"
                  >
                    {currentQuestionIndex < 6 ? 'Next Sequence' : 'Finish Simulation'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* 4. RESULT SCREEN */}
          {gameState === 'RESULT' && (
            <motion.div key="result" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl text-center mt-20">

              <div className={`inline-flex p-6 rounded-full border-2 mb-8 ${score >= 5 ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                {score >= 5 ? <Star className="w-12 h-12 text-green-500" /> : <ShieldAlert className="w-12 h-12 text-red-500" />}
              </div>

              <h2 className="text-5xl font-orbitron font-bold text-white mb-4">
                {score >= 5 ? 'MISSION ACCOMPLISHED' : 'CRITICAL FAILURE'}
              </h2>

              <p className="text-xl text-slate-300 font-inter mb-8">
                You scored <span className="font-bold text-white">{score}/7</span>.
                {score >= 5 ? ' Sufficient proficiency demonstrated.' : ' Proficiency below acceptable threshold.'}
              </p>

              <div className="flex justify-center gap-4">
                {score >= 5 ? (
                  // SUCCESS
                  <button
                    onClick={handleNextLevel}
                    className="px-8 py-4 bg-white text-black font-orbitron font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    Next Level <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                ) : (
                  // FAIL
                  difficulty === 'HARD' ? (
                    // Hard Mode Fail
                    <div className="space-y-4">
                      <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Hardcore Mode Protocol Initiated: Resetting Campaign</p>
                      <button
                        onClick={handleRetry}
                        className="px-8 py-4 border border-red-500 text-red-500 font-orbitron font-bold rounded-full hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 mx-auto"
                      >
                        <RotateCcw className="w-4 h-4" /> Restart Campaign
                      </button>
                    </div>
                  ) : (
                    // Normal Fail
                    <button
                      onClick={handleRetry}
                      className="px-8 py-4 border border-white text-white font-orbitron font-bold rounded-full hover:bg-white hover:text-black transition-all flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Retry Module
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// Helper to generate quiz data (Keep this at the bottom or import it)

