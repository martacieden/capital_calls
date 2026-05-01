declare module 'topojson-client' {
    import type { FeatureCollection } from 'geojson'

    export function feature(topology: unknown, object: unknown): FeatureCollection
}
