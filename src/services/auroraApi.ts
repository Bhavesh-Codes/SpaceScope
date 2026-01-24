/**
 * Aurora API Service
 * Fetches real-time aurora data from NOAA's Space Weather Prediction Center
 */

export interface AuroraData {
  kpIndex: number; // 0-9 scale, higher = more aurora activity
  forecast: AuroraForecast[];
  timestamp: string;
  probability: {
    northern: number; // 0-100%
    southern: number; // 0-100%
  };
}

export interface AuroraForecast {
  time: string;
  kp: number;
}

// Kp index to aurora visibility latitude threshold
const KP_LATITUDE_MAP: Record<number, number> = {
  0: 67,
  1: 65,
  2: 62,
  3: 58,
  4: 55,
  5: 50,
  6: 48,
  7: 45,
  8: 42,
  9: 40,
};

/**
 * Get the visible aurora latitude based on Kp index
 */
export function getAuroraLatitude(kpIndex: number): number {
  const kp = Math.min(9, Math.max(0, Math.round(kpIndex)));
  return KP_LATITUDE_MAP[kp] || 67;
}

/**
 * Fetch current Kp index from NOAA
 */
export async function fetchCurrentKpIndex(): Promise<number> {
  try {
    // NOAA real-time Kp index endpoint
    const response = await fetch(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
      { next: { revalidate: 900 } } // Cache for 15 minutes
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Kp index');
    }
    
    const data = await response.json();
    // Data format: [["time_tag", "Kp", ...], ["2024-01-01 00:00:00", "2", ...]]
    if (data && data.length > 1) {
      const latestEntry = data[data.length - 1];
      const kpValue = parseFloat(latestEntry[1]);
      return isNaN(kpValue) ? 2 : kpValue;
    }
    
    return 2; // Default moderate activity
  } catch (error) {
    console.error('Error fetching Kp index:', error);
    return 2; // Default on error
  }
}

/**
 * Fetch 3-day aurora forecast
 */
export async function fetchAuroraForecast(): Promise<AuroraForecast[]> {
  try {
    const response = await fetch(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch aurora forecast');
    }
    
    const data = await response.json();
    // Skip header row
    return data.slice(1).map((entry: string[]) => ({
      time: entry[0],
      kp: parseFloat(entry[1]) || 0,
    }));
  } catch (error) {
    console.error('Error fetching aurora forecast:', error);
    return [];
  }
}

/**
 * Fetch combined aurora data
 */
export async function fetchAuroraData(): Promise<AuroraData> {
  const [kpIndex, forecast] = await Promise.all([
    fetchCurrentKpIndex(),
    fetchAuroraForecast(),
  ]);
  
  // Calculate probability based on Kp index
  // Higher Kp = more visible aurora, further from poles
  const baseProbability = Math.min(100, kpIndex * 10 + 20);
  
  return {
    kpIndex,
    forecast,
    timestamp: new Date().toISOString(),
    probability: {
      northern: baseProbability,
      southern: baseProbability * 0.9, // Slightly less visible in southern hemisphere
    },
  };
}

/**
 * Get aurora intensity for animation (0-1 based on Kp)
 */
export function getAuroraIntensity(kpIndex: number): number {
  return Math.min(1, kpIndex / 9);
}

/**
 * Get aurora color based on activity level
 * Low activity: green, High activity: red/purple
 */
export function getAuroraColors(kpIndex: number): { primary: string; secondary: string } {
  if (kpIndex <= 3) {
    return { primary: '#00ff88', secondary: '#00ffcc' }; // Green
  } else if (kpIndex <= 6) {
    return { primary: '#00ff88', secondary: '#ff00ff' }; // Green + Purple
  } else {
    return { primary: '#ff00ff', secondary: '#ff3366' }; // Purple + Red
  }
}
