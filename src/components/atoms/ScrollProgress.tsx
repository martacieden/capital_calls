import { motion, useScroll, useTransform } from 'motion/react'

export function ScrollProgress({ trackRef }: { trackRef: React.RefObject<HTMLDivElement | null> }) {
    const { scrollXProgress } = useScroll({ container: trackRef })
    const width = useTransform(scrollXProgress, [0, 1], ['2%', '100%'])

    return (
        <div className="tl-progress absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--color-neutral-3)] rounded-[var(--radius-full)] overflow-hidden">
            <motion.div className="h-full rounded-[var(--radius-full)] bg-[var(--color-accent-9)] min-w-[2%]" style={{ width }} />
        </div>
    )
}
