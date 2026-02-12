import { useState } from 'react'
import { motion } from 'framer-motion'
import { searchLocation } from '../api'
import type { Coordinates } from '../types'

interface LocationInputProps {
    onLocationFound: (coords: Coordinates, locationName: string) => void
    darkMode?: boolean
}

export function LocationInput({ onLocationFound, darkMode }: LocationInputProps) {
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setIsSearching(true)
        setError(null)

        try {
            const result = await searchLocation(query.trim())
            if (result) {
                onLocationFound(
                    { latitude: result.latitude, longitude: result.longitude },
                    result.admin1 ? `${result.name}, ${result.admin1}` : result.name
                )
            } else {
                setError('Location not found. Try a different search.')
            }
        } catch {
            setError('Failed to search location. Please try again.')
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="City, State or zip code"
                        className={`w-full px-6 py-4 text-lg appearance-none bg-white/10 border border-white/20 rounded-2xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all ${darkMode ? 'text-white/70' : 'text-white'}`}
                        disabled={isSearching}
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <motion.div
                                className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    )}
                </div>

                <motion.button
                    type="submit"
                    disabled={isSearching || !query.trim()}
                    className={`px-8 py-4 appearance-none bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/20 rounded-2xl font-medium text-lg transition-all ${darkMode ? 'text-white/70' : 'text-white'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSearching ? 'Searching...' : 'Check Snowfall'}
                </motion.button>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-300 text-center"
                    >
                        {error}
                    </motion.p>
                )}
            </form>
        </motion.div>
    )
}
