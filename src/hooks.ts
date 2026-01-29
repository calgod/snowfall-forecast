import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchSnowfall, fetchLocationName, fetchWeeklySnowfall, getLocationFromIp, getUserLocation } from './api'
import type { Coordinates, DateRange } from './types'

export function useSnowfall(coords: Coordinates | null) {
    return useQuery({
        queryKey: ['snowfall', coords?.latitude, coords?.longitude],
        queryFn: () => {
            if (!coords) throw new Error('No coordinates')
            return fetchSnowfall(coords)
        },
        enabled: coords !== null,
        placeholderData: keepPreviousData,
    })
}

export function useWeeklySnowfall(coords: Coordinates | null, range: DateRange) {
    return useQuery({
        queryKey: ['weeklySnowfall', coords?.latitude, coords?.longitude, range],
        queryFn: () => {
            if (!coords) throw new Error('No coordinates')
            return fetchWeeklySnowfall(coords, range)
        },
        enabled: coords !== null,
        placeholderData: keepPreviousData,
    })
}

export function useLocationName(coords: Coordinates | null) {
    return useQuery({
        queryKey: ['locationName', coords?.latitude, coords?.longitude],
        queryFn: () => {
            if (!coords) throw new Error('No coordinates')
            return fetchLocationName(coords)
        },
        enabled: coords !== null,
        placeholderData: keepPreviousData,
    })
}

export function useIpLocation() {
    return useQuery({
        queryKey: ['ipLocation'],
        queryFn: getLocationFromIp,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    })
}

export function useBrowserLocation(enabled: boolean) {
    return useQuery({
        queryKey: ['browserLocation'],
        queryFn: getUserLocation,
        enabled,
        staleTime: 60 * 1000, // 1 minute
        retry: false, // Don't retry if user denies permission
    })
}
