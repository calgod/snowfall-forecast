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

    const isLoading =
        (selectedRange === 'today' && snowfallQuery.isLoading) ||
        (selectedRange !== 'today' && weeklyQuery.isLoading) ||
        (!manualLocationName && locationQuery.isLoading)

    const error = snowfallQuery.error ?? weeklyQuery.error ?? locationQuery.error

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
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
            </motion.div>
        )
    }

    const locationName = manualLocationName ?? formatLocationName(locationQuery.data)
    const snowfall = selectedRange === 'today'
        ? (snowfallQuery.data?.snowfallInches ?? 0)
        : (weeklyQuery.data?.totalInches ?? 0)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="text-center"
        >
            {/* Location name */}
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-medium text-white/90 mb-2"
            >
                {locationName}
            </motion.h2>

            {/* Date Range Tabs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex justify-center gap-2 mb-6"
            >
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
            </motion.div>

            {/* Date or Date Range */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/50 text-lg mb-8"
            >
                {selectedRange === 'today'
                    ? formatDate(snowfallQuery.data?.date)
                    : formatDateRange(weeklyQuery.data)}
            </motion.p>

            {/* Snowfall amount */}
            <motion.div
                key={selectedRange}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', damping: 15 }}
                className={selectedRange === 'today' ? 'mb-8' : 'mb-4'}
            >
                {snowfall > 0 ? (
                    <>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className={`font-bold text-white drop-shadow-lg ${selectedRange === 'today' ? 'text-8xl md:text-9xl' : 'text-6xl md:text-7xl'}`}>
                                {formatSnowfall(snowfall)}
                            </span>
                            <span className={`text-white/70 font-light ${selectedRange === 'today' ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
                                {snowfall === 1 ? 'inch' : 'inches'}
                            </span>
                        </div>
                        <p className={`text-white/60 ${selectedRange === 'today' ? 'text-xl mt-4' : 'text-lg mt-2'}`}>
                            {selectedRange === 'today'
                                ? 'of snow expected'
                                : selectedRange === 'last-week'
                                    ? 'total snowfall'
                                    : 'of snow forecasted'}
                        </p>
                    </>
                ) : (
                    <div className="py-8">
                        <motion.div
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 10 }}
                            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                            className="text-7xl mb-4"
                        >
                            ☀️
                        </motion.div>
                        <p className="text-3xl md:text-4xl font-medium text-white/90">No snow expected</p>
                        <p className="text-white/50 text-lg mt-2">Clear skies ahead!</p>
                    </div>
                )}
            </motion.div>

            {/* Snowflake decoration for snowy days */}
            {snowfall > 0 && selectedRange === 'today' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center gap-4 mb-8"
                >
                    {[...Array(Math.min(5, Math.ceil(snowfall)))].map((_, i) => (
                        <motion.span
                            key={i}
                            className="text-4xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        >
                            ❄️
                        </motion.span>
                    ))}
                </motion.div>
            )}

            {/* Daily breakdown for weekly views */}
            {selectedRange !== 'today' && weeklyQuery.data && weeklyQuery.data.days.length > 0 && (
                <motion.div
                    key={`breakdown-${selectedRange}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 lg:p-4 mb-6"
                >
                    <div className="grid grid-cols-7 gap-1 lg:gap-2">
                        {weeklyQuery.data.days.map((day, index) => (
                            <motion.div
                                key={day.date}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 + index * 0.03 }}
                                className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <span className="text-white/50 text-xs lg:text-sm">
                                    {formatDayName(day.date)}
                                </span>
                                <span className="text-white/40 text-xs mb-1">
                                    {formatDayDate(day.date)}
                                </span>
                                <span className={`text-sm lg:text-base font-semibold ${day.snowfallInches > 0 ? 'text-white' : 'text-white/30'
                                    }`}>
                                    {day.snowfallInches > 0
                                        ? `${formatSnowfall(day.snowfallInches)}"`
                                        : '—'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Reset button */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                {isApproximate && onUsePreciseLocation && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        onClick={onUsePreciseLocation}
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:text-white transition-all text-sm flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>📍</span>
                        <span>Use precise location</span>
                    </motion.button>
                )}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={onReset}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white/70 hover:text-white transition-all text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Check another location
                </motion.button>
            </div>

            {/* Approximate location notice */}
            {isApproximate && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-white/40 text-xs mt-4 text-center"
                >
                    Location estimated from your IP address
                </motion.p>
            )}
        </motion.div>
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

function formatDayDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
