import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserLocation } from './api'
import {
    SnowAnimation,
    LoadingSpinner,
    LocationInput,
    SnowfallDisplay,
    FrostyHeader,
} from './components'
import type { Coordinates } from './types'

type AppState = 'loading' | 'manual-input' | 'display'

export default function App() {
    const [state, setState] = useState<AppState>('loading')
    const [coords, setCoords] = useState<Coordinates | null>(null)
    const [manualLocationName, setManualLocationName] = useState<string | undefined>()
    const [geoError, setGeoError] = useState<string | null>(null)
    const [blizzardMode, setBlizzardMode] = useState(false)

    useEffect(() => {
        // Toggle body class for background color
        if (blizzardMode) {
            document.body.classList.add('blizzard-mode')
        } else {
            document.body.classList.remove('blizzard-mode')
        }
    }, [blizzardMode])

    useEffect(() => {
        let mounted = true

        getUserLocation()
            .then((location) => {
                if (mounted) {
                    setCoords(location)
                    setState('display')
                }
            })
            .catch((error: Error) => {
                if (mounted) {
                    setGeoError(error.message)
                    setState('manual-input')
                }
            })

        return () => {
            mounted = false
        }
    }, [])

    const handleManualLocation = (newCoords: Coordinates, locationName: string) => {
        setCoords(newCoords)
        setManualLocationName(locationName)
        setState('display')
    }

    const handleReset = () => {
        setCoords(null)
        setManualLocationName(undefined)
        setState('manual-input')
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
                        {state === 'loading' && (
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

                        {state === 'manual-input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                {geoError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3 mb-6 text-center"
                                    >
                                        <p className="text-amber-200 text-sm">{geoError}</p>
                                        <p className="text-amber-200/70 text-xs mt-1">
                                            Enter a location manually below
                                        </p>
                                    </motion.div>
                                )}
                                <LocationInput onLocationFound={handleManualLocation} />
                            </motion.div>
                        )}

                        {state === 'display' && coords && (
                            <motion.div
                                key="display"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <SnowfallDisplay
                                    coords={coords}
                                    manualLocationName={manualLocationName}
                                    onReset={handleReset}
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
