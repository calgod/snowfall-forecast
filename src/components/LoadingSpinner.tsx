import { motion } from 'framer-motion'

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-4">
            <motion.div
                className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p
                className="text-white/70 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Checking the skies...
            </motion.p>
        </div>
    )
}
