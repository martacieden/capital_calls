declare module 'd3-force-3d' {
    export function forceCollide(radius?: number | ((node: any) => number)): {
        radius(radius: number | ((node: any) => number)): ReturnType<typeof forceCollide>
        strength(strength: number): ReturnType<typeof forceCollide>
        iterations(iterations: number): ReturnType<typeof forceCollide>
        (alpha: number): void
    }

    export function forceY(y?: number | ((node: any) => number)): {
        y(y: number | ((node: any) => number)): ReturnType<typeof forceY>
        strength(strength: number): ReturnType<typeof forceY>
        (alpha: number): void
    }
}
