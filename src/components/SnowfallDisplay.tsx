import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSnowfall, useLocationName, useWeeklySnowfall } from '../hooks'
import { LoadingSpinner } from './LoadingSpinner'
import type { Coordinates, DateRange, WeeklySnowfallData } from '../types'

interface SnowfallDisplayProps {
    coords: Coordinates
    manualLocationName?: string | undefined
    isApproximate?: boolean
    onReset: () => void
    onUsePreciseLocation?: () => void
}

const DATE_RANGE_LABELS: Record<DateRange, string> = {
    'last-week': 'Last 7 Days',
    'today': 'Today',
    'next-week': 'Next 7 Days',
}

export function SnowfallDisplay({ coords, manualLocationName, isApproximate, onReset, onUsePreciseLocation }: SnowfallDisplayProps) {
    const [selectedRange, setSelectedRange] = useState<DateRange>('today')

    const snowfallQuery = useSnowfall(coords)
    const weeklyQuery = useWeeklySnowfall(coords, selectedRange)
    const locationQuery = useLocationName(manualLocationName ? null : coords)

    // Only show full loading spinner on initial load (no data yet)
    const hasNoData =
        (selectedRange === 'today' && !snowfallQuery.data) ||
        (selectedRange !== 'today' && !weeklyQuery.data)

    const isInitialLoading =
        hasNoData && (
            (selectedRange === 'today' && snowfallQuery.isLoading) ||
            (selectedRange !== 'today' && weeklyQuery.isLoading) ||
            (!manualLocationName && locationQuery.isLoading)
        )

    // Show subtle loading indicator when refetching
    const isRefetching =
        (selectedRange === 'today' && snowfallQuery.isFetching) ||
        (selectedRange !== 'today' && weeklyQuery.isFetching)

    const error = snowfallQuery.error ?? weeklyQuery.error ?? locationQuery.error

    if (isInitialLoading) {
        return <LoadingSpinner />
    }

    if (error) {
        return (
            <div className="text-center">
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-3xl p-8">
                    <p className="text-red-200 text-lg mb-4">Failed to load weather data</p>
                    <p className="text-red-300/70 text-sm mb-6">{error.message}</p>
                    <button
                        onClick={onReset}
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const locationName = manualLocationName ?? formatLocationName(locationQuery.data)
    const snowfall = selectedRange === 'today'
        ? (snowfallQuery.data?.snowfallInches ?? 0)
        : (weeklyQuery.data?.totalInches ?? 0)

    return (
        <div
            className={`text-center h-[420px] flex flex-col transition-opacity duration-200 ${isRefetching ? 'opacity-70' : 'opacity-100'}`}
        >
            {/* ROW 1: Header - Location, Tabs, Date */}
            <div className="flex-shrink-0">
                {/* Location name */}
                <h2 className="text-2xl md:text-3xl font-medium text-white/90 mb-2">
                    {locationName}
                </h2>

                {/* Date Range Tabs */}
                <div className="flex justify-center gap-2 mb-4">
                    {(['last-week', 'today', 'next-week'] as DateRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setSelectedRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedRange === range
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-transparent'
                                }`}
                        >
                            {DATE_RANGE_LABELS[range]}
                        </button>
                    ))}
                </div>

                {/* Date or Date Range */}
                <p className="text-white/50 text-lg mb-4">
                    {selectedRange === 'today'
                        ? formatDate(snowfallQuery.data?.date)
                        : formatDateRange(weeklyQuery.data)}
                </p>
            </div>

            {/* ROW 2: Main Content - Snowfall amount + Weekly grid (always reserve space) */}
            <div className="flex-1 min-h-0 flex flex-col justify-center">
                {/* Snowfall amount */}
                <div className="flex-shrink py-2">
                    {snowfall > 0 ? (
                        <div>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="font-bold text-white drop-shadow-lg text-5xl md:text-6xl lg:text-7xl">
                                    {formatSnowfall(snowfall)}
                                </span>
                                <span className="text-white/70 font-light text-xl md:text-2xl">
                                    {snowfall === 1 ? 'inch' : 'inches'}
                                </span>
                            </div>
                            <p className="text-white/60 text-sm lg:text-base mt-1">
                                {selectedRange === 'today'
                                    ? 'of snow expected'
                                    : selectedRange === 'last-week'
                                        ? 'total snowfall'
                                        : 'of snow forecasted'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <motion.div
                                className="text-5xl mb-1"
                                animate={{ rotate: [-10, 10, -10] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                ☀️
                            </motion.div>
                            <p className="text-xl md:text-2xl font-medium text-white/90">No snow expected</p>
                            <p className="text-white/50 text-sm mt-1">Clear skies ahead!</p>
                        </div>
                    )}
                </div>

                {/* Weekly breakdown - always reserve space, show content only for weekly views */}
                <div className="mt-2 min-h-[60px] flex-shrink">
                    {selectedRange !== 'today' && weeklyQuery.data && weeklyQuery.data.days.length > 0 ? (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2">
                            <div className="grid grid-cols-7 gap-1">
                                {weeklyQuery.data.days.map((day) => (
                                    <div
                                        key={day.date}
                                        className="flex flex-col items-center justify-center py-1 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-white/50 text-xs">
                                            {formatDayName(day.date)}
                                        </span>
                                        <span className={`text-sm font-semibold ${day.snowfallInches > 0 ? 'text-white' : 'text-white/30'}`}>
                                            {day.snowfallInches > 0
                                                ? `${formatSnowfall(day.snowfallInches)}"`
                                                : '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Empty placeholder to reserve space */
                        <div className="min-h-[60px]" />
                    )}
                </div>
            </div>

            {/* ROW 3: Footer - Action buttons */}
            <div className="flex-shrink-0 pt-4">
                <div className="flex flex-row gap-2 items-center justify-center max-w-md mx-auto">
                    {isApproximate && onUsePreciseLocation && (
                        <button
                            onClick={onUsePreciseLocation}
                            className="flex-1 min-w-0 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:text-white transition-all text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                        >
                            <span>📍</span>
                            <span>Use precise location</span>
                        </button>
                    )}
                    <button
                        onClick={onReset}
                        className="flex-1 min-w-0 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white/70 hover:text-white transition-all text-xs sm:text-sm"
                    >
                        Check another location
                    </button>
                </div>

                {/* Approximate location notice */}
                {isApproximate && (
                    <p className="text-white/40 text-xs mt-2 text-center">
                        Location estimated from your IP address
                    </p>
                )}
            </div>
        </div>
    )
}

function formatLocationName(
    data: { name: string; region?: string | undefined; country?: string | undefined } | undefined
): string {
    if (!data) return 'Unknown Location'
    if (data.region) {
        return `${data.name}, ${data.region}`
    }
    return data.name
}

function formatSnowfall(inches: number): string {
    if (inches === Math.floor(inches)) {
        return inches.toString()
    }
    return inches.toFixed(1)
}

function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Today'
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
}

function formatDateRange(data: WeeklySnowfallData | undefined): string {
    if (!data || data.days.length === 0) return ''
    const firstDay = data.days[0]
    const lastDay = data.days[data.days.length - 1]
    if (!firstDay || !lastDay) return ''
    const startDate = new Date(firstDay.date + 'T00:00:00')
    const endDate = new Date(lastDay.date + 'T00:00:00')

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`
}

function formatDayName(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short' })
}
