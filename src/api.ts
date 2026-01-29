import type {
    Coordinates,
    SnowfallData,
    LocationData,
    OpenMeteoForecastResponse,
    OpenMeteoGeocodingResponse,
    NominatimResponse,
    GeocodingResult,
    WeeklySnowfallData,
    DateRange,
} from './types'

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const OPEN_METEO_HISTORICAL_URL = 'https://archive-api.open-meteo.com/v1/archive'
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

export async function fetchSnowfall(coords: Coordinates): Promise<SnowfallData> {
    const params = new URLSearchParams({
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        daily: 'snowfall_sum',
        precipitation_unit: 'inch',
        timezone: 'auto',
        forecast_days: '1',
    })

    const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params}`)

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
    }

    const data: OpenMeteoForecastResponse = await response.json()

    const date = data.daily.time[0]
    const snowfall = data.daily.snowfall_sum[0]

    if (date === undefined || snowfall === undefined) {
        throw new Error('Invalid response from weather API')
    }

    return {
        date,
        snowfallInches: snowfall,
    }
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0] ?? ''
}

function getDateRange(range: DateRange): { startDate: string; endDate: string } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (range === 'last-week') {
        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() - 1) // Yesterday
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 7) // 7 days ago
        return { startDate: formatDate(startDate), endDate: formatDate(endDate) }
    } else if (range === 'next-week') {
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() + 1) // Tomorrow
        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() + 7) // 7 days from now
        return { startDate: formatDate(startDate), endDate: formatDate(endDate) }
    }
    // Today
    return { startDate: formatDate(today), endDate: formatDate(today) }
}

export async function fetchWeeklySnowfall(
    coords: Coordinates,
    range: DateRange
): Promise<WeeklySnowfallData> {
    const { startDate, endDate } = getDateRange(range)

    // Use historical API for past data, forecast API for today and future
    const apiUrl = range === 'last-week' ? OPEN_METEO_HISTORICAL_URL : OPEN_METEO_FORECAST_URL

    const params = new URLSearchParams({
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        daily: 'snowfall_sum',
        precipitation_unit: 'inch',
        timezone: 'auto',
        start_date: startDate,
        end_date: endDate,
    })

    const response = await fetch(`${apiUrl}?${params}`)

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
    }

    const data: OpenMeteoForecastResponse = await response.json()

    const days = data.daily.time.map((date, index) => ({
        date,
        snowfallInches: data.daily.snowfall_sum[index] ?? 0,
    }))

    const totalInches = days.reduce((sum, day) => sum + day.snowfallInches, 0)

    return {
        days,
        totalInches,
    }
}

export async function fetchLocationName(coords: Coordinates): Promise<LocationData> {
    const params = new URLSearchParams({
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
        format: 'json',
    })

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: {
            'User-Agent': 'SnowfallApp/1.0',
        },
    })

    if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data: NominatimResponse = await response.json()

    const name =
        data.address.city ??
        data.address.town ??
        data.address.village ??
        data.address.municipality ??
        data.address.county ??
        'Unknown Location'

    return {
        name,
        region: data.address.state ?? undefined,
        country: data.address.country ?? undefined,
    }
}

// US state abbreviations mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
    al: 'alabama', ak: 'alaska', az: 'arizona', ar: 'arkansas', ca: 'california',
    co: 'colorado', ct: 'connecticut', de: 'delaware', fl: 'florida', ga: 'georgia',
    hi: 'hawaii', id: 'idaho', il: 'illinois', in: 'indiana', ia: 'iowa',
    ks: 'kansas', ky: 'kentucky', la: 'louisiana', me: 'maine', md: 'maryland',
    ma: 'massachusetts', mi: 'michigan', mn: 'minnesota', ms: 'mississippi', mo: 'missouri',
    mt: 'montana', ne: 'nebraska', nv: 'nevada', nh: 'new hampshire', nj: 'new jersey',
    nm: 'new mexico', ny: 'new york', nc: 'north carolina', nd: 'north dakota', oh: 'ohio',
    ok: 'oklahoma', or: 'oregon', pa: 'pennsylvania', ri: 'rhode island', sc: 'south carolina',
    sd: 'south dakota', tn: 'tennessee', tx: 'texas', ut: 'utah', vt: 'vermont',
    va: 'virginia', wa: 'washington', wv: 'west virginia', wi: 'wisconsin', wy: 'wyoming',
    dc: 'district of columbia',
}

function matchesState(stateFilter: string, admin1: string | undefined): boolean {
    if (!admin1) return false
    const admin1Lower = admin1.toLowerCase()
    const filterLower = stateFilter.toLowerCase().replace(/\./g, '')

    // Direct match
    if (admin1Lower.includes(filterLower) || filterLower.includes(admin1Lower)) {
        return true
    }

    // Abbreviation match
    const fullStateName = STATE_ABBREVIATIONS[filterLower]
    return fullStateName !== undefined && admin1Lower.includes(fullStateName)
}

export async function searchLocation(query: string): Promise<GeocodingResult | null> {
    // Parse "City, State" format
    const parts = query.split(',').map((p) => p.trim())
    const searchName = parts[0] ?? query
    const stateFilter = parts.length > 1 ? parts[1] : undefined

    const params = new URLSearchParams({
        name: searchName,
        count: stateFilter ? '20' : '1',
        language: 'en',
        format: 'json',
    })

    const response = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`)

    if (!response.ok) {
        throw new Error(`Geocoding search error: ${response.status}`)
    }

    const data: OpenMeteoGeocodingResponse = await response.json()

    if (!data.results || data.results.length === 0) {
        return null
    }

    // If user specified a state, filter results to match
    if (stateFilter) {
        const filtered = data.results.find((r) => matchesState(stateFilter, r.admin1))
        return filtered ?? data.results[0] ?? null
    }

    return data.results[0] ?? null
}

export function getUserLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('Geolocation is not supported by your browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Location permission denied'))
                        break
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Location unavailable'))
                        break
                    case error.TIMEOUT:
                        reject(new Error('Location request timed out'))
                        break
                    default:
                        reject(new Error('Unknown location error'))
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            }
        )
    })
}
