import { useRef } from 'react'
import { PORTFOLIO_PERFORMANCE } from '@/data/thornton/valuations-data'
import { useContainerWidth } from '@/lib/hooks/useContainerWidth'

const H = 80
const PAD = 16

export function MiniLineChart() {
    const ref = useRef<HTMLDivElement>(null)
    const W = useContainerWidth(ref)

    const data = PORTFOLIO_PERFORMANCE.slice(-6)
    const minVal = Math.min(...data.map(d => d.value)) * 0.98
    const maxVal = Math.max(...data.map(d => d.value)) * 1.02
    const range = maxVal - minVal

    const points = W > 0
        ? data.map((d, i) => ({
            x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
            y: 8 + (H - 16) - ((d.value - minVal) / range) * (H - 16),
        }))
        : []

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

    return (
        <div className="flex flex-col gap-1 flex-1 justify-center">
            <div ref={ref} style={{ width: '100%' }}>
                {W > 0 && (
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
                        <defs>
                            <linearGradient id="home-line-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-card-purple)" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="var(--color-card-purple)" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points={`${points[0].x},${H} ${polyline} ${points[points.length - 1].x},${H}`}
                            fill="url(#home-line-grad)"
                        />
                        <polyline
                            points={polyline}
                            fill="none" stroke="var(--color-card-purple)" strokeWidth={2}
                            strokeLinecap="round" strokeLinejoin="round"
                        />
                        {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="white" stroke="var(--color-card-purple)" strokeWidth={1.5} />
                        ))}
                    </svg>
                )}
            </div>
            <div className="flex justify-between px-2.5">
                {data.map(d => (
                    <span key={d.month} className="text-xs text-[var(--color-neutral-11)]">{d.month}</span>
                ))}
            </div>
        </div>
    )
}
