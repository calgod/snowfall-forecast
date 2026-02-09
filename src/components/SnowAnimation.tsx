import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Snowflake {
    id: number
    x: number
    delay: number
    duration: number
    size: number
    opacity: number
}

interface SnowAnimationProps {
    darkMode?: boolean
}

export function SnowAnimation({ darkMode = false }: SnowAnimationProps) {
    const snowflakes = useMemo<Snowflake[]>(() => {
        const count = darkMode ? 120 : 50
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * (darkMode ? 5 : 10),
            duration: darkMode ? 3 + Math.random() * 5 : 10 + Math.random() * 20,
            size: darkMode ? 2 + Math.random() * 6 : 4 + Math.random() * 8,
            opacity: darkMode ? 0.5 + Math.random() * 0.5 : 0.3 + Math.random() * 0.5,
        }))
    }, [darkMode])

    // Wind streaks for blizzard mode
    const windStreaks = useMemo(() => {
        if (!darkMode) return []
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            y: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 0.8 + Math.random() * 1.2,
            width: 50 + Math.random() * 150,
            opacity: 0.03 + Math.random() * 0.08,
        }))
    }, [darkMode])

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Wind streaks in blizzard mode */}
            {darkMode && windStreaks.map((streak) => (
                <motion.div
                    key={`streak-${streak.id}`}
                    className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
                    style={{
                        top: `${streak.y}%`,
                        width: streak.width,
                        opacity: streak.opacity,
                    }}
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{
                        x: '100vw',
                        opacity: [0, streak.opacity, streak.opacity, 0]
                    }}
                    transition={{
                        duration: streak.duration,
                        delay: streak.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}

            {/* Fog/mist overlay in blizzard mode */}
            {darkMode && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/10"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}

            {/* Snowflakes */}
            {snowflakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${flake.x}%`,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        filter: darkMode ? 'blur(0.5px)' : undefined,
                    }}
                    initial={{ y: -20, rotate: 0 }}
                    animate={{
                        y: '100vh',
                        rotate: darkMode ? 180 : 360,
                        x: darkMode
                            ? [0, 100, 150, 200, 250]
                            : [0, 30, -20, 10, 0],
                    }}
                    transition={{
                        duration: flake.duration,
                        delay: flake.delay,
                        repeat: Infinity,
                        ease: 'linear',
                        x: {
                            duration: flake.duration,
                            repeat: Infinity,
                            ease: darkMode ? 'linear' : 'easeInOut',
                        },
                    }}
                />
            ))}

            {/* Extra small particles for blizzard */}
            {darkMode && Array.from({ length: 60 }, (_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute rounded-full bg-white/60"
                    style={{
                        left: `${Math.random() * 100}%`,
                        width: 1 + Math.random() * 2,
                        height: 1 + Math.random() * 2,
                    }}
                    initial={{ y: -10 }}
                    animate={{
                        y: '100vh',
                        x: [0, 80, 160, 240],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        delay: Math.random() * 5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    )
}
