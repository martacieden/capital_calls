import type { ReactNode } from 'react'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { IconFocusCentered, IconMap, IconMinus, IconPlus, IconWorld } from '@tabler/icons-react'
import { GeoMap } from '@nivo/geo'
import { geoCentroid, geoNaturalEarth1 } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Feature } from 'geojson'
import type { GeoItem } from '@/data/thornton/valuations-data'
import { fipsForUSStateName } from '@/data/geo/us-state-fips'
import { topoAdminName } from '@/data/geo/world-country-names'

const MAP_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }

interface GeoExposureChartProps {
    data: GeoItem[]
    activeGeoKey?: string | null
    onGeoClick?: (geoKey: string) => void
    /** 1 — вузькі контейнери (сайдпанель); 2 — повноширинні сторінки (за замовчуванням). */
    legendColumns?: 1 | 2
}

const MAP_HEIGHT = 320

/** Поріг руху перед тим як вважати жест перетягуванням (не кліком по країні). */
const PAN_DRAG_THRESHOLD_PX = 6

/** Обмеження зміщення, щоб карта не «зникала» занадто далеко. */
function clampPanOffsetPx(px: number, py: number, width: number, height: number) {
    if (width < 48 || height < 48)
        return { x: px, y: py }
    const lim = Math.max(width, height) * 0.62
    return {
        x: Math.min(Math.max(px, -lim), lim),
        y: Math.min(Math.max(py, -lim), lim),
    }
}

/** Покласти исключення Antarctic — Natural Earth використовує `010`; `260` — Fr. Antarctic Lands near bottom */
const ANTARCTIC_FEATURE_IDS = new Set(['010', '260'])

const TOP_REGIONS_VISIBLE = 5

const MAP_ZOOM_MIN = 1
const MAP_ZOOM_MAX = 3.75

/**
 * Інлайн із референсом: один раз відкривається «слабкий» світ + Північна Америка в фокусі.
 * +/- далі працюють від цього рівня; «World» повертає саме цей кадр.
 */
const DEFAULT_CONTEXT_ZOOM = 1.42

function defaultNorthAmericaFramingPanPx(width: number, height: number) {
    if (width < 64)
        return { x: 0, y: 0 }
    return {
        x: Math.round(-width * 0.052),
        y: Math.round(height * 0.032),
    }
}

/** Країни / території без даних у злитті шару — --color-neutral-3 */
const UNKNOWN_COUNTRY_FILL = '#F0F0F3'

/**
 * Лише кольори з design tokens (tokens.css). Порядок відповідає рангу за value у легенді.
 */
const GEO_EXPOSURE_FILL_PALETTE: string[] = [
    '#003D99',
    '#005BE2',
    '#1E70F4',
    '#3B82F6',
    '#60A5FA',
    '#93C5FD',
    '#BFDBFE',
    '#DBEAFE',
]

function choroplethFillForRow(
    row: { geoKey?: string; value?: number } | undefined,
    fillByGeoKey: Map<string, string>,
): string {
    if (!row?.geoKey || !row.value || row.value <= 0)
        return UNKNOWN_COUNTRY_FILL
    return fillByGeoKey.get(row.geoKey) ?? UNKNOWN_COUNTRY_FILL
}

function canadaProvinceTopoId(canonicalProvinceName: string): string {
    return `ca-${canonicalProvinceName.trim().replace(/\s+/g, '_')}`
}

/**
 * Поєднує межі країн з гранулярними США/канадою. Полігони 840/124 лишаються лише коли є
 * сумарні записи без штатів/провінцій або ще немає шару subdivisions — інакше дублікати.
 */
function mergedMapFeatures(
    countryFeatures: Feature[],
    usStates: Feature[],
    canadaProvinces: Feature[],
    needWholeUnitedStatesFallback: boolean,
    needWholeCanadaFallback: boolean,
): Feature[] {
    const stripUSCountry = usStates.length > 0 && !needWholeUnitedStatesFallback
    const stripCanadaCountry =
        canadaProvinces.length > 0 && !needWholeCanadaFallback
    const filtered = countryFeatures.filter(f => {
        const fid = String((f as { id?: string }).id ?? '')
        if (fid === '840' && stripUSCountry)
            return false
        if (fid === '124' && stripCanadaCountry)
            return false
        return true
    })
    return [...filtered, ...usStates, ...canadaProvinces]
}

