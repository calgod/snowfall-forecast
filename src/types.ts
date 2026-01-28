export interface Coordinates {
    latitude: number
    longitude: number
}

export interface SnowfallData {
    date: string
    snowfallInches: number
}

export interface DailySnowfall {
    date: string
    snowfallInches: number
}

export interface WeeklySnowfallData {
    days: DailySnowfall[]
    totalInches: number
}

export type DateRange = 'last-week' | 'today' | 'next-week'

export interface LocationData {
    name: string
    region?: string
    country?: string
}

export interface GeocodingResult {
    name: string
    latitude: number
    longitude: number
    country: string
    admin1?: string // State/region
}

// Open-Meteo API response types
export interface OpenMeteoForecastResponse {
    latitude: number
    longitude: number
    timezone: string
    daily: {
        time: string[]
        snowfall_sum: number[]
    }
    daily_units: {
        snowfall_sum: string
    }
}

export interface OpenMeteoGeocodingResponse {
    results?: GeocodingResult[]
}

// Nominatim reverse geocoding response
export interface NominatimResponse {
    display_name: string
    address: {
        city?: string
        town?: string
        village?: string
        municipality?: string
        county?: string
        state?: string
        country?: string
    }
}
