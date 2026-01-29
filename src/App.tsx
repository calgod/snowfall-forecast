import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SnowAnimation,
    LoadingSpinner,
    LocationInput,
    SnowfallDisplay,
    FrostyHeader,
} from './components'
import { useIpLocation, useBrowserLocation } from './hooks'
import type { Coordinates } from './types'

export default function App() {
    const [manualLocation, setManualLocation] = useState<{ coords: Coordinates; name: string } | null>(null)
    const [requestPreciseLocation] = useState(true) // Always prompt on initial load
    const [forceManualInput, setForceManualInput] = useState(false)
    const [blizzardMode, setBlizzardMode] = useState(false)

    // Fetch IP-based location (runs in background)
    const ipLocationQuery = useIpLocation()

    // Fetch browser location (prompts user on initial load)
    const browserLocationQuery = useBrowserLocation(requestPreciseLocation)

    useEffect(() => {
        // Toggle body class for background color
        if (blizzardMode) {
            document.body.classList.add('blizzard-mode')
        } else {
            document.body.classList.remove('blizzard-mode')
        }
    }, [blizzardMode])

    // Determine current location state
    const hasBrowserLocation = browserLocationQuery.isSuccess && browserLocationQuery.data
    const hasIpLocation = ipLocationQuery.isSuccess && ipLocationQuery.data
    const hasManualLocation = manualLocation !== null

    // Priority: browser > IP (manual only when forceManualInput is true)
    // When forceManualInput is true, show manual location if searched, otherwise show input form
    const currentCoords = forceManualInput
        ? manualLocation?.coords ?? null  // Only use manual when explicitly in manual mode
        : (hasBrowserLocation ? browserLocationQuery.data : null)
        ?? (hasIpLocation ? ipLocationQuery.data.coords : null)

    const currentLocationName = forceManualInput
        ? manualLocation?.name
        : (hasIpLocation && !hasBrowserLocation
            ? (ipLocationQuery.data.region
                ? `${ipLocationQuery.data.city}, ${ipLocationQuery.data.region}`
                : ipLocationQuery.data.city)
            : undefined)

    const isApproximate = !forceManualInput && !hasBrowserLocation && hasIpLocation ? true : false

    // Loading: waiting for at least one location source (and not in manual mode)
    const isLoading = !forceManualInput && !hasBrowserLocation && !hasIpLocation && (ipLocationQuery.isLoading || browserLocationQuery.isLoading)

    // Show manual input when:
    // 1. User clicked "check another location" (forceManualInput) AND hasn't searched yet
    // 2. OR both location sources failed
    const bothFailed = !forceManualInput && !isLoading && !hasBrowserLocation && !hasIpLocation &&
        (ipLocationQuery.isError || ipLocationQuery.isSuccess) &&
        (browserLocationQuery.isError || browserLocationQuery.isSuccess)
    const showManualInput = (forceManualInput && !hasManualLocation) || bothFailed

    const handleManualLocation = (newCoords: Coordinates, locationName: string) => {
        setManualLocation({ coords: newCoords, name: locationName })
        // Stay in forceManualInput mode to show the searched location
    }

    const handleUsePreciseLocation = () => {
        setForceManualInput(false) // Exit manual mode, go back to auto-detection
        setManualLocation(null) // Clear any manual location
        // Refetch browser location in case it failed previously
        browserLocationQuery.refetch()
    }

    const handleReset = () => {
        setManualLocation(null)
        setForceManualInput(true) // Enter manual mode
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative transition-colors duration-500 ${blizzardMode ? 'text-white' : ''}`}>
            <SnowAnimation blizzardMode={blizzardMode} />

            {/* Blizzard Mode Toggle */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setBlizzardMode(!blizzardMode)}
                className={`fixed top-4 right-4 z-20 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${blizzardMode
                    ? 'bg-white/20 text-white border border-white/30 shadow-lg shadow-white/10'
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white'
                    }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-lg">{blizzardMode ? '🌨️' : '🌙'}</span>
                <span>{blizzardMode ? 'Blizzard' : 'Dark Mode'}</span>
            </motion.button>

            <div className="relative z-10 w-full max-w-2xl mx-auto">
                {/* Header */}
                <FrostyHeader blizzardMode={blizzardMode} />

                {/* Main content */}
                <div className={`backdrop-blur-md border rounded-3xl p-8 md:p-12 shadow-2xl transition-all duration-500 ${blizzardMode
                    ? 'bg-black/30 border-white/10 shadow-white/5'
                    : 'bg-white/10 border-white/20'
                    }`}>
                    <AnimatePresence mode="wait">
                        {isLoading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <LoadingSpinner />
                                <p className="text-white/50 text-sm mt-4">Getting your location...</p>
                            </motion.div>
                        )}

                        {showManualInput && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <LocationInput onLocationFound={handleManualLocation} />
                            </motion.div>
                        )}

                        {!isLoading && !showManualInput && currentCoords && (
                            <motion.div
                                key="display"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <SnowfallDisplay
                                    coords={currentCoords}
                                    manualLocationName={currentLocationName}
                                    isApproximate={isApproximate}
                                    onReset={handleReset}
                                    onUsePreciseLocation={handleUsePreciseLocation}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-white/30 text-sm mt-8"
                >
                    Powered by Open-Meteo • Updates every minute
                </motion.p>
            </div>
        </div>
    )
}