function annotateCanadaProvinceFeatures(fc: FeatureCollection): Feature[] {
    return (fc.features ?? []).map(f => {
        const name =
            ((f.properties as { name?: string } | undefined)?.name ?? '').trim()
        const id = name ? canadaProvinceTopoId(name) : ''
        return Object.assign({}, f, { id }) as Feature
    })
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

type RowProps = {
    item: GeoItem
    maxLegendValue: number
    isActive: boolean
    dimmed: boolean
    barColor: string
    onGeoClick?: (geoKey: string) => void
}

const ExposureRow = memo(function ExposureRow({
    item,
    maxLegendValue,
    isActive,
    dimmed,
    barColor,
    onGeoClick,
}: RowProps) {
    const widthPct =
        maxLegendValue > 0 ? (item.value / maxLegendValue) * 100 : 0

    return (
        <div
            role={onGeoClick ? 'button' : undefined}
            tabIndex={onGeoClick ? 0 : undefined}
            onClick={() => onGeoClick?.(item.geoKey)}
            onKeyDown={e => {
                if (!onGeoClick) return
                if (e.key === 'Enter' || e.key === ' ')
                    onGeoClick(item.geoKey)
            }}
            className={`flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors ${onGeoClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-6)] focus-visible:ring-offset-1' : ''} ${dimmed ? 'opacity-45' : ''}`}
        >
            <span
                title={item.label}
                className={`text-xs min-w-0 flex-[1_1_22%] truncate leading-tight ${isActive ? 'font-semibold text-[var(--color-black)]' : 'text-[var(--color-neutral-11)]'}`}
            >
                {item.label}
            </span>
            <div className="flex-[1.45] min-w-[96px] h-2 bg-[var(--color-neutral-3)] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-[width] duration-200"
                        style={{
                            width: `${Math.min(widthPct, 100)}%`,
                            background: barColor,
                        opacity: isActive ? 1 : !dimmed ? 0.82 : 0.45,
                    }}
                />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums leading-tight text-right w-[4.75rem] text-[var(--color-black)]">
                <span className="font-medium">{formatValue(item.value)}</span>
                <span className="text-[var(--color-neutral-9)] font-normal">{` · ${item.percentage}%`}</span>
            </span>
        </div>
    )
})

type ChoroplethRow = {
    id: string
    value: number
    geoKey: string
    label: string
    percentage: number
}

function filterAntarctica(features: Feature[]): Feature[] {
    return features.filter(
        f => !ANTARCTIC_FEATURE_IDS.has(String((f as { id?: string }).id)),
    )
}

function filterEuropeAreaFeatures(features: Feature[]): Feature[] {
    /** Блок приблизно «Європа» через центроїд (виключає масивні полігони з центроїдом у Азії). */
    const west = -32
    const east = 45
    const south = 34
    const north = 72

    return features.filter(f => {
        try {
            const [lng, lat] = geoCentroid(
                f as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
            )
            if (!Number.isFinite(lng) || !Number.isFinite(lat))
                return false
            return lng >= west && lng <= east && lat >= south && lat <= north
        }
        catch {
            return false
        }
    })
}

function featuresForPortfolioIds(features: Feature[], rows: ChoroplethRow[]): Feature[] {
    if (rows.length === 0) return []
    const ids = new Set(rows.map(r => r.id))
    const sub = features.filter(f => ids.has(String((f as { id?: string }).id ?? '')))
    return sub.length > 0 ? sub : []
}

/** Внутрішній inset для fitExtent: більший = сильніше наближає землю всередині в’юпорту */
function clampFitInset(desiredInset: number, width: number, height: number): number {
    if (width < 32 || height < 32)
        return 0
    const maxByW = Math.max(0, width / 2 - 28)
    const maxByH = Math.max(0, height / 2 - 28)
    return Math.min(Math.max(desiredInset, 0), maxByW, maxByH)
}

/** fitExtent множимо scale з центром у середині в’юпорту для Nivo geo (GeoMap). */
function naturalEarthProjectionForNivo(
    featuresForFit: Feature[],
    width: number,
    height: number,
    zoomFactor: number,
    fitInsetPx: number,
): { scale: number; translation: [number, number] } | null {
    if (featuresForFit.length === 0 || width < 64) return null

    const outline: FeatureCollection = {
        type: 'FeatureCollection',
        features: featuresForFit,
    }

    const proj = geoNaturalEarth1().rotate([0, 0, 0])
    const inset = clampFitInset(fitInsetPx, width, height)
    proj.fitExtent(
        [
            [inset, inset],
            [width - inset, height - inset],
        ],
        outline,
    )

    const s0 = proj.scale()
    const [tx0, ty0] = proj.translate()
    const clampedZoom = Math.min(Math.max(zoomFactor, MAP_ZOOM_MIN), MAP_ZOOM_MAX)

    if (clampedZoom === 1) {
        return {
            scale: s0,
            translation: [tx0 / width, ty0 / height] as [number, number],
        }
    }

    const cx = width / 2
    const cy = height / 2
    const invert = proj.invert
    const geoCenter =
        typeof invert === 'function' ? invert.call(proj, [cx, cy]) : null

    proj.scale(s0 * clampedZoom)
    let tx = tx0
    let ty = ty0
    const hasGeoCenter =
        geoCenter != null
        && Number.isFinite(geoCenter[0])
        && Number.isFinite(geoCenter[1])

    if (hasGeoCenter && geoCenter) {
        const projected = proj([geoCenter[0], geoCenter[1]])
        if (projected && Number.isFinite(projected[0]) && Number.isFinite(projected[1])) {
            tx += cx - projected[0]
            ty += cy - projected[1]
            proj.translate([tx, ty])
        }
        else {
            proj.translate([tx0, ty0])
        }
    }
    else {
        proj.translate([tx0, ty0])
    }

    const s1 = proj.scale()
    const [tx1, ty1] = proj.translate()

    return {
        scale: s1,
        translation: [tx1 / width, ty1 / height] as [number, number],
    }
}

function topoNameLookup(features: Feature[]): Map<string, string> {
    const m = new Map<string, string>()
    for (const f of features) {
        const fid = String((f as { id?: string }).id ?? '')
        const name = (f as { properties?: { name?: string } }).properties?.name
        if (fid && name)
            m.set(name, fid)
    }
    return m
}

/** Окремий id на штат / провінцію / ROW-країну; `%` уже з таблиць `GeoItem`. */
function buildSubnationalChoroplethRows(
    data: GeoItem[],
    countryNameToTopoId: Map<string, string>,
): ChoroplethRow[] {
    const rows: ChoroplethRow[] = []

    const usStateFromItem = (item: GeoItem) => item.region ?? item.geoKey.slice(3)

    for (const item of data) {
        if (item.geoKey === 'UNKNOWN' || item.value <= 0)
            continue

        if (item.country === 'United States') {
            if (
                item.geoKey === 'US|__'
                || item.geoKey === 'ROW|United States'
            ) {
                rows.push({
                    id: '840',
                    value: item.value,
                    geoKey: item.geoKey,
                    label: item.label,
                    percentage: item.percentage,
                })
                continue
            }
            const st = usStateFromItem(item)
            if (!st)
                continue
            const fips = fipsForUSStateName(st)
            if (!fips)
                continue
            rows.push({
                id: fips,
                value: item.value,
                geoKey: item.geoKey,
                label: item.label,
                percentage: item.percentage,
            })
            continue
        }

        if (item.country === 'Canada') {
            if (item.geoKey === 'CA|__') {
                rows.push({
                    id: '124',
                    value: item.value,
                    geoKey: item.geoKey,
                    label: item.label,
                    percentage: item.percentage,
                })
                continue
            }
            const prov = item.region ?? item.geoKey.slice(3)
            if (!prov)
                continue
            rows.push({
                id: canadaProvinceTopoId(prov),
                value: item.value,
                geoKey: item.geoKey,
                label: item.label,
                percentage: item.percentage,
            })
            continue
        }

        if (!item.geoKey.startsWith('ROW|'))
            continue

        const topoName = topoAdminName(item.country)
        const tid = countryNameToTopoId.get(topoName)
        if (!tid)
            continue
        rows.push({
            id: tid,
            value: item.value,
            geoKey: item.geoKey,
            label: item.label,
            percentage: item.percentage,
        })
    }

    return rows
}

const ZOOM_STEP = 1.22

/** Кнопки як у дереві / зв’язків */
function mapToolbarButton(opts: {
    onClick: () => void
    title: string
    disabled?: boolean
    children: ReactNode
}) {
    return (
        <button
            type="button"
            className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] text-[var(--color-neutral-11)] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors hover:bg-[var(--color-neutral-2)] disabled:pointer-events-none disabled:opacity-40"
            title={opts.title}
            disabled={opts.disabled}
            onClick={opts.onClick}
        >
            {opts.children}
        </button>
    )
}

