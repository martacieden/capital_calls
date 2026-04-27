import { useRef } from 'react'
import { useContainerWidth } from '@/lib/hooks/useContainerWidth'

const FONT = 'Inter, sans-serif'
const H = 100

const L0_H = 24, L1_Y = 46, L1_H = 22, L2_Y = 82, L2_H = 16
const CONN_Y = 36, CONN2_Y = 75

export function MiniHierarchyChart() {
    const ref = useRef<HTMLDivElement>(null)
    const W = useContainerWidth(ref)

    const colCenters = [W / 6, W / 2, 5 * W / 6]
    const colW = W / 3

    const l1W = Math.max(Math.min(colW - 16, 90), 52)
    const l2W = Math.max(Math.min((colW - 8) / 2 - 2, 46), 28)
    const l2Offset = l2W / 2 + 2

    const s = W / 300
    const f0 = Math.max(Math.round(10 * s), 7)
    const f1 = Math.max(Math.round(9 * s), 6)
    const f2 = Math.max(Math.round(7 * s), 5)

    return (
        <div ref={ref} style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
            {W > 0 && (
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                    <rect x={W / 2 - 40} y={0} width={80} height={L0_H} rx={8} fill="var(--color-blue-9)" />
                    <text x={W / 2} y={15.5} textAnchor="middle" fill="white" fontSize={f0} fontFamily={FONT} fontWeight={600}>Grantor</text>
                    <path
                        d={`M${W / 2} ${L0_H} L${W / 2} ${CONN_Y} M${colCenters[0]} ${CONN_Y} L${colCenters[2]} ${CONN_Y} M${colCenters[0]} ${CONN_Y} L${colCenters[0]} ${L1_Y} M${colCenters[1]} ${CONN_Y} L${colCenters[1]} ${L1_Y} M${colCenters[2]} ${CONN_Y} L${colCenters[2]} ${L1_Y}`}
                        fill="none" stroke="var(--color-blue-9)" strokeWidth={1.2}
                    />
                    {(['Family Trust', 'Holding Entity', 'Beneficiary'] as const).map((label, i) => {
                        const cx = colCenters[i]
                        return (
                            <g key={label}>
                                <rect x={cx - l1W / 2} y={L1_Y} width={l1W} height={L1_H} rx={7} fill="var(--color-blue-1)" stroke="var(--color-blue-9)" strokeWidth={1} />
                                <text x={cx} y={L1_Y + 14} textAnchor="middle" fill="var(--color-blue-dark)" fontSize={f1} fontFamily={FONT} fontWeight={500}>{label}</text>
                            </g>
                        )
                    })}
                    {colCenters.map((cx) => (
                        <path key={cx}
                            d={`M${cx} ${L1_Y + L1_H} L${cx} ${CONN2_Y} M${cx - l2Offset} ${CONN2_Y} L${cx + l2Offset} ${CONN2_Y} M${cx - l2Offset} ${CONN2_Y} L${cx - l2Offset} ${L2_Y} M${cx + l2Offset} ${CONN2_Y} L${cx + l2Offset} ${L2_Y}`}
                            fill="none" stroke="var(--color-blue-9)" strokeWidth={1}
                        />
                    ))}
                    {([
                        [colCenters[0] - l2Offset, 'Revocable'],
                        [colCenters[0] + l2Offset, 'Dynasty'],
                        [colCenters[1] - l2Offset, 'Holdings'],
                        [colCenters[1] + l2Offset, 'Ventures'],
                        [colCenters[2] - l2Offset, 'Andrew'],
                        [colCenters[2] + l2Offset, 'Sarah'],
                    ] as [number, string][]).map(([cx, label]) => (
                        <g key={label}>
                            <rect x={cx - l2W / 2} y={L2_Y} width={l2W} height={L2_H} rx={4} fill="var(--color-blue-1)" stroke="var(--color-blue-9)" strokeWidth={0.8} />
                            <text x={cx} y={L2_Y + 11} textAnchor="middle" fill="var(--color-blue-dark)" fontSize={f2} fontFamily={FONT} fontWeight={500}>{label}</text>
                        </g>
                    ))}
                </svg>
            )}
        </div>
    )
}
