import { motion } from 'framer-motion'

interface FrostyHeaderProps {
    darkMode?: boolean
}

export function FrostyHeader({ darkMode = false }: FrostyHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
        >
            <motion.svg
                viewBox="0 0 500 100"
                className="w-full max-w-xl mx-auto h-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            >
                <defs>
                    {/* Glassy ice gradient */}
                    <linearGradient id="iceGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="25%" stopColor="#e8f4fc" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#cde8f6" stopOpacity="0.85" />
                        <stop offset="75%" stopColor="#a8d4ed" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#7cc0e0" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Blizzard variant - colder, more intense */}
                    <linearGradient id="iceGlassBlizzard" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#c8dce8" stopOpacity="1" />
                        <stop offset="30%" stopColor="#9fc5da" stopOpacity="0.95" />
                        <stop offset="70%" stopColor="#6aa4c4" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#4889ab" stopOpacity="1" />
                    </linearGradient>

                    {/* Glass reflection highlight */}
                    <linearGradient id="glassShine" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                        <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>

                    {/* Subtle inner glow */}
                    <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                        <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
                        <feFlood floodColor="#ffffff" floodOpacity="0.5" />
                        <feComposite in2="offsetBlur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Crisp drop shadow */}
                    <filter id="crispShadow" x="-10%" y="-10%" width="120%" height="130%">
                        <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#1a4a6e" floodOpacity="0.25" />
                    </filter>

                    {/* Clip path for glass reflection */}
                    <clipPath id="textClip">
                        <text
                            x="250"
                            y="52"
                            textAnchor="middle"
                            fontSize="52"
                            fontWeight="700"
                            fontFamily="system-ui, -apple-system, sans-serif"
                            letterSpacing="-1"
                        >
                            Snowfall
                        </text>
                        <text
                            x="250"
                            y="88"
                            textAnchor="middle"
                            fontSize="24"
                            fontWeight="300"
                            fontFamily="system-ui, -apple-system, sans-serif"
                            letterSpacing="6"
                        >
                            FORECAST
                        </text>
                    </clipPath>
                </defs>

                {/* Main text - base layer with glass gradient */}
                <text
                    x="250"
                    y="52"
                    textAnchor="middle"
                    fontSize="52"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={`url(#${darkMode ? 'iceGlassBlizzard' : 'iceGlass'})`}
                    filter="url(#crispShadow)"
                    letterSpacing="-1"
                >
                    Snowfall
                </text>

                {/* Glass reflection overlay on main text */}
                <rect
                    x="0"
                    y="0"
                    width="500"
                    height="42"
                    fill="url(#glassShine)"
                    clipPath="url(#textClip)"
                    style={{ mixBlendMode: 'overlay' }}
                />

                {/* Subtitle - sleek, light weight */}
                <text
                    x="250"
                    y="88"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="300"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={`url(#${darkMode ? 'iceGlassBlizzard' : 'iceGlass'})`}
                    letterSpacing="6"
                    opacity="0.9"
                    filter="url(#innerGlow)"
                >
                    FORECAST
                </text>

                {/* Minimal ice crystal accents */}
                {[
                    { x: 72, y: 50, size: 6, delay: 0 },
                    { x: 428, y: 50, size: 6, delay: 0.3 },
                ].map((crystal, i) => (
                    <motion.g key={i}>
                        {/* Small hexagonal crystal shape */}
                        <motion.polygon
                            points={`${crystal.x},${crystal.y - crystal.size} ${crystal.x + crystal.size * 0.866},${crystal.y - crystal.size * 0.5} ${crystal.x + crystal.size * 0.866},${crystal.y + crystal.size * 0.5} ${crystal.x},${crystal.y + crystal.size} ${crystal.x - crystal.size * 0.866},${crystal.y + crystal.size * 0.5} ${crystal.x - crystal.size * 0.866},${crystal.y - crystal.size * 0.5}`}
                            fill="none"
                            stroke={darkMode ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)"}
                            strokeWidth="1"
                            animate={{
                                opacity: [0.3, 0.7, 0.3],
                                rotate: [0, 30, 0],
                            }}
                            transition={{
                                duration: 4,
                                delay: crystal.delay,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{ transformOrigin: `${crystal.x}px ${crystal.y}px` }}
                        />
                    </motion.g>
                ))}

                {/* Subtle shimmer line that moves across */}
                <motion.rect
                    x="-50"
                    y="20"
                    width="30"
                    height="60"
                    fill="url(#glassShine)"
                    clipPath="url(#textClip)"
                    animate={{
                        x: [-50, 550],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                    }}
                    style={{ mixBlendMode: 'overlay' }}
                />
            </motion.svg>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-base mt-4 transition-colors duration-300 ${darkMode ? 'text-white/60' : 'text-white/50'}`}
            >
                See how much snow is expected in your area
            </motion.p>
        </motion.div>
    )
}