export function GeoExposureChart({
    data,
    activeGeoKey,
    onGeoClick,
    legendColumns = 2,
}: GeoExposureChartProps) {
    const [geoFeaturesRaw, setGeoFeaturesRaw] = useState<Feature[]>([])
    const [usStatesRaw, setUsStatesRaw] = useState<Feature[]>([])
    const [canadaProvinceFeaturesRaw, setCanadaProvinceFeaturesRaw] = useState<
        Feature[]
    >([])
    const [mapOuterWidth, setMapOuterWidth] = useState(0)
    const [zoomMultiplier, setZoomMultiplier] = useState(DEFAULT_CONTEXT_ZOOM)
    /** `world` за замовчуванням під референс: увесь світ слабким фоном, NA у фокусі; `portfolio`/`europe` — як кнопки */
    const [extentMode, setExtentMode] = useState<
        'world' | 'portfolio' | 'europe'
    >('world')
    /** Після кліку по області списку або полігону — підганяємо fit під цей регіон */
    const [regionFocusGeoKey, setRegionFocusGeoKey] = useState<string | null>(
        null,
    )
    const mapWrapRef = useRef<HTMLDivElement>(null)

    /** Піксельне зміщення центру карти поверх базової проєкції */
    const [panOffsetPx, setPanOffsetPx] = useState({ x: 0, y: 0 })
    /** Після справжнього drag ігноруємо наступний клік по полігону. */
    const suppressNextMapClickRef = useRef(false)

    type PanDragSession = {
        pointerId: number
        startClientX: number
        startClientY: number
        originPanX: number
        originPanY: number
        dragging: boolean
    }
    const panDragRef = useRef<PanDragSession | null>(null)
    const panOffsetRef = useRef(panOffsetPx)
    panOffsetRef.current = panOffsetPx
    const dimsRef = useRef({ w: mapOuterWidth, h: MAP_HEIGHT })
    const [draggingPan, setDraggingPan] = useState(false)
    const initialScreenshotFramingAppliedRef = useRef(false)

    const geoFeatures = useMemo(
        () => filterAntarctica(geoFeaturesRaw),
        [geoFeaturesRaw],
    )

    /** Штати включають Аляску/Гаваї окремими полігонами (той самий набір Antarctic-фільтру не потребує). */
    const usStateFeatures = usStatesRaw

    useLayoutEffect(() => {
        const el = mapWrapRef.current
        if (!el || typeof ResizeObserver === 'undefined') return

        const ro = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width
            if (w != null) setMapOuterWidth(Math.floor(w))
        })
        ro.observe(el)
        setMapOuterWidth(Math.floor(el.getBoundingClientRect().width))
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        fetch('/countries-50m.json')
            .then(r => r.json())
            .then(topo => {
                const fc = feature(topo, topo.objects.countries) as FeatureCollection
                setGeoFeaturesRaw(fc.features ?? [])
            })
            .catch(console.error)
    }, [])

    useEffect(() => {
        fetch('/states-10m.json')
            .then(r => r.json())
            .then(topo => {
                const fc = feature(topo, topo.objects.states) as FeatureCollection
                setUsStatesRaw(fc.features ?? [])
            })
            .catch(err => {
                console.error(err)
                setUsStatesRaw([])
            })
    }, [])

    useEffect(() => {
        fetch('/canada-provinces.geojson')
            .then(r => r.json())
            .then((fc: FeatureCollection) => {
                setCanadaProvinceFeaturesRaw(annotateCanadaProvinceFeatures(fc))
            })
            .catch(err => {
                console.error(err)
                setCanadaProvinceFeaturesRaw([])
            })
    }, [])

    const nameToId = useMemo(() => topoNameLookup(geoFeatures), [geoFeatures])

    const needWholeUnitedStatesFallback = useMemo(
        () =>
            data.some(
                d =>
                    d.value > 0
                    && (d.geoKey === 'US|__' || d.geoKey === 'ROW|United States'),
            ),
        [data],
    )

    const needWholeCanadaFallback = useMemo(
        () => data.some(d => d.geoKey === 'CA|__' && d.value > 0),
        [data],
    )

    const mergedGeoFeatures = useMemo(
        () =>
            mergedMapFeatures(
                geoFeatures,
                usStateFeatures,
                canadaProvinceFeaturesRaw,
                needWholeUnitedStatesFallback,
                needWholeCanadaFallback,
            ),
        [
            canadaProvinceFeaturesRaw,
            geoFeatures,
            needWholeCanadaFallback,
            needWholeUnitedStatesFallback,
            usStateFeatures,
        ],
    )

    const choroplethData = useMemo(
        () => buildSubnationalChoroplethRows(data, nameToId),
        [data, nameToId],
    )

    const maxLegendValue = useMemo(
        () => Math.max(...data.map(d => d.value), 1),
        [data],
    )
    const idLookup = useMemo(
        () => new Map(choroplethData.map(d => [d.id, d])),
        [choroplethData],
    )

    const geoFillByGeoKey = useMemo(() => {
        const m = new Map<string, string>()
        const ranked = [...choroplethData]
            .filter(r => r.value > 0)
            .sort((a, b) => b.value - a.value)
        ranked.forEach((r, i) => {
            m.set(
                r.geoKey,
                GEO_EXPOSURE_FILL_PALETTE[i % GEO_EXPOSURE_FILL_PALETTE.length]!,
            )
        })
        return m
    }, [choroplethData])

    const topRegionList = useMemo(() => data.slice(0, TOP_REGIONS_VISIBLE), [data])

    const portfolioSubset = useMemo(
        () => featuresForPortfolioIds(mergedGeoFeatures, choroplethData),
        [choroplethData, mergedGeoFeatures],
    )

    const europeSubset = useMemo(
        () => filterEuropeAreaFeatures(geoFeatures),
        [geoFeatures],
    )

    const regionZoomSubset = useMemo(() => {
        if (!regionFocusGeoKey)
            return null
        const row = choroplethData.find(r => r.geoKey === regionFocusGeoKey)
        if (!row)
            return null
        const feats = featuresForPortfolioIds(mergedGeoFeatures, [row])
        return feats.length > 0 ? feats : null
    }, [choroplethData, mergedGeoFeatures, regionFocusGeoKey])

    const projectionFeaturesForFit = useMemo(() => {
        if (regionZoomSubset != null && regionZoomSubset.length > 0)
            return regionZoomSubset
        if (extentMode === 'portfolio' && portfolioSubset.length > 0)
            return portfolioSubset
        if (extentMode === 'europe' && europeSubset.length > 0)
            return europeSubset
        return mergedGeoFeatures
    }, [
        europeSubset,
        extentMode,
        mergedGeoFeatures,
        portfolioSubset,
        regionZoomSubset,
    ])

    const fitInsetPx = useMemo(() => {
        const m = Math.min(mapOuterWidth, MAP_HEIGHT)
        const regionFramed =
            regionZoomSubset != null
            && regionZoomSubset.length > 0
            && projectionFeaturesForFit === regionZoomSubset
        if (regionFramed)
            return Math.round(
                m * Math.min(regionZoomSubset.length <= 4 ? 0.32 : 0.22, 0.42),
            )
        const portfolioFramed =
            extentMode === 'portfolio' && portfolioSubset.length > 0
            && projectionFeaturesForFit === portfolioSubset
        if (portfolioFramed)
            /** Тісний кадр лише там, де є країни з експозицією */
            return Math.round(
                m * Math.min(portfolioSubset.length <= 4 ? 0.32 : 0.22, 0.42),
            )
        if (extentMode === 'europe' && europeSubset.length > 0)
            return Math.round(m * 0.065)
        return 2
    }, [
        europeSubset.length,
        extentMode,
        mapOuterWidth,
        portfolioSubset.length,
        projectionFeaturesForFit,
        regionZoomSubset,
    ])

    useEffect(() => {
        if (!regionFocusGeoKey)
            return
        const row = choroplethData.find(r => r.geoKey === regionFocusGeoKey)
        const feats = row ? featuresForPortfolioIds(mergedGeoFeatures, [row]) : []
        if (!row || feats.length === 0)
            setRegionFocusGeoKey(null)
    }, [choroplethData, mergedGeoFeatures, regionFocusGeoKey])

    const focusGeoOnChart = useCallback(
        (geoKey: string) => {
            const row = choroplethData.find(r => r.geoKey === geoKey)
            const feats = row ? featuresForPortfolioIds(mergedGeoFeatures, [row]) : []
            if (feats.length > 0) {
                setRegionFocusGeoKey(geoKey)
                setZoomMultiplier(z =>
                    Math.min(MAP_ZOOM_MAX, +(z * ZOOM_STEP).toFixed(4)),
                )
                setPanOffsetPx({ x: 0, y: 0 })
            }
            onGeoClick?.(geoKey)
        },
        [choroplethData, mergedGeoFeatures, onGeoClick],
    )

    const zoomInOneStep = useCallback(() => {
        setZoomMultiplier(z =>
            Math.min(MAP_ZOOM_MAX, +(z * ZOOM_STEP).toFixed(4)),
        )
    }, [])

    const mapProjection = useMemo(
        () => naturalEarthProjectionForNivo(
            projectionFeaturesForFit,
            mapOuterWidth,
            MAP_HEIGHT,
            zoomMultiplier,
            fitInsetPx,
        ),
        [projectionFeaturesForFit, mapOuterWidth, zoomMultiplier, fitInsetPx],
    )

    dimsRef.current = { w: mapOuterWidth, h: MAP_HEIGHT }

    const projectionTranslationPan = useMemo((): [number, number] | null => {
        if (!mapProjection || mapOuterWidth < 64) return null
        return [
            mapProjection.translation[0] + panOffsetPx.x / mapOuterWidth,
            mapProjection.translation[1] + panOffsetPx.y / MAP_HEIGHT,
        ]
    }, [mapProjection, mapOuterWidth, panOffsetPx])

    const mapReady =
        geoFeatures.length > 0
        && usStateFeatures.length > 0
        && mergedGeoFeatures.length > 0
        && mapProjection != null
        && mapOuterWidth > 64

    useLayoutEffect(() => {
        if (!mapReady || mapOuterWidth < 64 || initialScreenshotFramingAppliedRef.current)
            return
        if (extentMode !== 'world')
            return
        initialScreenshotFramingAppliedRef.current = true
        setPanOffsetPx(defaultNorthAmericaFramingPanPx(mapOuterWidth, MAP_HEIGHT))
    }, [extentMode, mapOuterWidth, mapReady])

    const finishPanPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const sess = panDragRef.current
        if (!sess || e.pointerId !== sess.pointerId) return
        const host = e.currentTarget
        try {
            if (host.hasPointerCapture(e.pointerId))
                host.releasePointerCapture(e.pointerId)
        }
        catch {
            /* ignore */
        }
        if (sess.dragging)
            suppressNextMapClickRef.current = true
        panDragRef.current = null
        setDraggingPan(false)
    }, [])

    const onMapPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0)
            return
        const t = e.target as HTMLElement | null
        if (t?.closest?.('[data-geo-map-toolbar]'))
            return

        const p = panOffsetRef.current
        panDragRef.current = {
            pointerId: e.pointerId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            originPanX: p.x,
            originPanY: p.y,
            dragging: false,
        }
    }, [])

    const onMapPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const sess = panDragRef.current
        if (!sess || e.pointerId !== sess.pointerId)
            return
        const dx = e.clientX - sess.startClientX
        const dy = e.clientY - sess.startClientY
        if (!sess.dragging) {
            if (Math.hypot(dx, dy) < PAN_DRAG_THRESHOLD_PX)
                return
            sess.dragging = true
            setDraggingPan(true)
            try {
                e.currentTarget.setPointerCapture(e.pointerId)
            }
            catch {
                /* ignore */
            }
        }
        const { w, h } = dimsRef.current
        setPanOffsetPx(
            clampPanOffsetPx(sess.originPanX + dx, sess.originPanY + dy, w, h),
        )
    }, [])

    const onMapPointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            finishPanPointer(e)
        },
        [finishPanPointer],
    )

    const onMapPointerCancel = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            finishPanPointer(e)
        },
        [finishPanPointer],
    )

    const zoomInDisabled = zoomMultiplier >= MAP_ZOOM_MAX - 0.01
    const zoomOutDisabled =
        zoomMultiplier <= MAP_ZOOM_MIN + 0.01

    function handleZoomIn() {
        setZoomMultiplier(z =>
            Math.min(MAP_ZOOM_MAX, +(z * ZOOM_STEP).toFixed(4)),
        )
    }

    function handleZoomOut() {
        setZoomMultiplier(z =>
            Math.max(MAP_ZOOM_MIN, +(z / ZOOM_STEP).toFixed(4)),
        )
    }

    function handleWholeWorld() {
        setRegionFocusGeoKey(null)
        setExtentMode('world')
        setZoomMultiplier(DEFAULT_CONTEXT_ZOOM)
        setPanOffsetPx(
            defaultNorthAmericaFramingPanPx(dimsRef.current.w, MAP_HEIGHT),
        )
    }

    function handlePortfolioArea() {
        if (portfolioSubset.length === 0) return
        setRegionFocusGeoKey(null)
        setExtentMode('portfolio')
        setZoomMultiplier(MAP_ZOOM_MIN)
        setPanOffsetPx({ x: 0, y: 0 })
    }

    function handleEuropeSection() {
        if (europeSubset.length === 0) return
        setRegionFocusGeoKey(null)
        setExtentMode('europe')
        setZoomMultiplier(MAP_ZOOM_MIN)
        setPanOffsetPx({ x: 0, y: 0 })
    }

    return (
        <div className="flex flex-col gap-5 min-h-0">
            <div
                ref={mapWrapRef}
                className={`relative w-full overflow-visible touch-none select-none ${
                    draggingPan ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ height: MAP_HEIGHT }}
                onPointerDown={onMapPointerDown}
                onPointerMove={onMapPointerMove}
                onPointerUp={onMapPointerUp}
                onPointerCancel={onMapPointerCancel}
            >
                {mapReady ? (
                    <div
                        className="absolute top-2 right-2 z-20 flex flex-col gap-1"
                        role="toolbar"
                        aria-label="Map controls"
                        data-geo-map-toolbar
                        onPointerDown={e => e.stopPropagation()}
                    >
                        {mapToolbarButton({
                            title: 'Zoom in',
                            onClick: handleZoomIn,
                            disabled: zoomInDisabled,
                            children: <IconPlus size={16} stroke={2} />,
                        })}
                        {mapToolbarButton({
                            title: 'Zoom out',
                            onClick: handleZoomOut,
                            disabled: zoomOutDisabled,
                            children: <IconMinus size={16} stroke={2} />,
                        })}
                        {mapToolbarButton({
                            title: 'Zoom to holdings geography',
                            onClick: handlePortfolioArea,
                            disabled: portfolioSubset.length === 0,
                            children: <IconFocusCentered size={16} stroke={2} />,
                        })}
                        {mapToolbarButton({
                            title: 'Europe view',
                            onClick: handleEuropeSection,
                            disabled: europeSubset.length === 0,
                            children: <IconMap size={16} stroke={2} />,
                        })}
                        {mapToolbarButton({
                            title: 'Default view (world + Americas focus)',
                            onClick: handleWholeWorld,
                            children: <IconWorld size={16} stroke={2} />,
                        })}
                    </div>
                ) : null}
                {!mapReady ? (
                    <div className="h-full flex items-center justify-center text-sm text-[var(--color-neutral-9)]">
                        Loading map…
                    </div>
                ) : (
                    <GeoMap
                        width={mapOuterWidth}
                        height={MAP_HEIGHT}
                        features={mergedGeoFeatures}
                        margin={MAP_MARGIN}
                        projectionType="naturalEarth1"
                        projectionScale={mapProjection.scale}
                        projectionTranslation={
                            projectionTranslationPan ?? mapProjection.translation
                        }
                        projectionRotation={[0, 0, 0]}
                        fillColor={(f: Feature) =>
                            choroplethFillForRow(
                                idLookup.get(
                                    String((f as { id?: string }).id ?? ''),
                                ),
                                geoFillByGeoKey,
                            )}
                        borderWidth={0.5}
                        borderColor="#E8E8EC"
                        enableGraticule={false}
                        theme={{
                            background: 'transparent',
                        }}
                        onClick={mappedFeature => {
                            if (suppressNextMapClickRef.current) {
                                suppressNextMapClickRef.current = false
                                return
                            }
                            if (mappedFeature == null) {
                                zoomInOneStep()
                                return
                            }
                            const fid = String(
                                (mappedFeature as { id?: string }).id ?? '',
                            )
                            const row = idLookup.get(fid)
                            if (row?.geoKey) {
                                focusGeoOnChart(row.geoKey)
                                return
                            }
                            zoomInOneStep()
                        }}
                        tooltip={({ feature: f }) => {
                            const fid = String((f as { id?: string }).id ?? '')
                            const row = idLookup.get(fid)
                            const pname =
                                (f.properties as { name?: string } | undefined)?.name
                                ?? 'Region'

                            if (!row?.value || row.value <= 0) {
                                return (
                                    <div className="bg-white border border-[var(--color-neutral-4)] rounded-lg px-3 py-2 shadow text-sm text-[var(--color-neutral-10)] max-w-[min(280px,90vw)]">
                                        <span className="font-medium text-[var(--color-black)]">{pname}</span>
                                        <span className="text-[var(--color-neutral-9)]"> · </span>
                                        <span>No exposure</span>
                                    </div>
                                )
                            }

                            return (
                                <div className="bg-white border border-[var(--color-neutral-4)] rounded-lg px-3 py-2 shadow-md text-sm max-w-[min(300px,92vw)]">
                                    <div className="font-semibold text-[var(--color-black)]">{row.label}</div>
                                    <div className="text-[var(--color-neutral-10)] mt-0.5 tabular-nums">
                                        {formatValue(row.value)}
                                        {' · '}
                                        {row.percentage}%
                                    </div>
                                </div>
                            )
                        }}
                    />
                )}
            </div>

            <div className="flex flex-col gap-2 min-h-0">
                <ul
                    className={`grid gap-x-[var(--spacing-7)] gap-y-px m-0 p-0 list-none min-h-0 ${
                        legendColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}
                >
                    {topRegionList.map(item => {
                        const isActive = item.geoKey === activeGeoKey
                        const dimmed = !!activeGeoKey && !isActive
                        return (
                            <li key={item.geoKey} className="min-w-0">
                                <ExposureRow
                                    item={item}
                                    maxLegendValue={maxLegendValue}
                                    isActive={isActive}
                                    dimmed={dimmed}
                                    barColor={
                                        geoFillByGeoKey.get(item.geoKey) ??
                                        UNKNOWN_COUNTRY_FILL
                                    }
                                    onGeoClick={focusGeoOnChart}
                                />
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
